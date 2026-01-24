export const DEFAULT_ANIMATION_DURATION = 15;
export const BASE_SHAPE_SIZE = 50;

export const normalizeNumber = (value, fallback) => {
  if (value === null || value === undefined || value === "") return fallback;
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
};

export const normalizeTransition = (transition = {}) => {
  const width =
    transition.width === null || transition.width === undefined
      ? transition.width
      : normalizeNumber(transition.width, transition.width);
  const height =
    transition.height === null || transition.height === undefined
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

export const normalizeObject = (obj = {}) => {
  const transitions = Array.isArray(obj.transitions) ? obj.transitions : [];
  const normalizedTransitions = transitions
    .map(normalizeTransition)
    .sort((a, b) => a.startTime - b.startTime);
  const children = Array.isArray(obj.children)
    ? obj.children.map(normalizeObject)
    : [];

  return {
    ...obj,
    transitions: normalizedTransitions,
    children
  };
};

export const deriveDurationFromObjects = (objects = []) => {
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

export const normalizeAnimation = (animation = {}) => {
  const normalizedObjects = Array.isArray(animation.objects)
    ? animation.objects.map(normalizeObject)
    : [];
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

  return {
    ...animation,
    objects: normalizedObjects,
    duration,
    durationOverride,
    derivedDuration,
    effectiveDuration,
    connections,
    canvasWidth,
    canvasHeight
  };
};

export const getCanvasTransform = (animation, canvas) => {
  if (!animation || !canvas) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }

  const sourceWidth = normalizeNumber(animation.canvasWidth, null);
  const sourceHeight = normalizeNumber(animation.canvasHeight, null);

  if (!sourceWidth || !sourceHeight) {
    return { scale: 1, offsetX: 0, offsetY: 0 };
  }

  const scaleX = canvas.width / sourceWidth;
  const scaleY = canvas.height / sourceHeight;
  const scale = Math.min(scaleX, scaleY);

  const offsetX = (canvas.width - sourceWidth * scale) / 2;
  const offsetY = (canvas.height - sourceHeight * scale) / 2;

  return { scale, offsetX, offsetY };
};

export const lerp = (from, to, t) => {
  if (from === undefined || from === null) return to;
  if (to === undefined || to === null) return from;
  return from + (to - from) * t;
};

export const applyEasing = (t, easing) => {
  switch (easing) {
    case "ease-in":
      return t * t;
    case "ease-out":
      return t * (2 - t);
    case "ease-in-out":
      return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    case "bounce":
      return Math.sin(t * Math.PI);
    default:
      return t;
  }
};

export const getObjectStateAtTime = (obj, time) => {
  if (!obj?.transitions || obj.transitions.length === 0) return null;

  const transitions = obj.transitions.slice().sort((a, b) => a.startTime - b.startTime);

  if (time < transitions[0].startTime) {
    return { ...transitions[0], opacity: 0 };
  }

  const lastIndex = transitions.length - 1;
  const last = transitions[lastIndex];
  if (time >= last.startTime + (last.duration || 0)) {
    return last;
  }

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
    if (time >= start && time < nextStart) {
      return transition;
    }
  }

  return null;
};

const transformPoint = (x, y, parentState) => {
  const scale = parentState?.scale ?? 1;
  const rotation = (parentState?.rotation ?? 0) * (Math.PI / 180);
  const cos = Math.cos(rotation);
  const sin = Math.sin(rotation);
  const sx = (x ?? 0) * scale;
  const sy = (y ?? 0) * scale;
  const rx = sx * cos - sy * sin;
  const ry = sx * sin + sy * cos;
  return {
    x: (parentState?.x ?? 0) + rx,
    y: (parentState?.y ?? 0) + ry
  };
};

export const composeChildState = (childState, parentState) => {
  if (!childState || !parentState) return null;
  const point = transformPoint(childState.x ?? 0, childState.y ?? 0, parentState);
  return {
    ...childState,
    x: point.x,
    y: point.y,
    scale: (childState.scale ?? 1) * (parentState.scale ?? 1),
    rotation: (childState.rotation ?? 0) + (parentState.rotation ?? 0),
    opacity: (childState.opacity ?? 1) * (parentState.opacity ?? 1)
  };
};

export const getCompoundStatesAtTime = (obj, time) => {
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
