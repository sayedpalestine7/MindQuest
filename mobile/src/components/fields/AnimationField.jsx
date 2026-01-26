import React, { useEffect, useMemo, useRef, useState } from 'react';
import { View, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { Image } from 'expo-image';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { WebView } from 'react-native-webview';
import { apiClient } from '../../api/client';
import { getImageUrl } from '../../utils/imageUtils';

const isLikelyAnimationId = (value) => typeof value === 'string' && /^[a-f0-9]{24}$/i.test(value);

const resolveAnimationUrl = (content, field) => {
  if (typeof content === 'string') {
    if (isLikelyAnimationId(content)) return null;
    return content;
  }

  const contentUrl =
    content?.animationUrl ||
    content?.videoUrl ||
    content?.mp4Url ||
    content?.gifUrl ||
    content?.previewUrl ||
    content?.downloadUrl ||
    content?.url ||
    content?.src ||
    content?.file?.url ||
    content?.media?.url ||
    content?.asset?.url;

  if (contentUrl) return contentUrl;

  return (
    field?.animationUrl ||
    field?.videoUrl ||
    field?.mp4Url ||
    field?.gifUrl ||
    field?.previewUrl ||
    field?.downloadUrl ||
    field?.content?.url ||
    field?.content?.src
  );
};

const inferMediaType = (url) => {
  if (!url) return 'video';
  const normalized = url.toLowerCase();
  if (normalized.startsWith('data:image/gif')) return 'gif';
  if (normalized.endsWith('.gif')) return 'gif';
  return 'video';
};

const buildAnimationHtml = (animation) => {
  const payload = JSON.stringify(animation || {});
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0" />
  <style>
    html, body { margin: 0; padding: 0; width: 100%; height: 100%; background: #0f172a; overflow: hidden; }
    #canvas { width: 100%; height: 100%; display: block; background: #0f172a; }
  </style>
</head>
<body>
  <canvas id="canvas"></canvas>
  <script>
    const BASE_SHAPE_SIZE = 50;
    const DEFAULT_ANIMATION_DURATION = 15;
    const animationInput = ${payload};

    const normalizeNumber = (value, fallback) => {
      if (value === null || value === undefined || value === "") return fallback;
      const num = Number(value);
      return Number.isFinite(num) ? num : fallback;
    };

    const normalizeTransition = (transition = {}) => {
      const width = transition.width === null || transition.width === undefined
        ? transition.width
        : normalizeNumber(transition.width, transition.width);
      const height = transition.height === null || transition.height === undefined
        ? transition.height
        : normalizeNumber(transition.height, transition.height);

      return {
        startTime: normalizeNumber(transition.startTime, 0),
        duration: Math.max(0, normalizeNumber(transition.duration, 0)),
        x: normalizeNumber(transition.x, 0),
        y: normalizeNumber(transition.y, 0),
        width,
        height,
        scale: normalizeNumber(transition.scale, 1),
        rotation: normalizeNumber(transition.rotation, 0),
        opacity: normalizeNumber(transition.opacity, 1),
        color: transition.color,
        fillColor: transition.fillColor ?? null,
        strokeColor: transition.strokeColor ?? null,
        borderWidth: normalizeNumber(transition.borderWidth, 2),
        openTop: Boolean(transition.openTop),
        text: transition.text ?? "",
        easing: transition.easing || "linear"
      };
    };

    const normalizeObject = (obj = {}) => {
      const transitions = Array.isArray(obj.transitions) ? obj.transitions : [];
      const normalizedTransitions = transitions.map(normalizeTransition).sort((a, b) => a.startTime - b.startTime);
      const children = Array.isArray(obj.children) ? obj.children.map(normalizeObject) : [];
      return { ...obj, transitions: normalizedTransitions, children };
    };

    const deriveDurationFromObjects = (objects = []) => {
      if (!Array.isArray(objects)) return 0;
      return objects.reduce((maxDuration, obj) => {
        if (!obj?.transitions || obj.transitions.length === 0) return maxDuration;
        const objectMax = obj.transitions.reduce((objectMaxDuration, transition) => {
          const endTime = normalizeNumber(transition.startTime, 0) + normalizeNumber(transition.duration, 0);
          return Math.max(objectMaxDuration, endTime);
        }, 0);
        return Math.max(maxDuration, objectMax);
      }, 0);
    };

    const normalizeAnimation = (animation = {}) => {
      const normalizedObjects = Array.isArray(animation.objects) ? animation.objects.map(normalizeObject) : [];
      const derivedDuration = deriveDurationFromObjects(normalizedObjects);
      const durationOverride =
        animation.durationOverride === null || animation.durationOverride === undefined
          ? null
          : normalizeNumber(animation.durationOverride, null);
      const fallbackDuration = normalizeNumber(animation.duration, DEFAULT_ANIMATION_DURATION);
      const duration = derivedDuration > 0 ? derivedDuration : fallbackDuration;
      const effectiveDuration = durationOverride ?? duration;

      const connections = Array.isArray(animation.connections)
        ? animation.connections.map((connection) => ({
            fromId: connection?.fromId,
            toId: connection?.toId,
            color: connection?.color || "#facc15",
            width: normalizeNumber(connection?.width, 2)
          }))
        : [];

      const canvasWidth = normalizeNumber(animation.canvasWidth, null);
      const canvasHeight = normalizeNumber(animation.canvasHeight, null);

      return { ...animation, objects: normalizedObjects, duration, durationOverride, derivedDuration, effectiveDuration, connections, canvasWidth, canvasHeight };
    };

    const getCanvasTransform = (animation, canvas) => {
      if (!animation || !canvas) return { scale: 1, offsetX: 0, offsetY: 0 };
      const sourceWidth = normalizeNumber(animation.canvasWidth, null);
      const sourceHeight = normalizeNumber(animation.canvasHeight, null);
      if (!sourceWidth || !sourceHeight) return { scale: 1, offsetX: 0, offsetY: 0 };
      const scaleX = canvas.width / sourceWidth;
      const scaleY = canvas.height / sourceHeight;
      const scale = Math.min(scaleX, scaleY);
      const offsetX = (canvas.width - sourceWidth * scale) / 2;
      const offsetY = (canvas.height - sourceHeight * scale) / 2;
      return { scale, offsetX, offsetY };
    };

    const lerp = (from, to, t) => {
      if (from === undefined || from === null) return to;
      if (to === undefined || to === null) return from;
      return from + (to - from) * t;
    };

    const applyEasing = (t, easing) => {
      switch (easing) {
        case "ease-in": return t * t;
        case "ease-out": return t * (2 - t);
        case "ease-in-out": return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
        case "bounce": return Math.sin(t * Math.PI);
        default: return t;
      }
    };

    const getObjectStateAtTime = (obj, time) => {
      if (!obj?.transitions || obj.transitions.length === 0) return null;
      const transitions = obj.transitions.slice().sort((a, b) => a.startTime - b.startTime);
      if (time < transitions[0].startTime) return { ...transitions[0], opacity: 0 };
      const last = transitions[transitions.length - 1];
      if (time >= last.startTime + (last.duration || 0)) return last;

      for (let i = 0; i < transitions.length; i++) {
        const transition = transitions[i];
        const start = transition.startTime;
        const duration = transition.duration || 0;
        const end = start + duration;
        if (duration > 0 && time >= start && time <= end) {
          const from = transition;
          const to = transitions[i + 1] || transition;
          const rawProgress = (time - start) / duration;
          const progress = Math.max(0, Math.min(1, rawProgress));
          const easing = from.easing || to.easing || "linear";
          const eased = applyEasing(progress, easing);
          return {
            x: lerp(from.x, to.x, eased),
            y: lerp(from.y, to.y, eased),
            width: from.width !== undefined ? lerp(from.width, to.width, eased) : to.width,
            height: from.height !== undefined ? lerp(from.height, to.height, eased) : to.height,
            scale: lerp(from.scale ?? 1, to.scale ?? 1, eased),
            rotation: lerp(from.rotation ?? 0, to.rotation ?? 0, eased),
            opacity: lerp(from.opacity ?? 1, to.opacity ?? 1, eased),
            color: to.color ?? from.color,
            fillColor: to.fillColor ?? from.fillColor ?? null,
            strokeColor: to.strokeColor ?? from.strokeColor ?? null,
            borderWidth: lerp(from.borderWidth ?? 2, to.borderWidth ?? 2, eased),
            openTop: to.openTop ?? from.openTop ?? false,
            text: to.text ?? from.text ?? ""
          };
        }
        const nextStart = transitions[i + 1] ? transitions[i + 1].startTime : Infinity;
        if (time >= start && time < nextStart) return transition;
      }
      return null;
    };

    const composeChildState = (childState, parentState) => {
      if (!childState || !parentState) return null;
      const scale = parentState.scale ?? 1;
      const rotation = (parentState.rotation ?? 0) * Math.PI / 180;
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const sx = (childState.x ?? 0) * scale;
      const sy = (childState.y ?? 0) * scale;
      const rx = sx * cos - sy * sin;
      const ry = sx * sin + sy * cos;
      return {
        ...childState,
        x: (parentState.x ?? 0) + rx,
        y: (parentState.y ?? 0) + ry,
        scale: (childState.scale ?? 1) * (parentState.scale ?? 1),
        rotation: (childState.rotation ?? 0) + (parentState.rotation ?? 0),
        opacity: (childState.opacity ?? 1) * (parentState.opacity ?? 1)
      };
    };

    const getCompoundStatesAtTime = (obj, time) => {
      if (!obj) return null;
      const parentState = getObjectStateAtTime(obj, time);
      if (!parentState) return null;
      if (!Array.isArray(obj.children) || obj.children.length === 0) {
        return { parent: parentState, children: [] };
      }
      const children = obj.children
        .map((child) => {
          const childState = getObjectStateAtTime(child, time);
          return composeChildState(childState, parentState);
        })
        .filter(Boolean);
      return { parent: parentState, children };
    };

    const animation = normalizeAnimation(animationInput);
    const canvas = document.getElementById("canvas");
    const ctx = canvas.getContext("2d");

    const resizeCanvas = () => {
      const { innerWidth, innerHeight, devicePixelRatio } = window;
      const dpr = devicePixelRatio || 1;
      canvas.width = innerWidth * dpr;
      canvas.height = innerHeight * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener("resize", resizeCanvas);
    resizeCanvas();

    const drawArrow = (from, to, color = "#facc15", width = 2) => {
      const headLength = 10;
      const dx = to.x - from.x;
      const dy = to.y - from.y;
      const angle = Math.atan2(dy, dx);
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.beginPath();
      ctx.moveTo(from.x, from.y);
      ctx.lineTo(to.x, to.y);
      ctx.stroke();
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.moveTo(to.x, to.y);
      ctx.lineTo(to.x - headLength * Math.cos(angle - Math.PI / 6), to.y - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(to.x - headLength * Math.cos(angle + Math.PI / 6), to.y - headLength * Math.sin(angle + Math.PI / 6));
      ctx.closePath();
      ctx.fill();
    };

    const drawShape = (shapeType, state) => {
      if (!state || state.opacity <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity ?? 1));
      ctx.fillStyle = (state.fillColor ?? state.color) || "#3b82f6";
      ctx.strokeStyle = (state.strokeColor ?? state.color) || "#3b82f6";

      const x = state.x ?? 0;
      const y = state.y ?? 0;
      const scale = state.scale ?? 1;
      const size = BASE_SHAPE_SIZE * scale;

      ctx.translate(x, y);
      if (state.rotation) ctx.rotate((state.rotation * Math.PI) / 180);

      switch (shapeType) {
        case "circle":
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") {
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2;
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        case "square":
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") {
            ctx.fillRect(-size / 2, -size / 2, size, size);
          }
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2;
            ctx.strokeRect(-size / 2, -size / 2, size, size);
          }
          break;
        case "triangle":
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.closePath();
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") ctx.fill();
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2;
            ctx.stroke();
          }
          break;
        case "rectangle": {
          const w = (state.width ?? 100) * scale;
          const h = (state.height ?? 60) * scale;
          if ((state.fillColor ?? state.color) && state.fillColor !== "transparent") {
            ctx.fillRect(-w / 2, -h / 2, w, h);
          }
          if (state.strokeColor) {
            ctx.lineWidth = state.borderWidth ?? 2;
            ctx.beginPath();
            ctx.rect(-w / 2, -h / 2, w, h);
            ctx.stroke();
            if (state.openTop) {
              ctx.clearRect(-w / 2 - 1, -h / 2 - 1, w + 2, (state.borderWidth ?? 2) + 2);
            }
          }
          break;
        }
        case "text":
          ctx.fillStyle = state.color || "#ffffff";
          ctx.font = "16px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(state.text || "", 0, 0);
          break;
        default:
          break;
      }

      ctx.restore();
    };

    let currentTime = 0;
    let lastTimestamp = null;

    const renderFrame = () => {
      const duration = animation?.effectiveDuration || animation?.duration || DEFAULT_ANIMATION_DURATION;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.fillStyle = "#0f172a";
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const { scale, offsetX, offsetY } = getCanvasTransform(animation, canvas);
      ctx.save();
      ctx.translate(offsetX, offsetY);
      ctx.scale(scale, scale);

      // If slideData is present, draw connections scoped to the active slide; otherwise draw global connections
      const slideData = animation.slideData;
      if (slideData && Array.isArray(slideData.slides) && slideData.slides.length > 0) {
        // determine current slide index by accumulated durations
        let acc = 0;
        const totalSlideDuration = slideData.slides.reduce((s, sl) => s + (sl.duration || 1), 0);
        const t = totalSlideDuration > 0 ? (currentTime % (animation.effectiveDuration || animation.duration || totalSlideDuration)) : 0;
        let slideIdx = 0;
        for (let i = 0; i < slideData.slides.length; i++) {
          const d = slideData.slides[i].duration || 1;
          if (t >= acc && t < acc + d) {
            slideIdx = i;
            break;
          }
          acc += d;
        }
        const slideConns = (slideData.slides[slideIdx] && Array.isArray(slideData.slides[slideIdx].connections)) ? slideData.slides[slideIdx].connections : [];
        slideConns.forEach((conn) => {
          const fromObj = (slideData.slides[slideIdx].objects || []).find((obj) => obj.id === conn.fromId) || animation.objects.find((obj) => obj.id === conn.fromId);
          const toObj = (slideData.slides[slideIdx].objects || []).find((obj) => obj.id === conn.toId) || animation.objects.find((obj) => obj.id === conn.toId);
          if (!fromObj || !toObj) return;
          const fromState = fromObj.transitions ? getObjectStateAtTime(fromObj, currentTime) : { x: fromObj.x ?? 0, y: fromObj.y ?? 0 };
          const toState = toObj.transitions ? getObjectStateAtTime(toObj, currentTime) : { x: toObj.x ?? 0, y: toObj.y ?? 0 };
          drawArrow({ x: fromState.x ?? 0, y: fromState.y ?? 0 }, { x: toState.x ?? 0, y: toState.y ?? 0 }, conn.color || "#facc15", conn.width || 2);
        });
      } else if (Array.isArray(animation.connections)) {
        animation.connections.forEach((conn) => {
          const fromObj = animation.objects.find((obj) => obj.id === conn.fromId);
          const toObj = animation.objects.find((obj) => obj.id === conn.toId);
          if (!fromObj || !toObj) return;
          const fromState = getObjectStateAtTime(fromObj, currentTime);
          const toState = getObjectStateAtTime(toObj, currentTime);
          if (!fromState || !toState) return;
          drawArrow({ x: fromState.x ?? 0, y: fromState.y ?? 0 }, { x: toState.x ?? 0, y: toState.y ?? 0 }, conn.color || "#facc15", conn.width || 2);
        });
      }

      animation.objects.forEach((obj) => {
        if (obj.children?.length) {
          const compound = getCompoundStatesAtTime(obj, currentTime);
          if (!compound) return;
          obj.children.forEach((child, index) => drawShape(child.type, compound.children[index]));
          return;
        }
        const state = getObjectStateAtTime(obj, currentTime);
        if (!state) return;
        drawShape(obj.type, state);
      });

      ctx.restore();
    };

    const animate = (timestamp) => {
      if (!lastTimestamp) lastTimestamp = timestamp;
      const deltaSec = (timestamp - lastTimestamp) / 1000;
      lastTimestamp = timestamp;
      const duration = animation?.effectiveDuration || animation?.duration || DEFAULT_ANIMATION_DURATION;
      currentTime = duration > 0 ? (currentTime + deltaSec) % duration : 0;
      renderFrame();
      requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  </script>
</body>
</html>`;
};

export default function AnimationField({ content, field }) {
  const [mediaLoading, setMediaLoading] = useState(true);
  const [webLoading, setWebLoading] = useState(true);
  const [error, setError] = useState(false);
  const [animationData, setAnimationData] = useState(null);
  const [animationError, setAnimationError] = useState(null);
  const videoRef = useRef(null);

  const animationId = useMemo(() => {
    if (field?.animationId) return field.animationId;
    if (typeof content === 'string' && isLikelyAnimationId(content)) return content;
    return null;
  }, [content, field]);

  const animationUrl = useMemo(() => resolveAnimationUrl(content, field), [content, field]);
  const fullAnimationUrl = getImageUrl(animationUrl);
  const mediaType = inferMediaType(fullAnimationUrl || animationUrl);

  useEffect(() => {
    let isMounted = true;

    const fetchAnimation = async () => {
      if (!animationId || animationUrl) return;
      setAnimationError(null);
      setWebLoading(true);
      try {
        const response = await apiClient.get(`/animations/${animationId}`);
        if (!isMounted) return;
        setAnimationData(response.data);
      } catch (fetchError) {
        if (!isMounted) return;
        setAnimationError(fetchError);
      } finally {
        if (isMounted) {
          setWebLoading(false);
        }
      }
    };

    fetchAnimation();
    return () => {
      isMounted = false;
    };
  }, [animationId, animationUrl]);

  const handleVideoStatus = (status) => {
    if (status.isLoaded) {
      setMediaLoading(false);
    } else if (status.error) {
      setMediaLoading(false);
      setError(true);
      console.error('Video error:', status.error);
    }
  };

  const showWebView = !animationUrl && animationData;
  const htmlContent = useMemo(() => (animationData ? buildAnimationHtml(animationData) : null), [animationData]);

  if (!animationUrl && !animationData && !animationId) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Animation URL not available</Text>
      </View>
    );
  }

  if (animationError) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load animation</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle" size={48} color="#ef4444" />
        <Text style={styles.errorText}>Failed to load animation</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.videoWrapper}>
        {showWebView ? (
          <WebView
            source={{ html: htmlContent }}
            style={styles.video}
            onLoadStart={() => setWebLoading(true)}
            onLoadEnd={() => setWebLoading(false)}
            javaScriptEnabled
            domStorageEnabled
            originWhitelist={['*']}
          />
        ) : mediaType === 'gif' ? (
          <Image
            source={{ uri: fullAnimationUrl }}
            style={styles.video}
            contentFit="contain"
            transition={200}
            cachePolicy="memory-disk"
            onLoadStart={() => setMediaLoading(true)}
            onLoadEnd={() => setMediaLoading(false)}
            onError={() => {
              setMediaLoading(false);
              setError(true);
            }}
          />
        ) : (
          <Video
            ref={videoRef}
            source={{ uri: fullAnimationUrl }}
            style={styles.video}
            resizeMode={ResizeMode.CONTAIN}
            shouldPlay
            isLooping
            onPlaybackStatusUpdate={handleVideoStatus}
            useNativeControls={false}
          />
        )}

        {(showWebView ? webLoading : mediaLoading) && (
          <View style={styles.loadingOverlay}>
            <ActivityIndicator size="large" color="#6366f1" />
          </View>
        )}
      </View>

      <View style={styles.labelContainer}>
        <Ionicons name="film" size={16} color="#6366f1" />
        <Text style={styles.label}>Animation</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginVertical: 12,
  },
  videoWrapper: {
    width: '100%',
    aspectRatio: 16 / 9,
    backgroundColor: '#000',
    borderRadius: 12,
    overflow: 'hidden',
    position: 'relative',
  },
  video: {
    width: '100%',
    height: '100%',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  label: {
    fontSize: 14,
    color: '#6366f1',
    fontWeight: '600',
  },
  errorContainer: {
    padding: 32,
    backgroundColor: '#f3f4f6',
    borderRadius: 12,
    alignItems: 'center',
    gap: 12,
    marginVertical: 12,
  },
  errorText: {
    fontSize: 14,
    color: '#6b7280',
    textAlign: 'center',
  },
});
