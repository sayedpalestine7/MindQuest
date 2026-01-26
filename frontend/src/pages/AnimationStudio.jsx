import React, { useState, useRef, useEffect, useMemo } from 'react';
import { Play, Pause, Square, Circle, Triangle, Save, Trash2, X, Plus, FolderOpen, Layers, GitBranch, Eye, EyeOff, ChevronLeft, ChevronRight, Copy, Brain } from 'lucide-react';
import axios from 'axios';
import AnimationRenderer from '../components/coursePage/AnimationRenderer';
import {
  BASE_SHAPE_SIZE,
  DEFAULT_ANIMATION_DURATION,
  composeChildState,
  deriveDurationFromObjects,
  getCanvasTransform,
  getObjectStateAtTime,
  getCompoundStatesAtTime,
  normalizeAnimation
} from '../utils/animationUtils';
import { Link, useLocation, useNavigate } from "react-router";

export default function AnimationStudio() {
  const [objects, setObjects] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [selectedTransitionIndex, setSelectedTransitionIndex] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(15);
  const [durationOverride, setDurationOverride] = useState(null);
  const [showTransitionModal, setShowTransitionModal] = useState(false);
  const [contextMenu, setContextMenu] = useState(null);
  const [copiedTransition, setCopiedTransition] = useState(null);
  const [draggingId, setDraggingId] = useState(null);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const [dragStartPositions, setDragStartPositions] = useState({});
  const [resizingId, setResizingId] = useState(null);
  const [resizeStart, setResizeStart] = useState(null);
  const [selectionBox, setSelectionBox] = useState(null);
  const [selectionStart, setSelectionStart] = useState(null);
  const [copiedObjects, setCopiedObjects] = useState(null);
  const [animationTitle, setAnimationTitle] = useState('Untitled Animation');
  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState('');
  const [showProjectSelector, setShowProjectSelector] = useState(true);
  const [animations, setAnimations] = useState([]);
  const [isLoadingAnimations, setIsLoadingAnimations] = useState(false);
  const [currentAnimationId, setCurrentAnimationId] = useState(null);
  const [useParityPreview, setUseParityPreview] = useState(false);
  const [canvasMeta, setCanvasMeta] = useState({ width: null, height: null });
  const [showStudentPreview, setShowStudentPreview] = useState(false);
  const [connections, setConnections] = useState([]);
  const [savedObjects, setSavedObjects] = useState([]);
  const [isLoadingSavedObjects, setIsLoadingSavedObjects] = useState(false);
  const [deleteMergedFromLibrary, setDeleteMergedFromLibrary] = useState(false);

  // Slide mode state
  const [mode, setMode] = useState('timeline'); // 'timeline' or 'slides'
  const [slides, setSlides] = useState([
    {
      id: 'slide_0',
      time: 0,
      duration: 1.0,
      easing: 'ease-in-out',
      objects: [],
      connections: [] // Per-slide connections
    }
  ]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [objectLibrary, setObjectLibrary] = useState([]);
  const [playbackTime, setPlaybackTime] = useState(0);

  const animationRef = useRef(null);
  const canvasRef = useRef(null);
  const parityCanvasRef = useRef(null);
  const slideDragRef = useRef({
    dragging: null,
    offset: { x: 0, y: 0 },
    dragStartPositions: {} // Store initial positions for multi-select drag
  });
  const slideThumbsRef = useRef(null);
  const thumbDragging = useRef(false);
  const thumbStartX = useRef(0);
  const thumbStartScroll = useRef(0);
  const dragStateRef = useRef({
    draggingId: null,
    resizingId: null,
    resizeStart: null,
    dragOffset: { x: 0, y: 0 },
    dragStartPositions: {}
  });
  const lastPointerRef = useRef(null);
  const rafDragRef = useRef(null);

  const primarySelectedId = selectedIds[0] || null;
  const selectedObject = objects.find(obj => obj.id === primarySelectedId);
  const derivedDuration = deriveDurationFromObjects(objects);
  const endMarkerPosition = duration > 0 ? Math.min(100, (derivedDuration / duration) * 100) : 0;
  const safeAreaPadding = 24;

  const generalTemplates = [
    { label: 'Label', type: 'text', overrides: { text: 'Label', color: '#ffffff', width: 220, height: 50 } },
    { label: 'Callout', type: 'rectangle', overrides: { text: 'Callout', color: '#f59e0b', width: 220, height: 80 } },
    { label: 'Step', type: 'rectangle', overrides: { text: 'Step', color: '#3b82f6', width: 160, height: 60 } }
  ];

  const dataStructureTemplates = [
    { label: 'Node', type: 'rectangle', overrides: { text: 'val | next', color: '#22c55e', width: 180, height: 60 } },
    { label: 'ArrayCell', type: 'rectangle', overrides: { text: 'A[i]', color: '#6366f1', width: 140, height: 60 } },
    { label: 'Stack', type: 'rectangle', overrides: { text: 'Stack', fillColor: 'transparent', strokeColor: '#f97316', borderWidth: 2, openTop: true, width: 180, height: 90 } },
    { label: 'Queue', type: 'rectangle', overrides: { text: 'Queue', fillColor: 'transparent', strokeColor: '#10b981', borderWidth: 2, openTop: true, width: 200, height: 80 } },
    { label: 'Pointer', type: 'text', overrides: { text: '⟶', color: '#ffffff', width: 280, height: 90 } }
  ];

  const timelineWarnings = useMemo(() => {
    const warnings = [];

    objects.forEach(obj => {
      if (!obj?.transitions?.length) return;
      const transitions = obj.transitions;
      for (let i = 0; i < transitions.length; i++) {
        const current = transitions[i];
        if (!Number.isFinite(current.startTime) || !Number.isFinite(current.duration)) {
          warnings.push(`${obj.name}: invalid time values`);
          break;
        }
        if (current.duration < 0) {
          warnings.push(`${obj.name}: negative duration at transition ${i}`);
          break;
        }
        if (i > 0) {
          const prev = transitions[i - 1];
          if (current.startTime < prev.startTime) {
            warnings.push(`${obj.name}: transitions out of order`);
            break;
          }
          const prevEnd = prev.startTime + (prev.duration || 0);
          if (current.startTime < prevEnd) {
            warnings.push(`${obj.name}: overlapping transitions`);
            break;
          }
        }
      }
    });

    return Array.from(new Set(warnings));
  }, [objects]);

  const addObject = (type, startTime = 0, overrides = {}, namePrefix = null) => {
    const x = 700; // make this dynamic later based on canvas size 
    const y = 400; // make this dynamic later based on canvas size
    const base = {
      x,
      y,
      width: type === 'rectangle' ? 100 : type === 'text' ? 200 : null,
      height: type === 'rectangle' ? 60 : type === 'text' ? 40 : null,
      scale: 1,
      rotation: 0,
      color: type === 'circle' ? '#3b82f6' : type === 'square' ? '#ef4444' : type === 'triangle' ? '#10b981' : type === 'text' ? '#ffffff' : '#f59e0b',
      fillColor: null,
      strokeColor: null,
      borderWidth: 2,
      openTop: false,
      text: type === 'text' ? 'Double click to edit' : '',
      easing: 'linear'
    };
    const finalBase = { ...base, ...overrides };

    const fadeDuration = 0.5;
    let transitions = [];

    if (startTime > 0) {
      // Keep object invisible from 0 -> startTime, then fade in over fadeDuration
      transitions = [
        { startTime: 0, duration: startTime, ...finalBase, opacity: 0 },
        { startTime: startTime, duration: fadeDuration, ...finalBase, opacity: 0 },
        { startTime: startTime + fadeDuration, duration: 0, ...finalBase, opacity: 1 }
      ];
    } else {
      transitions = [
        { startTime: 0, duration: 0, ...finalBase, opacity: 1 }
      ];
    }

    const baseName = namePrefix || type;
    const count = objects.filter(o => o.name?.startsWith(`${baseName}_`)).length + 1;

    const newObj = {
      id: `obj_${Date.now()}`,
      name: `${baseName}_${count}`,
      type,
      transitions
    };

    setObjects(prev => [...prev, newObj]);
    setSelectedIds([newObj.id]);
    setSelectedTransitionIndex(0);
  };

  const deleteObject = (id) => {
    setObjects(prev => prev.filter(obj => obj.id !== id));
    setSelectedIds(prev => prev.filter(sid => sid !== id));
    setConnections(prev => prev.filter(conn => conn.fromId !== id && conn.toId !== id));
  };

  const addConnection = () => {
    if (selectedIds.length < 2) return;
    const fromId = selectedIds[0];
    const toId = selectedIds[1];
    if (fromId === toId) return;
    setConnections(prev => {
      const exists = prev.some(conn => conn.fromId === fromId && conn.toId === toId);
      if (exists) return prev;
      return [...prev, { fromId, toId, color: '#facc15', width: 2 }];
    });
  };

  const clearConnectionsForSelection = () => {
    if (selectedIds.length === 0) return;
    setConnections(prev => prev.filter(conn => !selectedIds.includes(conn.fromId) && !selectedIds.includes(conn.toId)));
  };

  const buildOverridesFromSaved = (savedObject) => {
    const base = savedObject?.transitions?.[0] || {};
    return {
      width: base.width,
      height: base.height,
      scale: base.scale,
      rotation: base.rotation,
      color: base.color,
      fillColor: base.fillColor,
      strokeColor: base.strokeColor,
      borderWidth: base.borderWidth,
      openTop: base.openTop,
      text: base.text,
      opacity: base.opacity,
      easing: base.easing
    };
  };

  const addSavedObjectToCanvas = (savedObject) => {
    if (!savedObject) return;
    if (Array.isArray(savedObject.children) && savedObject.children.length > 0) {
      const newObj = {
        ...savedObject,
        id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
        name: `${savedObject.name}_copy`,
        _sourceSavedId: savedObject.id
      };
      setObjects(prev => [...prev, newObj]);
      setSelectedIds([newObj.id]);
      setSelectedTransitionIndex(0);
      return;
    }
    // Create a canvas object that preserves the saved transitions and tracks source saved id
    const newObj = {
      id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: `${savedObject.name}_copy`,
      type: savedObject.type,
      transitions: (savedObject.transitions || []).map(t => ({ ...t })),
      _sourceSavedId: savedObject.id
    };
    setObjects(prev => [...prev, newObj]);
    setSelectedIds([newObj.id]);
    setSelectedTransitionIndex(0);
  };

  const deleteSavedObject = async (savedId) => {
    const userId = localStorage.getItem('userId');
    if (!userId || !savedId) return;
    try {
      await axios.delete(`http://localhost:5000/api/admin/users/${userId}/saved-objects/${savedId}`);
      setSavedObjects(prev => prev.filter(s => s.id !== savedId));
    } catch (err) {
      console.error('Failed to delete saved object', err);
    }
  };

  const getTransitionSnapshot = (obj) => {
    if (!obj?.transitions?.length) return null;
    if (selectedTransitionIndex !== null && selectedTransitionIndex !== undefined) {
      const index = Math.min(selectedTransitionIndex, obj.transitions.length - 1);
      return obj.transitions[index];
    }
    return obj.transitions[obj.transitions.length - 1];
  };

  const getStateBounds = (type, state) => {
    if (!state) return null;
    const scale = state.scale ?? 1;
    const centerX = state.x ?? 0;
    const centerY = state.y ?? 0;

    let width = BASE_SHAPE_SIZE * scale;
    let height = BASE_SHAPE_SIZE * scale;

    if (type === 'rectangle') {
      width = (state.width ?? 100) * scale;
      height = (state.height ?? 60) * scale;
    } else if (type === 'text') {
      width = (state.width ?? 200) * scale;
      height = (state.height ?? 40) * scale;
    }

    return {
      left: centerX - width / 2,
      right: centerX + width / 2,
      top: centerY - height / 2,
      bottom: centerY + height / 2,
      width,
      height
    };
  };

  const getObjectBounds = (obj, transition) => {
    if (!obj || !transition) return null;
    if (Array.isArray(obj.children) && obj.children.length > 0) {
      const parentState = transition;
      const childBounds = obj.children
        .map(child => {
          const childTransition = getTransitionSnapshot(child) || (child.transitions ? child.transitions[child.transitions.length - 1] : null);
          const childState = composeChildState(childTransition, parentState);
          const bounds = getStateBounds(child.type, childState);
          return bounds;
        })
        .filter(Boolean);

      if (childBounds.length === 0) return null;

      const left = Math.min(...childBounds.map(b => b.left));
      const right = Math.max(...childBounds.map(b => b.right));
      const top = Math.min(...childBounds.map(b => b.top));
      const bottom = Math.max(...childBounds.map(b => b.bottom));

      return {
        left,
        right,
        top,
        bottom,
        width: Math.max(1, right - left),
        height: Math.max(1, bottom - top)
      };
    }

    return getStateBounds(obj.type, transition);
  };

  const mergeSelectedObjects = async () => {
    if (selectedIds.length < 2) return;
    const selected = objects.filter(obj => selectedIds.includes(obj.id));
    if (selected.length < 2) return;

    const boundsList = selected
      .map(obj => ({ obj, transition: getTransitionSnapshot(obj) }))
      .filter(entry => entry.transition)
      .map(entry => ({ ...entry, bounds: getObjectBounds(entry.obj, entry.transition) }))
      .filter(entry => entry.bounds);

    if (boundsList.length < 2) {
      setSaveMessage('✗ Select at least two objects with valid transitions');
      return;
    }

    const unionLeft = Math.min(...boundsList.map(b => b.bounds.left));
    const unionRight = Math.max(...boundsList.map(b => b.bounds.right));
    const unionTop = Math.min(...boundsList.map(b => b.bounds.top));
    const unionBottom = Math.max(...boundsList.map(b => b.bounds.bottom));

    const mergedWidth = Math.max(10, unionRight - unionLeft);
    const mergedHeight = Math.max(10, unionBottom - unionTop);
    const mergedX = unionLeft + mergedWidth / 2;
    const mergedY = unionTop + mergedHeight / 2;

    const mergedNameBase = 'Merged';
    const mergedCount = objects.filter(o => o.name?.startsWith(`${mergedNameBase}_`)).length + 1;
    const defaultMergedName = `${mergedNameBase}_${mergedCount}`;
    const userProvidedName = prompt('Enter a name for the merged object:', defaultMergedName);
    const mergedName = (userProvidedName && userProvidedName.trim()) ? userProvidedName.trim() : defaultMergedName;

    const mergedTransition = {
      startTime: 0,
      duration: 0,
      x: mergedX,
      y: mergedY,
      scale: 1,
      rotation: 0,
      opacity: 1,
      easing: 'linear'
    };

    const children = boundsList.map(({ obj, transition }) => {
      const relativeX = (transition.x ?? 0) - mergedX;
      const relativeY = (transition.y ?? 0) - mergedY;
      return {
        id: obj.id,
        name: obj.name,
        type: obj.type,
        transitions: [
          {
            startTime: 0,
            duration: 0,
            x: relativeX,
            y: relativeY,
            width: transition.width,
            height: transition.height,
            scale: transition.scale ?? 1,
            rotation: transition.rotation ?? 0,
            opacity: transition.opacity ?? 1,
            color: transition.color,
            fillColor: transition.fillColor ?? null,
            strokeColor: transition.strokeColor ?? null,
            borderWidth: transition.borderWidth ?? 2,
            openTop: transition.openTop ?? false,
            text: transition.text ?? '',
            easing: transition.easing || 'linear'
          }
        ]
      };
    });

    const mergedObject = {
      id: `obj_${Date.now()}`,
      name: mergedName,
      type: 'group',
      transitions: [mergedTransition],
      children
    };

    setObjects(prev => [
      ...prev.filter(obj => !selectedIds.includes(obj.id)),
      mergedObject
    ]);
    setConnections(prev => prev.filter(conn => !selectedIds.includes(conn.fromId) && !selectedIds.includes(conn.toId)));
    setSelectedIds([mergedObject.id]);
    setSelectedTransitionIndex(0);

    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const response = await axios.post(
          `http://localhost:5000/api/admin/users/${userId}/saved-objects`,
          {
            name: mergedObject.name,
            type: mergedObject.type,
            transitions: mergedObject.transitions,
            children: mergedObject.children
          }
        );
        if (response?.data) {
          setSavedObjects(prev => [...prev, response.data]);
        }
        setSaveMessage('✓ Merged and saved to your library');

        // If user requested, delete original saved items from their library
        if (deleteMergedFromLibrary) {
          const savedIdsToDelete = selected.map(s => s._sourceSavedId).filter(Boolean);
          for (const sid of savedIdsToDelete) {
            try {
              await axios.delete(`http://localhost:5000/api/admin/users/${userId}/saved-objects/${sid}`);
              setSavedObjects(prev => prev.filter(s => s.id !== sid));
            } catch (delErr) {
              console.error('Failed to delete original saved object', sid, delErr);
            }
          }
        }
      } catch (error) {
        console.error('Error saving merged object:', error);
        setSaveMessage('✗ Merged, but failed to save to your library');
      }
    } else {
      setSaveMessage('✗ Merged, but user is not authenticated');
    }

    setTimeout(() => setSaveMessage(''), 3000);
  };

  const handleContextMenu = (e, objId, transIndex) => {
    e.preventDefault();
    e.stopPropagation();
    // treat both undefined and null as "object-level" context (no specific transition)
    const isObject = objId && (transIndex === undefined || transIndex === null);
    setContextMenu({ x: e.clientX, y: e.clientY, objId, transIndex, isObject });
    if (objId && !selectedIds.includes(objId)) {
      setSelectedIds([objId]);
    }
    if (transIndex !== undefined && transIndex !== null) {
      setSelectedTransitionIndex(transIndex);
    }
  };

  const closeContextMenu = () => setContextMenu(null);

  const openTransitionModal = () => {
    setShowTransitionModal(true);
    closeContextMenu();
  };

  const copyObjects = () => {
    if (selectedIds.length === 0) return;
    const objectsToCopy = objects.filter(obj => selectedIds.includes(obj.id));
    setCopiedObjects(JSON.parse(JSON.stringify(objectsToCopy)));
    closeContextMenu();
  };

  const pasteObjects = () => {
    if (!copiedObjects) return;

    const newObjects = copiedObjects.map(obj => ({
      ...obj,
      id: `obj_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
      name: `${obj.name}_copy`,
      transitions: obj.transitions.map(t => ({ ...t, x: t.x + 50, y: t.y + 50 }))
    }));

    setObjects(prev => [...prev, ...newObjects]);
    setSelectedIds(newObjects.map(o => o.id));
    closeContextMenu();
  };

  const copyTransition = () => {
    if (!contextMenu) return;
    const obj = objects.find(o => o.id === contextMenu.objId);
    if (!obj) return;
    const trans = obj.transitions[contextMenu.transIndex];
    if (!trans) return;
    setCopiedTransition({ ...trans });
    closeContextMenu();
  };

  const addTransitionToObject = (objId, newTransition) => {
    setObjects(prevObjects => prevObjects.map(o => {
      if (o.id === objId) {
        return { ...o, transitions: [...o.transitions, newTransition] };
      }
      return o;
    }));
  };

  const pasteTransition = () => {
    if (!copiedTransition || !contextMenu) return;
    const obj = objects.find(o => o.id === contextMenu.objId);
    if (!obj) return;
    const lastTransition = obj.transitions[obj.transitions.length - 1];
    const newStartTime = lastTransition.startTime + lastTransition.duration;

    const newTransition = {
      ...copiedTransition,
      startTime: newStartTime,
      duration: 0,
      x: lastTransition.x,
      y: lastTransition.y
    };

    // Update the last transition to have the duration from the copied transition
    setObjects(prevObjects => prevObjects.map(o => {
      if (o.id === contextMenu.objId) {
        const updatedTransitions = [...o.transitions];
        updatedTransitions[updatedTransitions.length - 1] = {
          ...lastTransition,
          duration: copiedTransition.duration || 0,
          easing: copiedTransition.easing || lastTransition.easing || 'linear'
        };
        updatedTransitions.push(newTransition);
        return { ...o, transitions: updatedTransitions };
      }
      return o;
    }));
    closeContextMenu();
  };

  const addTransition = (transitionDuration, easing) => {
    if (selectedIds.length === 0) return;

    setObjects(prevObjects => {
      const updated = prevObjects.map(o => {
        if (selectedIds.includes(o.id)) {
          const lastTransition = o.transitions[o.transitions.length - 1];

          // Update the last transition to have the correct duration (time until next keyframe)
          const updatedLastTransition = {
            ...lastTransition,
            duration: transitionDuration,
            easing: easing || lastTransition.easing || 'linear'
          };

          // Calculate new start time based on updated last transition
          const newStartTime = lastTransition.startTime + transitionDuration;

          const newTransition = {
            startTime: newStartTime,
            duration: 0,
            x: lastTransition.x,
            y: lastTransition.y,
            width: lastTransition.width,
            height: lastTransition.height,
            scale: lastTransition.scale,
            rotation: lastTransition.rotation,
            opacity: lastTransition.opacity,
            color: lastTransition.color,
            fillColor: lastTransition.fillColor,
            strokeColor: lastTransition.strokeColor,
            borderWidth: lastTransition.borderWidth,
            openTop: lastTransition.openTop,
            text: lastTransition.text || ''
          };

          // Create new transitions array with updated last transition and new transition
          const updatedTransitions = [...o.transitions];
          updatedTransitions[updatedTransitions.length - 1] = updatedLastTransition;
          updatedTransitions.push(newTransition);

          return { ...o, transitions: updatedTransitions };
        }
        return o;
      });
      return updated;
    });

    setShowTransitionModal(false);
  };

  const updateTransition = (objId, transIndex, updates) => {
    setObjects(prev => prev.map(obj => {
      if (obj.id === objId) {
        const newTransitions = [...obj.transitions];
        newTransitions[transIndex] = { ...newTransitions[transIndex], ...updates };
        return { ...obj, transitions: newTransitions };
      }
      return obj;
    }));
  };

  const deleteTransition = (objId, transIndex) => {
    if (transIndex === 0) return;
    setObjects(prev => prev.map(obj => {
      if (obj.id === objId) {
        const newTransitions = obj.transitions.filter((_, i) => i !== transIndex);
        return { ...obj, transitions: newTransitions };
      }
      return obj;
    }));
    if (selectedTransitionIndex === transIndex) {
      setSelectedTransitionIndex(Math.max(0, transIndex - 1));
    }
  };

  const handleCanvasMouseDown = (e) => {
    if (e.target === canvasRef.current && !isPlaying) {
      // Clear selection if clicking directly on canvas
      if (!e.ctrlKey && !e.metaKey) {
        setSelectedIds([]);
        setSelectedTransitionIndex(null);
      }
      const rect = canvasRef.current.getBoundingClientRect();
      setSelectionStart({ x: e.clientX - rect.left, y: e.clientY - rect.top });
      setSelectionBox({ x: e.clientX - rect.left, y: e.clientY - rect.top, width: 0, height: 0 });
    }
  };

  const handleCanvasMouseMove = (e) => {
    if (selectionStart && !isPlaying) {
      const rect = canvasRef.current.getBoundingClientRect();
      const currentX = e.clientX - rect.left;
      const currentY = e.clientY - rect.top;

      const x = Math.min(selectionStart.x, currentX);
      const y = Math.min(selectionStart.y, currentY);
      const width = Math.abs(currentX - selectionStart.x);
      const height = Math.abs(currentY - selectionStart.y);

      setSelectionBox({ x, y, width, height });
    }
  };

  const handleCanvasMouseUp = () => {
    if (selectionBox && selectionBox.width > 5 && selectionBox.height > 5) {
      const selected = objects.filter(obj => {
        const lastTrans = obj.transitions[obj.transitions.length - 1];
        if (!lastTrans) return false;
        const bounds = getObjectBounds(obj, lastTrans);
        if (!bounds) return false;
        return (
          bounds.right >= selectionBox.x &&
          bounds.left <= selectionBox.x + selectionBox.width &&
          bounds.bottom >= selectionBox.y &&
          bounds.top <= selectionBox.y + selectionBox.height
        );
      }).map(obj => obj.id);

      setSelectedIds(selected);
      setSelectedTransitionIndex(0);
    }
    setSelectionStart(null);
    setSelectionBox(null);
  };

  const handleMouseDown = (e, objId, transIndex, isResizeHandle = false) => {
    if (isPlaying) return;
    e.stopPropagation();

    if (isResizeHandle) {
      setResizingId(`${objId}-${transIndex}`);
      const obj = objects.find(o => o.id === objId);
      const trans = obj.transitions[transIndex];
      setResizeStart({
        width: trans.width ?? 100,
        height: trans.height ?? 60,
        scale: trans.scale ?? 1,
        startX: e.clientX,
        startY: e.clientY
      });
      return;
    }

    if (e.ctrlKey || e.metaKey) {
      setSelectedIds(prev => prev.includes(objId) ? prev.filter(id => id !== objId) : [...prev, objId]);
      return;
    }

    const wasSelected = selectedIds.includes(objId);
    if (!wasSelected) {
      setSelectedIds([objId]);
    }

    setSelectedTransitionIndex(transIndex);
    setDraggingId(`${objId}-${transIndex}`);

    const obj = objects.find(o => o.id === objId);
    const trans = obj.transitions[transIndex];
    const rect = canvasRef.current.getBoundingClientRect();
    setDragOffset({ x: e.clientX - rect.left - (trans.x ?? 0), y: e.clientY - rect.top - (trans.y ?? 0) });

    // Store initial positions for all selected objects using their last transition
    const positions = {};
    selectedIds.forEach(id => {
      const selectedObj = objects.find(o => o.id === id);
      if (selectedObj && selectedObj.transitions.length > 0) {
        // Use the last transition for each selected object
        const lastTransIndex = selectedObj.transitions.length - 1;
        const selectedTrans = selectedObj.transitions[lastTransIndex];
        positions[id] = {
          x: selectedTrans.x,
          y: selectedTrans.y,
          transIndex: lastTransIndex
        };
      }
    });

    setDragStartPositions(positions);
  };

  const handleMouseMove = (e) => {
    if (isPlaying) return;
    lastPointerRef.current = { clientX: e.clientX, clientY: e.clientY };

    if (rafDragRef.current) return;

    rafDragRef.current = requestAnimationFrame(() => {
      rafDragRef.current = null;
      const pointer = lastPointerRef.current;
      if (!pointer) return;

      const {
        draggingId: activeDraggingId,
        resizingId: activeResizingId,
        resizeStart: activeResizeStart,
        dragOffset: activeDragOffset,
        dragStartPositions: activeDragStartPositions
      } = dragStateRef.current;

      const rect = canvasRef.current?.getBoundingClientRect();
      if (!rect) return;

      if (activeResizingId && activeResizeStart) {
        const separatorIndex = activeResizingId.lastIndexOf('-');
        const objId = activeResizingId.slice(0, separatorIndex);
        const transIndex = parseInt(activeResizingId.slice(separatorIndex + 1), 10);

        const deltaX = pointer.clientX - activeResizeStart.startX;
        const deltaY = pointer.clientY - activeResizeStart.startY;

        setObjects(prev => prev.map(obj => {
          if (obj.id !== objId) return obj;
          const transitions = [...obj.transitions];
          const targetTransition = transitions[transIndex];
          if (!targetTransition) return obj;

          if (obj.type === 'rectangle') {
            const newWidth = Math.max(20, activeResizeStart.width + deltaX);
            const newHeight = Math.max(20, activeResizeStart.height + deltaY);
            transitions[transIndex] = { ...targetTransition, width: newWidth, height: newHeight };
          } else {
            const avgDelta = (deltaX + deltaY) / 2;
            const newScale = Math.max(0.1, Math.min(3, activeResizeStart.scale + avgDelta / 50));
            transitions[transIndex] = { ...targetTransition, scale: newScale };
          }

          return { ...obj, transitions };
        }));
        return;
      }

      if (!activeDraggingId) return;

      const separatorIndex = activeDraggingId.lastIndexOf('-');
      const objId = activeDraggingId.slice(0, separatorIndex);
      const transIndex = parseInt(activeDraggingId.slice(separatorIndex + 1), 10);

      const currentX = pointer.clientX - rect.left - activeDragOffset.x;
      const currentY = pointer.clientY - rect.top - activeDragOffset.y;

      const originalPos = activeDragStartPositions[objId];
      const deltaX = originalPos ? currentX - originalPos.x : 0;
      const deltaY = originalPos ? currentY - originalPos.y : 0;

      setObjects(prev => prev.map(obj => {
        if (originalPos) {
          const startPos = activeDragStartPositions[obj.id];
          if (!startPos) return obj;
          const transitions = [...obj.transitions];
          const targetTransition = transitions[startPos.transIndex];
          if (!targetTransition) return obj;
          transitions[startPos.transIndex] = {
            ...targetTransition,
            x: startPos.x + deltaX,
            y: startPos.y + deltaY
          };
          return { ...obj, transitions };
        }

        if (obj.id !== objId) return obj;
        const transitions = [...obj.transitions];
        const targetTransition = transitions[transIndex];
        if (!targetTransition) return obj;
        transitions[transIndex] = { ...targetTransition, x: currentX, y: currentY };
        return { ...obj, transitions };
      }));
    });
  };

  const handleMouseUp = () => {
    setDraggingId(null);
    setResizingId(null);
    setResizeStart(null);
    setDragStartPositions({});
    if (rafDragRef.current) {
      cancelAnimationFrame(rafDragRef.current);
      rafDragRef.current = null;
    }
    lastPointerRef.current = null;
  };

  useEffect(() => {
    if (draggingId || resizingId) {
      window.addEventListener('mousemove', handleMouseMove);
      window.addEventListener('mouseup', handleMouseUp);
      return () => {
        window.removeEventListener('mousemove', handleMouseMove);
        window.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [draggingId, resizingId, dragOffset, selectedIds, objects, dragStartPositions, resizeStart]);

  useEffect(() => {
    dragStateRef.current = {
      draggingId,
      resizingId,
      resizeStart,
      dragOffset,
      dragStartPositions
    };
  }, [draggingId, resizingId, resizeStart, dragOffset, dragStartPositions]);

  useEffect(() => {
    const handleClick = () => closeContextMenu();
    const handleKeyDown = (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'c') {
        e.preventDefault();
        copyObjects();
      }
      if ((e.ctrlKey || e.metaKey) && e.key === 'v') {
        e.preventDefault();
        pasteObjects();
      }
      // Add Delete key support for both modes
      if (e.key === 'Delete' && selectedIds.length > 0) {
        e.preventDefault();
        if (mode === 'slides') {
          selectedIds.forEach(id => deleteSlideObject(id));
        } else {
          selectedIds.forEach(id => deleteObject(id));
        }
      }
    };
    window.addEventListener('click', handleClick);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('click', handleClick);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [selectedIds, objects, copiedObjects, deleteObject, mode]);

  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    } else {
      setIsPlaying(true);

      if (mode === 'slides') {
        // Slide mode playback
        const startTime = Date.now() - (playbackTime * 1000);
        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed >= totalSlideDuration) {
            setPlaybackTime(0);
            setIsPlaying(false);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
          } else {
            setPlaybackTime(elapsed);
            animationRef.current = requestAnimationFrame(animate);
          }
        };
        animate();
      } else {
        // Timeline mode playback
        const startTime = Date.now() - (currentTime * 1000);
        const animate = () => {
          const elapsed = (Date.now() - startTime) / 1000;
          if (elapsed >= duration) {
            setCurrentTime(0);
            setIsPlaying(false);
            if (animationRef.current) cancelAnimationFrame(animationRef.current);
          } else {
            setCurrentTime(elapsed);
            animationRef.current = requestAnimationFrame(animate);
          }
        };
        animate();
      }
    }
  };

  // Cleanup animation frame on unmount
  useEffect(() => {
    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current);
      }
    };
  }, []);

  useEffect(() => {
    const derived = deriveDurationFromObjects(objects);
    const nextDuration = durationOverride ?? (derived > 0 ? derived : DEFAULT_ANIMATION_DURATION);
    setDuration(nextDuration);
  }, [objects, durationOverride]);

  useEffect(() => {
    if (!canvasRef.current || !parityCanvasRef.current) return;
    const canvas = parityCanvasRef.current;
    const container = canvasRef.current;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);

    return () => observer.disconnect();
  }, [useParityPreview]);

  // Load existing animations on component mount
  useEffect(() => {
    if (showProjectSelector) {
      loadAnimations();
    }
  }, [showProjectSelector]);

  const loadSavedObjects = async () => {
    const userId = localStorage.getItem('userId');
    if (!userId) return;

    setIsLoadingSavedObjects(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/admin/users/${userId}/saved-objects`
      );
      setSavedObjects(response.data || []);
    } catch (error) {
      console.error('Error loading saved objects:', error);
    } finally {
      setIsLoadingSavedObjects(false);
    }
  };

  useEffect(() => {
    loadSavedObjects();
  }, []);

  const loadAnimations = async () => {
    const authorId = localStorage.getItem('userId');
    if (!authorId) return;

    setIsLoadingAnimations(true);
    try {
      const response = await axios.get(
        `http://localhost:5000/api/animations?authorId=${authorId}`
      );
      setAnimations(response.data);
    } catch (error) {
      console.error('Error loading animations:', error);
    } finally {
      setIsLoadingAnimations(false);
    }
  };

  const createNewAnimation = (selectedMode = 'timeline') => {
    setMode(selectedMode);

    if (selectedMode === 'slides') {
      // Initialize slide mode
      setSlides([
        {
          id: 'slide_0',
          time: 0,
          duration: 1.0,
          easing: 'ease-in-out',
          objects: [],
          connections: []
        }
      ]);
      setCurrentSlideIndex(0);
      setObjectLibrary([]);
      setObjects([]); // Clear timeline objects
    } else {
      // Initialize timeline mode
      setObjects([]);
      setSlides([]);
      setObjectLibrary([]);
    }

    setAnimationTitle('Untitled Animation');
    setDuration(DEFAULT_ANIMATION_DURATION);
    setDurationOverride(null);
    setCanvasMeta({ width: null, height: null });
    setConnections([]);
    setCurrentAnimationId(null);
    setShowProjectSelector(false);
  };

  const loadAnimation = async (animationId) => {
    try {
      const response = await axios.get(
        `http://localhost:5000/api/animations/${animationId}`
      );
      const data = response.data || {};
      const animationMode = data.mode || 'timeline';

      setMode(animationMode);
      setAnimationTitle(data.title || 'Untitled Animation');
      setCanvasMeta({
        width: data.canvasWidth ?? null,
        height: data.canvasHeight ?? null
      });
      setCurrentAnimationId(animationId);

      if (animationMode === 'slides') {
        // Load slide mode data
        const slideData = data.slideData || {};
        setSlides(slideData.slides || [
          {
            id: 'slide_0',
            time: 0,
            duration: 1.0,
            easing: 'ease-in-out',
            objects: [],
            connections: []
          }
        ]);
        setObjectLibrary(slideData.objectLibrary || []);
        setCurrentSlideIndex(0);
        setObjects([]); // Clear timeline objects
        // Clear top-level connections for slides mode; connections are stored per-slide
        setConnections([]);
      } else {
        // Load timeline mode data
        const normalized = normalizeAnimation(data);
        setObjects(normalized.objects || []);
        setDurationOverride(normalized.durationOverride);
        setDuration(normalized.effectiveDuration || DEFAULT_ANIMATION_DURATION);
        setSlides([]);
        setObjectLibrary([]);
        // Timeline mode: load top-level connections
        setConnections(data.connections || []);
      }

      setShowProjectSelector(false);
    } catch (error) {
      console.error('Error loading animation:', error);
      setSaveMessage('✗ Error loading animation: ' + error.message);
    }
  };

  // ========== SLIDE MODE FUNCTIONS ==========

  const currentSlide = slides[currentSlideIndex] || slides[0];

  const totalSlideDuration = useMemo(() => {
    return slides.reduce((sum, slide) => sum + (slide.duration || 1.0), 0);
  }, [slides]);

  // Create object in library and add to current slide
  const createSlideObject = (type) => {
    const newObj = {
      id: `obj_${Date.now()}`,
      name: `${type}_${objectLibrary.filter(o => o.type === type).length + 1}`,
      type,
      x: 500,
      y: 300,
      scale: 1,
      rotation: 0,
      opacity: 1,
      color: type === 'circle' ? '#3b82f6' : type === 'square' ? '#ef4444' : type === 'triangle' ? '#10b981' : '#f59e0b',
      width: type === 'rectangle' || type === 'text' ? 120 : BASE_SHAPE_SIZE,
      height: type === 'rectangle' || type === 'text' ? 60 : BASE_SHAPE_SIZE,
      text: type === 'text' ? 'Text' : '',
      visible: true
    };

    setObjectLibrary(prev => [...prev, newObj]);

    // Auto-add to current slide
    setSlides(prev => prev.map((slide, idx) => {
      if (idx === currentSlideIndex) {
        return {
          ...slide,
          objects: [...slide.objects, { ...newObj }]
        };
      }
      return slide;
    }));

    return newObj;
  };

  // Toggle object visibility in current slide
  const toggleSlideObjectVisibility = (objId) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx === currentSlideIndex) {
        return {
          ...slide,
          objects: slide.objects.map(obj =>
            obj.id === objId ? { ...obj, visible: !obj.visible } : obj
          )
        };
      }
      return slide;
    }));
  };

  // Update object in current slide
  const updateSlideObject = (objId, updates) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx === currentSlideIndex) {
        return {
          ...slide,
          objects: slide.objects.map(obj =>
            obj.id === objId ? { ...obj, ...updates } : obj
          )
        };
      }
      return slide;
    }));
  };

  // Add new slide
  const addSlide = () => {
    const lastSlide = slides[slides.length - 1];
    const newSlide = {
      id: `slide_${Date.now()}`,
      time: lastSlide ? lastSlide.time + lastSlide.duration : 0,
      duration: 1.0,
      easing: 'ease-in-out',
      objects: lastSlide ? lastSlide.objects.map(obj => ({ ...obj })) : [],
      connections: lastSlide ? [...lastSlide.connections] : [] // Inherit connections
    };
    setSlides(prev => [...prev, newSlide]);
    setCurrentSlideIndex(slides.length);
  };

  // Delete current slide
  const deleteSlide = () => {
    if (slides.length <= 1) return;
    setSlides(prev => prev.filter((_, idx) => idx !== currentSlideIndex));
    setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1));
  };

  // Duplicate current slide
  const duplicateSlide = () => {
    const newSlide = {
      ...currentSlide,
      id: `slide_${Date.now()}`,
      objects: currentSlide.objects.map(obj => ({ ...obj })),
      connections: [...(currentSlide.connections || [])]
    };
    setSlides(prev => {
      const newSlides = [...prev];
      newSlides.splice(currentSlideIndex + 1, 0, newSlide);
      return newSlides;
    });
    setCurrentSlideIndex(currentSlideIndex + 1);
  };

  // Delete object from library and all slides
  const deleteSlideObject = (objId) => {
    // Remove from object library
    setObjectLibrary(prev => prev.filter(obj => obj.id !== objId));

    // Remove from all slides and clean up connections
    setSlides(prev => prev.map(slide => ({
      ...slide,
      objects: slide.objects.filter(obj => obj.id !== objId),
      connections: (slide.connections || []).filter(conn =>
        conn.fromId !== objId && conn.toId !== objId
      )
    })));

    // Deselect if it was selected
    setSelectedIds(prev => prev.filter(id => id !== objId));
  };

  // Add connection between two objects in current slide
  const addSlideConnection = () => {
    if (selectedIds.length !== 2) return;

    const [fromId, toId] = selectedIds;
    const newConnection = {
      id: `conn_${Date.now()}`,
      fromId,
      toId,
      color: '#facc15',
      width: 2
    };

    setSlides(prev => prev.map((slide, idx) => {
      if (idx >= currentSlideIndex) {
        // Add to current and all future slides
        return {
          ...slide,
          connections: [...(slide.connections || []), { ...newConnection }]
        };
      }
      return slide;
    }));
  };

  // Remove connection from current slide and all future slides
  const removeSlideConnection = (connId) => {
    setSlides(prev => prev.map((slide, idx) => {
      if (idx >= currentSlideIndex) {
        return {
          ...slide,
          connections: (slide.connections || []).filter(conn => conn.id !== connId)
        };
      }
      return slide;
    }));
  };

  // Interpolation function for slides
  const lerp = (start, end, t) => start + (end - start) * t;

  const easingFunctions = {
    linear: (t) => t,
    'ease-in': (t) => t * t,
    'ease-out': (t) => t * (2 - t),
    'ease-in-out': (t) => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
    bounce: (t) => {
      if (t < 1 / 2.75) return 7.5625 * t * t;
      if (t < 2 / 2.75) return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
      if (t < 2.5 / 2.75) return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
      return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
    }
  };

  const getSlideObjectState = (objectId, slideIndex, progress) => {
    const slide = slides[slideIndex];
    const nextSlide = slides[slideIndex + 1];

    const currentObj = slide?.objects?.find(o => o.id === objectId);
    const nextObj = nextSlide?.objects?.find(o => o.id === objectId);

    if (!currentObj || !currentObj.visible) return null;
    if (!nextSlide || !nextObj || !nextObj.visible) return currentObj;

    const easingFunc = easingFunctions[slide.easing] || easingFunctions.linear;
    const t = easingFunc(progress);

    return {
      ...currentObj,
      x: lerp(currentObj.x, nextObj.x, t),
      y: lerp(currentObj.y, nextObj.y, t),
      scale: lerp(currentObj.scale ?? 1, nextObj.scale ?? 1, t),
      rotation: lerp(currentObj.rotation ?? 0, nextObj.rotation ?? 0, t),
      opacity: lerp(currentObj.opacity ?? 1, nextObj.opacity ?? 1, t),
      width: lerp(currentObj.width ?? BASE_SHAPE_SIZE, nextObj.width ?? BASE_SHAPE_SIZE, t),
      height: lerp(currentObj.height ?? BASE_SHAPE_SIZE, nextObj.height ?? BASE_SHAPE_SIZE, t)
    };
  };

  // Render slide mode canvas
  useEffect(() => {
    if (mode !== 'slides' || !canvasRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const container = canvas.parentElement;

    // Ensure canvas has valid pixel dimensions before drawing. If not, size it from the container.
    if ((!canvas.width || !canvas.height) && container) {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
    }

    // If still not sized, skip drawing until next pass
    if (!canvas.width || !canvas.height) return;

    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = '#1f2937'; // Dark gray background like timeline mode
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw safe area guide
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 1;
    ctx.setLineDash([5, 5]);
    ctx.strokeRect(safeAreaPadding, safeAreaPadding, canvas.width - safeAreaPadding * 2, canvas.height - safeAreaPadding * 2);
    ctx.setLineDash([]);

    // Determine which objects to render
    let objectsToRender = [];
    let slideIdx = currentSlideIndex;
    let progress = 0;

    if (isPlaying) {
      // Find current slide based on playback time
      let accumulatedTime = 0;
      for (let i = 0; i < slides.length; i++) {
        if (playbackTime >= accumulatedTime && playbackTime < accumulatedTime + slides[i].duration) {
          slideIdx = i;
          progress = (playbackTime - accumulatedTime) / slides[i].duration;
          break;
        }
        accumulatedTime += slides[i].duration;
      }
    }

    // Get all unique object IDs
    const allObjIds = new Set();
    slides.forEach(slide => slide.objects.forEach(obj => allObjIds.add(obj.id)));

    objectsToRender = Array.from(allObjIds).map(id => {
      const state = getSlideObjectState(id, slideIdx, progress);
      return state;
    }).filter(Boolean);

    // Draw slide-scoped connections for the active slide
    const slideConnections = (slides[slideIdx] && slides[slideIdx].connections) ? slides[slideIdx].connections : [];
    if (slideConnections.length > 0) {
      slideConnections.forEach(conn => {
        const fromObj = objectsToRender.find(o => o.id === conn.fromId);
        const toObj = objectsToRender.find(o => o.id === conn.toId);
        if (!fromObj || !toObj) return;
        ctx.strokeStyle = conn.color || '#facc15';
        ctx.lineWidth = conn.width || 2;
        ctx.beginPath();
        ctx.moveTo(fromObj.x, fromObj.y);
        ctx.lineTo(toObj.x, toObj.y);
        ctx.stroke();
        // Draw arrowhead
        const headLength = 10;
        const angle = Math.atan2(toObj.y - fromObj.y, toObj.x - fromObj.x);
        ctx.fillStyle = conn.color || '#facc15';
        ctx.beginPath();
        ctx.moveTo(toObj.x, toObj.y);
        ctx.lineTo(toObj.x - headLength * Math.cos(angle - Math.PI / 6), toObj.y - headLength * Math.sin(angle - Math.PI / 6));
        ctx.lineTo(toObj.x - headLength * Math.cos(angle + Math.PI / 6), toObj.y - headLength * Math.sin(angle + Math.PI / 6));
        ctx.closePath();
        ctx.fill();
      });
    }

    // Draw motion trails in edit mode (BEFORE objects so dots don't cover text)
    if (!isPlaying) {
      objectLibrary.forEach(libObj => {
        const positions = slides
          .map(slide => slide.objects.find(o => o.id === libObj.id && o.visible))
          .filter(Boolean)
          .map(obj => ({ x: obj.x, y: obj.y }));

        if (positions.length < 2) return;

        ctx.strokeStyle = 'rgba(59, 130, 246, 0.3)';
        ctx.lineWidth = 2;
        ctx.setLineDash([5, 5]);

        ctx.beginPath();
        ctx.moveTo(positions[0].x, positions[0].y);
        for (let i = 1; i < positions.length; i++) {
          ctx.lineTo(positions[i].x, positions[i].y);
        }
        ctx.stroke();
        ctx.setLineDash([]);

        // Draw dots at keyframes
        positions.forEach((pos, idx) => {
          ctx.fillStyle = idx === slideIdx ? '#3b82f6' : 'rgba(59, 130, 246, 0.5)';
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, 4, 0, Math.PI * 2);
          ctx.fill();
        });
      });
    }

    // Draw objects (AFTER motion trails so text appears on top)
    objectsToRender.forEach(obj => {
      ctx.save();
      ctx.globalAlpha = obj.opacity ?? 1;

      const x = obj.x ?? 0;
      const y = obj.y ?? 0;
      const scale = obj.scale ?? 1;
      const size = (obj.width ?? BASE_SHAPE_SIZE) * scale;

      ctx.translate(x, y);
      if (obj.rotation) {
        ctx.rotate((obj.rotation * Math.PI) / 180);
      }

      ctx.fillStyle = obj.color || '#3b82f6';

      switch (obj.type) {
        case 'circle':
          ctx.beginPath();
          ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
          ctx.fill();
          break;

        case 'square':
          ctx.fillRect(-size / 2, -size / 2, size, size);
          break;

        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.closePath();
          ctx.fill();
          break;

        case 'rectangle': {
          const w = (obj.width ?? 100) * scale;
          const h = (obj.height ?? 60) * scale;
          ctx.fillRect(-w / 2, -h / 2, w, h);
          break;
        }

        case 'text':
          ctx.fillStyle = obj.color || '#000000';
          ctx.font = `${16 * scale}px Arial`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(obj.text || '', 0, 0);
          break;
      }

      // Draw text content for all object types (not just 'text' type)
      if (obj.text && obj.type !== 'text') {
        ctx.fillStyle = '#ffffff';
        ctx.font = `${12 * scale}px Arial`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(obj.text, 0, 0);
      }

      // Draw selection outline
      if (!isPlaying && selectedIds.includes(obj.id)) {
        ctx.strokeStyle = '#3b82f6';
        ctx.lineWidth = 2;
        const padding = 5;

        if (obj.type === 'circle') {
          ctx.beginPath();
          ctx.arc(0, 0, size / 2 + padding, 0, Math.PI * 2);
          ctx.stroke();
        } else if (obj.type === 'rectangle') {
          const w = (obj.width ?? 100) * scale;
          const h = (obj.height ?? 60) * scale;
          ctx.strokeRect(-w / 2 - padding, -h / 2 - padding, w + padding * 2, h + padding * 2);
        } else {
          ctx.strokeRect(-size / 2 - padding, -size / 2 - padding, size + padding * 2, size + padding * 2);
        }
      }

      ctx.restore();
    });
  }, [mode, currentSlide, selectedIds, isPlaying, playbackTime, slides, objectLibrary, connections, currentSlideIndex]);
  // Keep slide canvas sized to its container
  useEffect(() => {
    if (mode !== 'slides' || !canvasRef.current) return;
    const canvas = canvasRef.current;
    const container = canvas.parentElement;
    if (!container) return;

    const resize = () => {
      const rect = container.getBoundingClientRect();
      canvas.width = Math.max(1, Math.floor(rect.width));
      canvas.height = Math.max(1, Math.floor(rect.height));
      // After resizing, force a background redraw to avoid showing the page background
      requestAnimationFrame(() => {
        const ctx = canvas.getContext('2d');
        if (ctx && canvas.width && canvas.height) {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = '#1f2937';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
        }
      });
    };

    resize();
    const observer = new ResizeObserver(resize);
    observer.observe(container);
    return () => observer.disconnect();
  }, [mode]);

  // Handle dragging in slide mode
  useEffect(() => {
    if (mode !== 'slides' || !canvasRef.current) return;

    const canvas = canvasRef.current;

    const handleMouseDown = (e) => {
      if (isPlaying) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;
      const isMultiSelect = e.ctrlKey || e.metaKey;

      let foundObject = null;

      // Find clicked object (reverse order to check top objects first)
      for (const obj of currentSlide.objects.filter(o => o.visible).reverse()) {
        const scale = obj.scale ?? 1;
        let width, height;

        if (obj.type === 'rectangle' || obj.type === 'text') {
          width = (obj.width ?? 100) * scale;
          height = (obj.height ?? 60) * scale;
        } else if (obj.type === 'circle') {
          const size = (obj.width ?? BASE_SHAPE_SIZE) * scale;
          // Circle hit detection
          const dx = mouseX - obj.x;
          const dy = mouseY - obj.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= size / 2) {
            foundObject = obj;
            break;
          }
          continue;
        } else {
          const size = (obj.width ?? BASE_SHAPE_SIZE) * scale;
          width = size;
          height = size;
        }

        // Rectangle/square/triangle hit detection
        const halfWidth = width / 2;
        const halfHeight = height / 2;

        if (
          mouseX >= obj.x - halfWidth &&
          mouseX <= obj.x + halfWidth &&
          mouseY >= obj.y - halfHeight &&
          mouseY <= obj.y + halfHeight
        ) {
          foundObject = obj;
          break;
        }
      }

      if (foundObject) {
        // Handle multi-select
        if (isMultiSelect) {
          setSelectedIds(prev => {
            if (prev.includes(foundObject.id)) {
              return prev.filter(id => id !== foundObject.id);
            } else {
              return [...prev, foundObject.id];
            }
          });
        } else {
          setSelectedIds(prev => {
            const newSelection = prev.includes(foundObject.id) ? prev : [foundObject.id];

            // Store initial positions for all selected objects
            slideDragRef.current.dragging = foundObject.id;
            slideDragRef.current.offset = { x: mouseX - foundObject.x, y: mouseY - foundObject.y };
            slideDragRef.current.dragStartPositions = {};

            newSelection.forEach(id => {
              const obj = currentSlide.objects.find(o => o.id === id);
              if (obj) {
                slideDragRef.current.dragStartPositions[id] = { x: obj.x, y: obj.y };
              }
            });

            return newSelection;
          });
        }
      } else {
        // If clicked on empty canvas, deselect all
        if (!isMultiSelect) {
          setSelectedIds([]);
        }
      }
    };

    const handleMouseMove = (e) => {
      if (!slideDragRef.current.dragging) return;

      const rect = canvas.getBoundingClientRect();
      const mouseX = e.clientX - rect.left;
      const mouseY = e.clientY - rect.top;

      // Calculate delta from the primary dragged object's start position
      const primaryStartPos = slideDragRef.current.dragStartPositions[slideDragRef.current.dragging];
      if (!primaryStartPos) return;

      const newX = mouseX - slideDragRef.current.offset.x;
      const newY = mouseY - slideDragRef.current.offset.y;
      const deltaX = newX - primaryStartPos.x;
      const deltaY = newY - primaryStartPos.y;

      // Move all selected objects by the same delta
      setSlides(prev => prev.map((slide, idx) => {
        if (idx === currentSlideIndex) {
          return {
            ...slide,
            objects: slide.objects.map(obj => {
              if (selectedIds.includes(obj.id)) {
                const startPos = slideDragRef.current.dragStartPositions[obj.id];
                if (startPos) {
                  return { ...obj, x: startPos.x + deltaX, y: startPos.y + deltaY };
                }
              }
              return obj;
            })
          };
        }
        return slide;
      }));
    };

    const handleMouseUp = () => {
      slideDragRef.current.dragging = null;
    };

    canvas.addEventListener('mousedown', handleMouseDown);
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);

    return () => {
      canvas.removeEventListener('mousedown', handleMouseDown);
      document.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseup', handleMouseUp);
    };
  }, [mode, currentSlide, isPlaying]);

  // ========== END SLIDE MODE FUNCTIONS ==========

  const exportAnimation = async () => {
    if (!animationTitle.trim()) {
      setSaveMessage('Please enter a title for the animation');
      return;
    }

    const authorId = localStorage.getItem('userId');
    if (!authorId) {
      setSaveMessage('Error: User not authenticated');
      return;
    }

    setIsSaving(true);
    setSaveMessage('');

    try {
      const canvasRect = canvasRef.current?.getBoundingClientRect();

      let animationData;

      if (mode === 'slides') {
        // Save slide mode data (store connections inside each slide in slideData)
        animationData = {
          title: animationTitle,
          description: `Slide animation with ${slides.length} slides`,
          authorId,
          mode: 'slides',
          duration: totalSlideDuration,
          canvasWidth: canvasRect?.width ?? null,
          canvasHeight: canvasRect?.height ?? null,
          slideData: {
            slides,
            objectLibrary
          }
        };
      } else {
        // Save timeline mode data
        const normalized = normalizeAnimation({
          title: animationTitle,
          duration,
          durationOverride,
          objects,
          canvasWidth: canvasRect?.width ?? null,
          canvasHeight: canvasRect?.height ?? null
        });

        animationData = {
          title: animationTitle,
          description: `Animation created with ${objects.length} objects`,
          authorId,
          mode: 'timeline',
          duration: normalized.duration,
          durationOverride: normalized.durationOverride,
          canvasWidth: normalized.canvasWidth,
          canvasHeight: normalized.canvasHeight,
          connections,
          objects: normalized.objects.map(obj => ({
            id: obj.id,
            name: obj.name,
            type: obj.type,
            transitions: obj.transitions,
            children: obj.children
          }))
        };
      }

      if (currentAnimationId) {
        // Update existing animation
        await axios.put(
          `http://localhost:5000/api/animations/${currentAnimationId}`,
          animationData
        );
        setSaveMessage('✓ Animation updated successfully!');
      } else {
        // Create new animation
        const response = await axios.post('http://localhost:5000/api/animations', animationData);
        setCurrentAnimationId(response.data._id);
        setSaveMessage('✓ Animation saved successfully!');
      }

      if (mode === 'timeline') {
        const normalized = normalizeAnimation({
          duration,
          durationOverride,
          objects
        });
        setDuration(normalized.effectiveDuration || DEFAULT_ANIMATION_DURATION);
      }

      setTimeout(() => setSaveMessage(''), 3000);
    } catch (error) {
      console.error('Error saving animation:', error);
      setSaveMessage('✗ Error saving animation: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const renderMotionTrail = (obj) => {
    if (isPlaying || obj.transitions.length < 2 || useParityPreview) return null;
    const points = obj.transitions.map(t => ({ x: t.x, y: t.y }));

    return (
      <svg key={`trail-${obj.id}`} className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
        {points.map((point, i) => {
          if (i === points.length - 1) return null;
          const nextPoint = points[i + 1];
          return <line key={i} x1={point.x} y1={point.y} x2={nextPoint.x} y2={nextPoint.y} stroke="rgba(255, 255, 255, 0.3)" strokeWidth="2" strokeDasharray="5,5" />;
        })}
        {points.map((point, i) => <circle key={`dot-${i}`} cx={point.x} cy={point.y} r="3" fill="rgba(255, 255, 255, 0.5)" />)}
      </svg>
    );
  };

  const getObjectAnchor = (obj) => {
    if (!obj?.transitions?.length) return null;
    if (isPlaying) {
      const state = getObjectStateAtTime(obj, currentTime);
      if (!state) return null;
      return { x: state.x ?? 0, y: state.y ?? 0 };
    }
    const last = obj.transitions[obj.transitions.length - 1];
    return { x: last.x ?? 0, y: last.y ?? 0 };
  };

  const renderConnections = () => {
    // For slides mode we draw connections directly on the canvas; overlay is for timeline mode only
    if (mode === 'slides' || !connections.length || useParityPreview) return null;
    return (
      <svg className="absolute inset-0 pointer-events-none" style={{ width: '100%', height: '100%' }}>
        <defs>
          <marker
            id="arrowhead"
            markerWidth="8"
            markerHeight="6"
            refX="7"
            refY="3"
            orient="auto"
          >
            <polygon points="0 0, 8 3, 0 6" fill="#facc15" />
          </marker>
        </defs>
        {connections.map((conn, index) => {
          const fromObj = objects.find(obj => obj.id === conn.fromId);
          const toObj = objects.find(obj => obj.id === conn.toId);
          if (!fromObj || !toObj) return null;
          const from = getObjectAnchor(fromObj);
          const to = getObjectAnchor(toObj);
          if (!from || !to) return null;
          return (
            <line
              key={`${conn.fromId}-${conn.toId}-${index}`}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              stroke={conn.color || '#facc15'}
              strokeWidth={conn.width || 2}
              markerEnd="url(#arrowhead)"
            />
          );
        })}
      </svg>
    );
  };

  const renderShape = (obj, state, isGhost = false, transIndex = null, disableEvents = false) => {
    if (!state) return null;
    const size = 50 * (state.scale ?? 1);
    const isSelected = selectedIds.includes(obj.id) && selectedTransitionIndex === transIndex;
    const borderStyle = isSelected && !isPlaying ? '3px solid white' : isGhost ? '2px dashed rgba(255,255,255,0.5)' : (selectedIds.includes(obj.id) && !isPlaying ? '2px solid rgba(255,255,255,0.6)' : 'none');
    const fillColor = state.fillColor ?? state.color;
    const strokeColor = state.strokeColor ?? null;
    const borderWidth = state.borderWidth ?? 2;

    const baseStyle = {
      position: 'absolute',
      left: `${state.x}px`,
      top: `${state.y}px`,
      opacity: isGhost ? (state.opacity ?? 1) * 0.4 : (state.opacity ?? 1),
      transform: `translate(-50%, -50%) rotate(${state.rotation ?? 0}deg)`,
      cursor: isPlaying ? 'default' : 'move',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: `${12 * (state.scale ?? 1)}px`,
      fontWeight: 'bold',
      color: 'white',
      textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
      userSelect: 'none',
      whiteSpace: 'pre-wrap',
      pointerEvents: isGhost || disableEvents ? 'none' : 'auto', // ghost shouldn't block mouse events
      zIndex: isSelected ? 20 : 5
    };

    const textContent = state.text || '';

    const resizeHandle = (!isPlaying && !isGhost && isSelected) ? (
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          right: -8,
          width: 12,
          height: 12,
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
          cursor: 'nwse-resize',
          zIndex: 30
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, obj.id, transIndex, true);
        }}
      />
    ) : null;

    if (obj.type === 'circle') {
      return (
        <div
          key={`${obj.id}-${transIndex}-${isGhost ? 'ghost' : 'solid'}`}
          style={{
            ...baseStyle,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor,
            border: strokeColor ? `${borderWidth}px solid ${strokeColor}` : borderStyle
          }}
          onMouseDown={disableEvents ? undefined : (e) => handleMouseDown(e, obj.id, transIndex)}
          onContextMenu={disableEvents ? undefined : (e) => handleContextMenu(e, obj.id, transIndex)}
        >
          {textContent}
          {resizeHandle}
        </div>
      );
    } else if (obj.type === 'square') {
      return (
        <div
          key={`${obj.id}-${transIndex}-${isGhost ? 'ghost' : 'solid'}`}
          style={{
            ...baseStyle,
            width: `${size}px`,
            height: `${size}px`,
            backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor,
            border: strokeColor ? `${borderWidth}px solid ${strokeColor}` : borderStyle
          }}
          onMouseDown={disableEvents ? undefined : (e) => handleMouseDown(e, obj.id, transIndex)}
          onContextMenu={disableEvents ? undefined : (e) => handleContextMenu(e, obj.id, transIndex)}
        >
          {textContent}
          {resizeHandle}
        </div>
      );
    } else if (obj.type === 'rectangle') {
      const width = ((state.width ?? 100) * (state.scale ?? 1));
      const height = ((state.height ?? 60) * (state.scale ?? 1));
      const border = strokeColor ? `${borderWidth}px solid ${strokeColor}` : borderStyle;
      return (
        <div
          key={`${obj.id}-${transIndex}-${isGhost ? 'ghost' : 'solid'}`}
          style={{
            ...baseStyle,
            width: `${width}px`,
            height: `${height}px`,
            backgroundColor: fillColor === 'transparent' ? 'transparent' : fillColor,
            border,
            borderTop: state.openTop && strokeColor ? 'none' : undefined
          }}
          onMouseDown={disableEvents ? undefined : (e) => handleMouseDown(e, obj.id, transIndex)}
          onContextMenu={disableEvents ? undefined : (e) => handleContextMenu(e, obj.id, transIndex)}
        >
          {textContent}
          {resizeHandle}
        </div>
      );
    } else if (obj.type === 'triangle') {
      return (
        <div
          key={`${obj.id}-${transIndex}-${isGhost ? 'ghost' : 'solid'}`}
          style={{ ...baseStyle }}
          onMouseDown={disableEvents ? undefined : (e) => handleMouseDown(e, obj.id, transIndex)}
          onContextMenu={disableEvents ? undefined : (e) => handleContextMenu(e, obj.id, transIndex)}
        >
          <div style={{ width: 0, height: 0, borderLeft: `${size / 2}px solid transparent`, borderRight: `${size / 2}px solid transparent`, borderBottom: `${size}px solid ${fillColor || state.color}`, position: 'relative' }}>
            <span style={{ position: 'absolute', left: '50%', top: `${size * 0.4}px`, transform: 'translateX(-50%)', whiteSpace: 'nowrap' }}>{textContent}</span>
          </div>
          {resizeHandle}
        </div>
      );
    } else if (obj.type === 'text') {
      const width = ((state.width ?? 200) * (state.scale ?? 1));
      const height = ((state.height ?? 40) * (state.scale ?? 1));
      return (
        <div
          key={`${obj.id}-${transIndex}-${isGhost ? 'ghost' : 'solid'}`}
          style={{
            ...baseStyle,
            width: `${width}px`,
            height: `${height}px`,
            border: borderStyle || '1px solid rgba(255,255,255,0.2)',
            backgroundColor: 'transparent',
            color: state.color,
            fontSize: `${Math.min(height * 0.8, width * 0.1)}px`,
            padding: '8px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            textAlign: 'center',
            whiteSpace: 'pre-wrap',
            wordBreak: 'break-word'
          }}
          onMouseDown={disableEvents ? undefined : (e) => handleMouseDown(e, obj.id, transIndex)}
          onContextMenu={disableEvents ? undefined : (e) => handleContextMenu(e, obj.id, transIndex)}
          onDoubleClick={() => {
            if (!disableEvents && !isPlaying && !isGhost) {
              const newText = prompt('Enter text:', state.text);
              if (newText !== null) {
                updateTransition(obj.id, transIndex, { text: newText });
              }
            }
          }}
        >
          {state.text}
          {resizeHandle}
        </div>
      );
    }
  };

  const getCompoundStatesFromTransition = (obj, parentTransition) => {
    if (!obj || !parentTransition) return null;
    const children = (obj.children || [])
      .map(child => {
        const childTransition = getTransitionSnapshot(child) || (child.transitions ? child.transitions[child.transitions.length - 1] : null);
        return composeChildState(childTransition, parentTransition);
      })
      .filter(Boolean);
    return { parent: parentTransition, children };
  };

  const renderCompound = (obj, state, isGhost = false, transIndex = null) => {
    if (!obj || !state) return null;
    const compound = isPlaying
      ? getCompoundStatesAtTime(obj, currentTime)
      : getCompoundStatesFromTransition(obj, state);
    if (!compound) return null;

    const bounds = getObjectBounds(obj, compound.parent);
    const width = bounds?.width ?? 0;
    const height = bounds?.height ?? 0;
    const isSelected = selectedIds.includes(obj.id) && selectedTransitionIndex === transIndex;
    const borderStyle = isSelected && !isPlaying ? '2px dashed rgba(255,255,255,0.7)' : 'none';
    const resizeHandle = (!isPlaying && !isGhost && isSelected && bounds) ? (
      <div
        style={{
          position: 'absolute',
          bottom: -8,
          right: -8,
          width: 12,
          height: 12,
          backgroundColor: 'white',
          border: '2px solid #3b82f6',
          cursor: 'nwse-resize',
          zIndex: 30
        }}
        onMouseDown={(e) => {
          e.stopPropagation();
          handleMouseDown(e, obj.id, transIndex, true);
        }}
      />
    ) : null;

    return (
      <React.Fragment key={`${obj.id}-${transIndex}-${isGhost ? 'ghost' : 'solid'}`}>
        {!isGhost && bounds && (
          <div
            style={{
              position: 'absolute',
              left: `${compound.parent.x}px`,
              top: `${compound.parent.y}px`,
              width: `${width}px`,
              height: `${height}px`,
              transform: `translate(-50%, -50%) rotate(${compound.parent.rotation ?? 0}deg)`,
              border: borderStyle,
              backgroundColor: 'transparent',
              cursor: isPlaying ? 'default' : 'move',
              zIndex: isSelected ? 20 : 5
            }}
            onMouseDown={(e) => handleMouseDown(e, obj.id, transIndex)}
            onContextMenu={(e) => handleContextMenu(e, obj.id, transIndex)}
          >
            {resizeHandle}
          </div>
        )}
        {obj.children?.map((child, index) => {
          const childState = compound.children[index];
          if (!childState) return null;
          return renderShape(child, childState, isGhost, transIndex, true);
        })}
      </React.Fragment>
    );
  };

  const renderParityFrame = () => {
    if (!useParityPreview || !parityCanvasRef.current) return;
    const canvas = parityCanvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#f3f4f6';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    if (!objects || objects.length === 0) return;

    const sourceWidth = canvasMeta.width ?? canvas.width;
    const sourceHeight = canvasMeta.height ?? canvas.height;
    const { scale, offsetX, offsetY } = getCanvasTransform(
      { canvasWidth: sourceWidth, canvasHeight: sourceHeight },
      canvas
    );

    ctx.save();
    ctx.translate(offsetX, offsetY);
    ctx.scale(scale, scale);

    const drawCanvasShape = (shapeType, state) => {
      if (!state || state.opacity <= 0) return;
      ctx.save();
      ctx.globalAlpha = Math.max(0, Math.min(1, state.opacity ?? 1));
      const fillColor = state.fillColor ?? state.color;
      const strokeColor = state.strokeColor ?? null;
      const borderWidth = state.borderWidth ?? 2;

      const x = state.x ?? 0;
      const y = state.y ?? 0;
      const scaleValue = state.scale ?? 1;
      const size = BASE_SHAPE_SIZE * scaleValue;

      ctx.translate(x, y);
      if (state.rotation) {
        ctx.rotate((state.rotation * Math.PI) / 180);
      }

      switch (shapeType) {
        case 'circle':
          if (fillColor && fillColor !== 'transparent') {
            ctx.fillStyle = fillColor;
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.fill();
          }
          if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = borderWidth;
            ctx.beginPath();
            ctx.arc(0, 0, size / 2, 0, Math.PI * 2);
            ctx.stroke();
          }
          break;
        case 'square':
          if (fillColor && fillColor !== 'transparent') {
            ctx.fillStyle = fillColor;
            ctx.fillRect(-size / 2, -size / 2, size, size);
          }
          if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = borderWidth;
            ctx.strokeRect(-size / 2, -size / 2, size, size);
          }
          break;
        case 'triangle':
          ctx.beginPath();
          ctx.moveTo(0, -size / 2);
          ctx.lineTo(size / 2, size / 2);
          ctx.lineTo(-size / 2, size / 2);
          ctx.closePath();
          if (fillColor && fillColor !== 'transparent') {
            ctx.fillStyle = fillColor;
            ctx.fill();
          }
          if (strokeColor) {
            ctx.strokeStyle = strokeColor;
            ctx.lineWidth = borderWidth;
            ctx.stroke();
          }
          break;
        case 'rectangle': {
          const w = (state.width ?? 100) * scaleValue;
          const h = (state.height ?? 60) * scaleValue;
          if (state.fillColor && state.fillColor !== 'transparent') {
            ctx.fillStyle = state.fillColor;
            ctx.fillRect(-w / 2, -h / 2, w, h);
          }
          if (state.strokeColor) {
            ctx.strokeStyle = state.strokeColor;
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
        case 'text':
          ctx.fillStyle = state.color || '#000000';
          ctx.font = '16px Arial';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText(state.text || '', 0, 0);
          break;
        default:
          break;
      }

      ctx.restore();
    };

    objects.forEach(obj => {
      if (obj.children?.length) {
        const compound = getCompoundStatesAtTime(obj, currentTime);
        if (!compound) return;
        obj.children.forEach((child, index) => {
          drawCanvasShape(child.type, compound.children[index]);
        });
        return;
      }

      const state = getObjectStateAtTime(obj, currentTime);
      drawCanvasShape(obj.type, state);
    });

    ctx.restore();
  };

  useEffect(() => {
    if (!useParityPreview) return;
    renderParityFrame();
  }, [useParityPreview, currentTime, objects, canvasMeta]);

  // Slide thumbnails drag-to-scroll handlers (mouse + touch)
  const handleThumbMouseDown = (e) => {
    const el = slideThumbsRef.current;
    if (!el) return;
    thumbDragging.current = true;
    thumbStartX.current = e.pageX - el.offsetLeft;
    thumbStartScroll.current = el.scrollLeft;
    el.classList.add('cursor-grabbing');
    e.preventDefault();
  };

  const handleThumbMouseMove = (e) => {
    const el = slideThumbsRef.current;
    if (!el || !thumbDragging.current) return;
    const x = e.pageX - el.offsetLeft;
    const walk = x - thumbStartX.current;
    el.scrollLeft = thumbStartScroll.current - walk;
  };

  const handleThumbMouseUp = () => {
    const el = slideThumbsRef.current;
    thumbDragging.current = false;
    if (el) el.classList.remove('cursor-grabbing');
  };

  const handleThumbTouchStart = (e) => {
    const el = slideThumbsRef.current;
    if (!el) return;
    thumbDragging.current = true;
    thumbStartX.current = e.touches[0].pageX - el.offsetLeft;
    thumbStartScroll.current = el.scrollLeft;
  };

  const handleThumbTouchMove = (e) => {
    const el = slideThumbsRef.current;
    if (!el || !thumbDragging.current) return;
    const x = e.touches[0].pageX - el.offsetLeft;
    const walk = x - thumbStartX.current;
    el.scrollLeft = thumbStartScroll.current - walk;
  };

  return (
    <div className="h-screen flex flex-col bg-gray-900 text-white">
      {showProjectSelector && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg p-8 max-w-2xl w-full mx-4 max-h-[600px] overflow-y-auto">
            <h2 className="text-2xl font-bold mb-6">Animation Projects</h2>

            <div className="mb-6">
              <h3 className="text-lg font-semibold mb-3">Create New Animation</h3>
              <p className="text-sm text-gray-400 mb-4">Choose an animation mode. This cannot be changed later.</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => createNewAnimation('timeline')}
                  className="flex flex-col items-center gap-3 px-6 py-6 bg-gray-700 hover:bg-gray-600 rounded-lg border-2 border-transparent hover:border-blue-500 transition"
                >
                  <GitBranch size={32} className="text-blue-400" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Timeline Mode</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Keyframe-based animations with continuous timeline
                    </div>
                  </div>
                </button>
                <button
                  onClick={() => createNewAnimation('slides')}
                  className="flex flex-col items-center gap-3 px-6 py-6 bg-gray-700 hover:bg-gray-600 rounded-lg border-2 border-transparent hover:border-green-500 transition"
                >
                  <Layers size={32} className="text-green-400" />
                  <div className="text-center">
                    <div className="font-semibold text-lg">Slide Mode</div>
                    <div className="text-xs text-gray-400 mt-1">
                      Slide-based animations with automatic transitions
                    </div>
                  </div>
                </button>
              </div>
            </div>

            {isLoadingAnimations ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Loading animations...</p>
              </div>
            ) : animations.length > 0 ? (
              <div>
                <h3 className="text-lg font-semibold mb-4">Your Animations</h3>
                <div className="grid grid-cols-1 gap-3 max-h-64 overflow-y-auto">
                  {animations.map((animation) => (
                    <button
                      key={animation._id}
                      onClick={() => loadAnimation(animation._id)}
                      className="p-4 bg-gray-700 hover:bg-gray-600 rounded-lg text-left transition"
                    >
                      <div className="flex items-center gap-3">
                        {animation.mode === 'slides' ? (
                          <Layers size={20} className="text-green-400" />
                        ) : (
                          <GitBranch size={20} className="text-blue-400" />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-semibold">{animation.title}</h4>
                            <span className={`text-xs px-2 py-0.5 rounded ${animation.mode === 'slides' ? 'bg-green-600' : 'bg-blue-600'}`}>
                              {animation.mode === 'slides' ? 'Slides' : 'Timeline'}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400">
                            {animation.mode === 'slides'
                              ? `${animation.slideData?.slides?.length || 0} slides`
                              : `${animation.objects?.length || 0} objects`
                            } ·
                            {new Date(animation.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-400">No animations yet. Create one to get started!</p>
              </div>
            )}
          </div>
        </div>
      )}

      <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
        <div className="flex items-center gap-3 ">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="w-10 h-10 rounded-xl mq-header-logo flex items-center justify-center">
              <Brain className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold mq-header-title text-white ">MindQuest -</h1>
            </div>
          </Link>
          <h1 className="text-xl font-bold">Animation Studio</h1>
          <span className={`text-xs px-3 py-1 rounded-full flex items-center gap-1.5 ${mode === 'slides' ? 'bg-green-600' : 'bg-blue-600'}`}>
            {mode === 'slides' ? <Layers size={14} /> : <GitBranch size={14} />}
            {mode === 'slides' ? 'Slide Mode' : 'Timeline Mode'}
          </span>
          {currentAnimationId && (
            <button
              onClick={() => setShowProjectSelector(true)}
              className="flex items-center gap-2 px-3 py-1 text-sm bg-gray-700 hover:bg-gray-600 rounded"
            >
              <FolderOpen size={16} />
              Change Project
            </button>
          )}
        </div>
        <div className="flex gap-3 items-center">
          {/* <button
            onClick={() => setUseParityPreview(prev => !prev)}
            className={`px-3 py-2 rounded text-sm border ${useParityPreview ? 'bg-blue-600 border-blue-500' : 'bg-gray-700 border-gray-600 hover:bg-gray-600'}`}
          >
            {useParityPreview ? 'Parity Preview: On' : 'Parity Preview: Off'}
          </button> */}
          <button
            onClick={() => setShowStudentPreview(true)}
            className="px-3 py-2 rounded text-sm border bg-gray-700 border-gray-600 hover:bg-gray-600"
          >
            Student Preview
          </button>
          <input
            type="text"
            value={animationTitle}
            onChange={(e) => setAnimationTitle(e.target.value)}
            placeholder="Enter animation title..."
            className="px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white placeholder-gray-400 focus:outline-none focus:border-blue-500"
          />
          <button
            onClick={exportAnimation}
            disabled={isSaving}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 rounded disabled:bg-gray-600 disabled:cursor-not-allowed"
          >
            <Save size={18} />
            {isSaving ? 'Saving...' : 'Save to DB'}
          </button>
          {saveMessage && (
            <span className={`text-sm whitespace-nowrap ${saveMessage.startsWith('✓') ? 'text-green-400' : 'text-red-400'}`}>
              {saveMessage}
            </span>
          )}
        </div>
      </div>

      {/* ========== MAIN CONTENT AREA ========== */}
      <div className="flex flex-1 overflow-hidden">
        {mode === 'timeline' ? (
          // TIMELINE MODE UI (existing)
          <>
            <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
              <div className="mb-4">
                <h2 className="text-sm font-semibold mb-2">Add Objects</h2>
                <div className="grid grid-cols-2 gap-2">
                  <button onClick={() => addObject('circle')} className="p-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center">
                    <Circle size={20} />
                  </button>
                  <button onClick={() => addObject('square')} className="p-2 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center">
                    <Square size={20} />
                  </button>
                  <button onClick={() => addObject('triangle')} className="p-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center">
                    <Triangle size={20} />
                  </button>
                  <button onClick={() => addObject('rectangle')} className="p-2 bg-orange-600 hover:bg-orange-700 rounded text-xs">
                    Rect
                  </button>
                  <button onClick={() => addObject('text')} className="p-2 bg-purple-600 hover:bg-purple-700 rounded text-xs col-span-2">
                    Text
                  </button>
                </div>
                <div className="mt-4">
                  <h3 className="text-xs text-gray-400 mb-2">General</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {generalTemplates.map((template) => (
                      <button
                        key={template.label}
                        onClick={() => addObject(template.type, 0, template.overrides, template.label)}
                        className="px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xs text-gray-400 mb-2">Data Structures</h3>
                  <div className="grid grid-cols-2 gap-2">
                    {dataStructureTemplates.map((template) => (
                      <button
                        key={template.label}
                        onClick={() => addObject(template.type, 0, template.overrides, template.label)}
                        className="px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs"
                      >
                        {template.label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="mt-4">
                  <h3 className="text-xs text-gray-400 mb-2">Saved Objects</h3>
                  {isLoadingSavedObjects ? (
                    <p className="text-[10px] text-gray-500">Loading saved objects...</p>
                  ) : savedObjects.length > 0 ? (
                    <div className="grid grid-cols-2 gap-2">
                      {savedObjects.map((saved) => (
                        <div key={saved.id} className="flex items-center justify-between bg-gray-800 rounded">
                          <button
                            onClick={() => addSavedObjectToCanvas(saved)}
                            className="flex-1 text-left px-2 py-2 hover:bg-gray-700 rounded-l text-xs"
                            title={saved.name}
                          >
                            {saved.name}
                          </button>
                          <button
                            onClick={(e) => { e.stopPropagation(); if (confirm('Delete saved object from library?')) deleteSavedObject(saved.id); }}
                            className="px-2 py-2 hover:bg-red-700 rounded-r text-xs bg-transparent"
                            title="Delete from library"
                          >
                            <Trash2 size={14} />
                          </button>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[10px] text-gray-500">No saved objects yet.</p>
                  )}
                </div>
                <div className="mt-4">
                  <h3 className="text-xs text-gray-400 mb-2">Connections</h3>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={addConnection}
                      disabled={selectedIds.length < 2}
                      className="px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs disabled:opacity-50"
                    >
                      Connect
                    </button>
                    <button
                      onClick={clearConnectionsForSelection}
                      disabled={selectedIds.length === 0}
                      className="px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs disabled:opacity-50"
                    >
                      Clear
                    </button>
                    <div className="col-span-2 flex items-center gap-2">
                      <label className="flex items-center text-xs">
                        <input type="checkbox" className="mr-2" checked={deleteMergedFromLibrary} onChange={(e) => setDeleteMergedFromLibrary(e.target.checked)} />
                        Delete originals from library
                      </label>
                      <button
                        onClick={mergeSelectedObjects}
                        disabled={selectedIds.length < 2}
                        className="px-2 py-2 bg-gray-700 hover:bg-gray-600 rounded text-xs disabled:opacity-50 ml-auto"
                      >
                        Merge (Overlap)
                      </button>
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-500 mt-2">Connect uses the first two selected objects.</p>
                </div>
              </div>

              <div>
                <h2 className="text-sm font-semibold mb-2">Objects ({selectedIds.length} selected)</h2>
                {objects.map(obj => (
                  <div key={obj.id} className={`flex items-center justify-between p-2 mb-1 rounded cursor-pointer ${selectedIds.includes(obj.id) ? 'bg-gray-700' : 'bg-gray-750 hover:bg-gray-700'}`}
                    onClick={(e) => {
                      if (e.ctrlKey || e.metaKey) {
                        setSelectedIds(prev => prev.includes(obj.id) ? prev.filter(id => id !== obj.id) : [...prev, obj.id]);
                      } else {
                        setSelectedIds([obj.id]);
                        setSelectedTransitionIndex(obj.transitions.length - 1);
                      }
                    }}
                    onContextMenu={(e) => handleContextMenu(e, obj.id, undefined)}
                  >
                    <span className="text-sm">{obj.name}</span>
                    <button onClick={(e) => { e.stopPropagation(); deleteObject(obj.id); }} className="text-red-400 hover:text-red-300"><Trash2 size={16} /></button>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex-1 flex flex-col min-w-0">
              <div
                ref={canvasRef}
                className="flex-1 bg-gray-700 relative overflow-hidden"
                onMouseDown={handleCanvasMouseDown}
                onMouseMove={handleCanvasMouseMove}
                onMouseUp={handleCanvasMouseUp}
              >
                <canvas
                  ref={parityCanvasRef}
                  className={`absolute inset-0 ${useParityPreview ? 'block' : 'hidden'}`}
                  style={{ pointerEvents: 'none' }}
                />
                {renderConnections()}
                {objects.map(obj => renderMotionTrail(obj))}

                {objects.map(obj => {
                  const allTransitions = obj.transitions.map((trans, idx) => ({ trans, idx }));

                  return (
                    <React.Fragment key={obj.id}>
                      {!isPlaying && !useParityPreview && allTransitions.slice(0, -1).map(({ trans, idx }) => (
                        obj.children?.length ? renderCompound(obj, trans, true, idx) : renderShape(obj, trans, true, idx)
                      ))}
                      {!useParityPreview && (obj.children?.length
                        ? renderCompound(obj, isPlaying ? getObjectStateAtTime(obj, currentTime) : obj.transitions[obj.transitions.length - 1], false, obj.transitions.length - 1)
                        : renderShape(obj, isPlaying ? getObjectStateAtTime(obj, currentTime) : obj.transitions[obj.transitions.length - 1], false, obj.transitions.length - 1))}
                    </React.Fragment>
                  );
                })}

                <div
                  className="absolute border border-dashed border-white/40 pointer-events-none"
                  style={{
                    left: safeAreaPadding,
                    right: safeAreaPadding,
                    top: safeAreaPadding,
                    bottom: safeAreaPadding
                  }}
                >
                  <div className="absolute -top-5 left-0 text-[10px] text-white/60">Safe area</div>
                </div>

                {selectionBox && (
                  <div
                    style={{
                      position: 'absolute',
                      left: selectionBox.x,
                      top: selectionBox.y,
                      width: selectionBox.width,
                      height: selectionBox.height,
                      border: '2px dashed #3b82f6',
                      backgroundColor: 'rgba(59, 130, 246, 0.1)',
                      pointerEvents: 'none'
                    }}
                  />
                )}
              </div>

              <div className="h-48 bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center gap-4 mb-4">
                  <button onClick={togglePlay} className="p-2 bg-blue-600 hover:bg-blue-700 rounded">{isPlaying ? <Pause size={20} /> : <Play size={20} />}</button>
                  <span className="text-sm">{currentTime.toFixed(2)}s / {duration}s</span>
                  {timelineWarnings.length > 0 && (
                    <div className="text-xs text-yellow-300 bg-yellow-500/10 border border-yellow-500/30 rounded px-2 py-1">
                      {timelineWarnings.length} warning{timelineWarnings.length > 1 ? 's' : ''}
                    </div>
                  )}
                  {/* <button 
              onClick={() => {
                const time = prompt('Enter time to add object (in seconds):', currentTime.toFixed(2));
                if (time !== null) {
                  const type = prompt('Enter object type (circle, square, triangle, rectangle, text):', 'circle');
                  if (type && ['circle', 'square', 'triangle', 'rectangle', 'text'].includes(type.toLowerCase())) {
                    addObject(type.toLowerCase(), parseFloat(time));
                  } else {
                    alert('Invalid object type');
                  }
                }
              }}
              className="px-
            >
              Add at Time
            </button> */}
                </div>
                <div className="relative h-16 bg-gray-900 rounded overflow-x-auto">
                  <input type="range" min="0" max={duration} step="0.01" value={currentTime} onChange={(e) => setCurrentTime(parseFloat(e.target.value))} className="absolute w-full h-full opacity-0 cursor-pointer z-10" disabled={isPlaying} />
                  <div className="absolute w-full h-full flex items-center px-2">
                    <div className="w-full h-8 bg-gray-700 relative">
                      <div className="absolute h-full bg-blue-500 opacity-30" style={{ width: `${(currentTime / duration) * 100}%` }} />
                      {derivedDuration > 0 && (
                        <div
                          className="absolute top-0 h-full"
                          style={{ left: `${endMarkerPosition}%` }}
                          title={`Animation end: ${derivedDuration.toFixed(2)}s`}
                        >
                          <div className="h-full w-px bg-yellow-400" />
                          <div className="absolute -top-5 -left-3 text-[10px] text-yellow-300">End</div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                {timelineWarnings.length > 0 && (
                  <div className="mt-3 space-y-1 text-xs text-yellow-200">
                    {timelineWarnings.map((warning, index) => (
                      <div key={`${warning}-${index}`} className="flex items-start gap-2">
                        <span className="mt-0.5 h-1.5 w-1.5 rounded-full bg-yellow-300" />
                        <span>{warning}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="w-72 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
              {selectedObject && selectedTransitionIndex !== null && selectedObject.transitions[selectedTransitionIndex] ? (
                <>
                  <p className="text-xs text-gray-400 mb-3" title="Keyframes define a start state; easing applies over the duration to the next keyframe.">
                    {selectedTransitionIndex === 0 ? 'Initial State' : `Transition ${selectedTransitionIndex}`}
                  </p>
                  {selectedTransitionIndex > 0 && (
                    <div className="text-xs text-gray-400 mb-3">
                      <span
                        className="inline-flex items-center gap-1"
                        title="Easing is applied from this keyframe to the next keyframe."
                      >
                        Easing: {selectedObject.transitions[selectedTransitionIndex - 1]?.easing || 'linear'}
                        <span className="text-gray-500">ⓘ</span>
                      </span>
                    </div>
                  )}
                  {selectedTransitionIndex > 0 && (
                    <div className="mb-4 p-2 bg-gray-700 rounded">
                      <button onClick={() => deleteTransition(selectedObject.id, selectedTransitionIndex)} className="w-full text-xs px-2 py-1 bg-red-600 hover:bg-red-700 rounded">Delete Transition</button>
                    </div>
                  )}
                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs mb-1">Text</label>
                      <input type="text" value={selectedObject.transitions[selectedTransitionIndex].text || ''} onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { text: e.target.value })} className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm" placeholder="Enter text..." />
                    </div>
                    {selectedObject.type === 'rectangle' && (
                      <>
                        <div>
                          <label className="block text-xs mb-1">Width: {selectedObject.transitions[selectedTransitionIndex].width ?? 100}</label>
                          <input type="range" min="20" max="300" value={selectedObject.transitions[selectedTransitionIndex].width ?? 100} onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { width: parseInt(e.target.value) })} className="w-full" />
                        </div>
                        <div>
                          <label className="block text-xs mb-1">Height: {selectedObject.transitions[selectedTransitionIndex].height ?? 60}</label>
                          <input type="range" min="20" max="300" value={selectedObject.transitions[selectedTransitionIndex].height ?? 60} onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { height: parseInt(e.target.value) })} className="w-full" />
                        </div>
                      </>
                    )}
                    <div>
                      <label className="block text-xs mb-1">Scale: {(selectedObject.transitions[selectedTransitionIndex].scale ?? 1).toFixed(1)}</label>
                      <input type="range" min="0.1" max="3" step="0.1" value={selectedObject.transitions[selectedTransitionIndex].scale ?? 1} onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { scale: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Rotation: {selectedObject.transitions[selectedTransitionIndex].rotation ?? 0}°</label>
                      <input type="range" min="0" max="360" value={selectedObject.transitions[selectedTransitionIndex].rotation ?? 0} onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { rotation: parseInt(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Opacity: {(selectedObject.transitions[selectedTransitionIndex].opacity ?? 1).toFixed(1)}</label>
                      <input type="range" min="0" max="1" step="0.1" value={selectedObject.transitions[selectedTransitionIndex].opacity ?? 1} onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { opacity: parseFloat(e.target.value) })} className="w-full" />
                    </div>
                    <div>
                      <label className="block text-xs mb-1">Color</label>
                      <input
                        type="color"
                        value={selectedObject.transitions[selectedTransitionIndex].color ?? '#ffffff'}
                        onChange={(e) => {
                          const color = e.target.value;
                          const current = selectedObject.transitions[selectedTransitionIndex];
                          const updates = { color };
                          if (current?.fillColor === 'transparent') {
                            updates.strokeColor = color;
                          }
                          updateTransition(selectedObject.id, selectedTransitionIndex, updates);
                        }}
                        className="w-full h-8 rounded"
                      />
                    </div>
                    {['rectangle', 'square', 'circle'].includes(selectedObject.type) && (
                      <div className="space-y-2">
                        <label className="flex items-center gap-2 text-xs">
                          <input
                            type="checkbox"
                            checked={selectedObject.transitions[selectedTransitionIndex].fillColor === 'transparent'}
                            onChange={(e) => {
                              const current = selectedObject.transitions[selectedTransitionIndex];
                              if (e.target.checked) {
                                updateTransition(selectedObject.id, selectedTransitionIndex, {
                                  fillColor: 'transparent',
                                  strokeColor: current.strokeColor || current.color || '#ffffff',
                                  borderWidth: current.borderWidth ?? 2
                                });
                              } else {
                                updateTransition(selectedObject.id, selectedTransitionIndex, {
                                  fillColor: null,
                                  strokeColor: null
                                });
                              }
                            }}
                          />
                          Hollow
                        </label>
                        {(selectedObject.transitions[selectedTransitionIndex].fillColor === 'transparent' || selectedObject.transitions[selectedTransitionIndex].strokeColor) && (
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="block text-xs mb-1">Stroke</label>
                              <input
                                type="color"
                                value={selectedObject.transitions[selectedTransitionIndex].strokeColor ?? selectedObject.transitions[selectedTransitionIndex].color ?? '#ffffff'}
                                onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { strokeColor: e.target.value })}
                                className="w-full h-8 rounded"
                              />
                            </div>
                            <div>
                              <label className="block text-xs mb-1">Border: {selectedObject.transitions[selectedTransitionIndex].borderWidth ?? 2}</label>
                              <input
                                type="range"
                                min="1"
                                max="10"
                                value={selectedObject.transitions[selectedTransitionIndex].borderWidth ?? 2}
                                onChange={(e) => updateTransition(selectedObject.id, selectedTransitionIndex, { borderWidth: parseInt(e.target.value) })}
                                className="w-full"
                              />
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="text-sm text-gray-400">{selectedIds.length > 1 ? `${selectedIds.length} objects selected - right-click to add transition` : 'Select an object to edit'}</div>
              )}
            </div>
          </>
        ) : (
          // SLIDE MODE UI
          <>
            {/* Left Sidebar - Object Library */}
            <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
              <h2 className="text-sm font-semibold mb-3">Object Library</h2>

              <div className="mb-4">
                <p className="text-xs text-gray-400 mb-2">Create Objects</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => createSlideObject('circle')}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded flex items-center justify-center"
                  >
                    <Circle size={20} />
                  </button>
                  <button
                    onClick={() => createSlideObject('square')}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded flex items-center justify-center"
                  >
                    <Square size={20} />
                  </button>
                  <button
                    onClick={() => createSlideObject('triangle')}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded flex items-center justify-center"
                  >
                    <Triangle size={20} />
                  </button>
                  <button
                    onClick={() => createSlideObject('rectangle')}
                    className="p-2 bg-orange-600 hover:bg-orange-700 rounded text-xs"
                  >
                    Rect
                  </button>
                  <button
                    onClick={() => createSlideObject('text')}
                    className="p-2 bg-purple-600 hover:bg-purple-700 rounded text-xs col-span-2"
                  >
                    Text
                  </button>
                </div>
              </div>

              <div>
                <p className="text-xs text-gray-400 mb-2">All Objects</p>
                {objectLibrary.map(obj => {
                  const inCurrentSlide = currentSlide.objects.some(o => o.id === obj.id);
                  const isVisible = currentSlide.objects.find(o => o.id === obj.id)?.visible;

                  return (
                    <div
                      key={obj.id}
                      className={`flex items-center gap-2 p-2 mb-1 rounded text-xs ${selectedIds.includes(obj.id) ? 'bg-blue-700' : 'bg-gray-700'
                        }`}
                      onClick={() => {
                        if (inCurrentSlide) {
                          setSelectedIds([obj.id]);
                        }
                      }}
                    >
                      <div
                        className="w-4 h-4 rounded"
                        style={{ backgroundColor: obj.color }}
                      />
                      <span className="flex-1">{obj.name}</span>
                      {inCurrentSlide && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleSlideObjectVisibility(obj.id);
                          }}
                          className="p-1 hover:bg-gray-600 rounded"
                          title={isVisible ? 'Hide' : 'Show'}
                        >
                          {isVisible ? <Eye size={14} /> : <EyeOff size={14} />}
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="mt-4 pt-4 border-t border-gray-700">
                <p className="text-xs text-gray-400 mb-2">Connections</p>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={addConnection}
                    disabled={selectedIds.length < 2}
                    className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Connect
                  </button>
                  <button
                    onClick={clearConnectionsForSelection}
                    disabled={selectedIds.length === 0}
                    className="px-2 py-1.5 bg-gray-700 hover:bg-gray-600 rounded text-xs disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Clear
                  </button>
                </div>
                <p className="text-[10px] text-gray-500 mt-2">
                  Select 2+ objects to connect
                </p>
              </div>
            </div>

            {/* Main Canvas Area */}
            <div className="flex-1 flex flex-col min-w-0">
              <div className="flex-1 relative overflow-hidden bg-gray-700">
                <canvas
                  ref={canvasRef}
                  className="absolute inset-0 w-full h-full"
                  style={{ cursor: isPlaying ? 'default' : 'pointer' }}
                />
              </div>

              {/* Slide Navigation Controls */}
              <div className="h-32 bg-gray-800 border-t border-gray-700 p-4">
                <div className="flex items-center gap-4 mb-3">
                  <button
                    onClick={togglePlay}
                    className="p-2 bg-blue-600 hover:bg-blue-700 rounded"
                  >
                    {isPlaying ? <Pause size={20} /> : <Play size={20} />}
                  </button>
                  <span className="text-sm">
                    Slide {currentSlideIndex + 1} of {slides.length}
                  </span>

                  <div className="flex-1" />

                  <button
                    onClick={() => setCurrentSlideIndex(Math.max(0, currentSlideIndex - 1))}
                    disabled={currentSlideIndex === 0}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    onClick={() => setCurrentSlideIndex(Math.min(slides.length - 1, currentSlideIndex + 1))}
                    disabled={currentSlideIndex === slides.length - 1}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded disabled:opacity-50"
                  >
                    <ChevronRight size={20} />
                  </button>
                  <button
                    onClick={duplicateSlide}
                    className="p-2 bg-gray-700 hover:bg-gray-600 rounded"
                    title="Duplicate slide"
                  >
                    <Copy size={20} />
                  </button>
                  <button
                    onClick={addSlide}
                    className="p-2 bg-green-600 hover:bg-green-700 rounded"
                    title="Add slide"
                  >
                    <Plus size={20} />
                  </button>
                  <button
                    onClick={deleteSlide}
                    disabled={slides.length <= 1}
                    className="p-2 bg-red-600 hover:bg-red-700 rounded disabled:opacity-50"
                    title="Delete slide"
                  >
                    <Trash2 size={20} />
                  </button>
                </div>

                {/* Slide thumbnails */}
                <div
                  ref={slideThumbsRef}
                  onMouseDown={handleThumbMouseDown}
                  onMouseMove={handleThumbMouseMove}
                  onMouseUp={handleThumbMouseUp}
                  onMouseLeave={handleThumbMouseUp}
                  onTouchStart={handleThumbTouchStart}
                  onTouchMove={handleThumbTouchMove}
                  onTouchEnd={handleThumbMouseUp}
                  className="w-full flex gap-2 overflow-x-auto pb-2"
                  style={{ cursor: 'grab' }}
                >
                  {slides.map((slide, idx) => (
                    <button
                      key={slide.id}
                      onClick={() => setCurrentSlideIndex(idx)}
                      className={`flex-shrink-0 w-24 h-16 rounded border-2 ${idx === currentSlideIndex
                          ? 'border-blue-500 bg-blue-900'
                          : 'border-gray-600 bg-gray-700 hover:bg-gray-600'
                        }`}
                    >
                      <div className="text-xs p-1">
                        Slide {idx + 1}
                        <div className="text-[10px] text-gray-400">
                          {slide.objects.filter(o => o.visible).length} obj
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Right Sidebar - Properties */}
            <div className="w-72 bg-gray-800 border-l border-gray-700 p-4 overflow-y-auto">
              <h2 className="text-sm font-semibold mb-3">Slide Properties</h2>

              <div className="space-y-3 mb-6">
                <div>
                  <label className="block text-xs mb-1">Duration (seconds)</label>
                  <input
                    type="number"
                    min="0.1"
                    max="10"
                    step="0.1"
                    value={currentSlide.duration}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      setSlides(prev => prev.map((slide, idx) =>
                        idx === currentSlideIndex ? { ...slide, duration: val } : slide
                      ));
                    }}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs mb-1">Easing</label>
                  <select
                    value={currentSlide.easing}
                    onChange={(e) => {
                      setSlides(prev => prev.map((slide, idx) =>
                        idx === currentSlideIndex ? { ...slide, easing: e.target.value } : slide
                      ));
                    }}
                    className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
                  >
                    <option value="linear">Linear</option>
                    <option value="ease-in">Ease In</option>
                    <option value="ease-out">Ease Out</option>
                    <option value="ease-in-out">Ease In-Out</option>
                    <option value="bounce">Bounce</option>
                  </select>
                </div>
              </div>

              {selectedIds.length === 1 && currentSlide.objects.find(o => o.id === selectedIds[0]) && (
                <>
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-semibold">Object Properties</h2>
                    <button
                      onClick={() => deleteSlideObject(selectedIds[0])}
                      className="p-1.5 bg-red-600 hover:bg-red-700 rounded text-white"
                      title="Delete object (Del)"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  {(() => {
                    const selectedObject = currentSlide.objects.find(o => o.id === selectedIds[0]);
                    return (
                      <div className="space-y-3">
                        <div>
                          <label className="block text-xs mb-1">Name</label>
                          <input
                            type="text"
                            value={selectedObject.name || ''}
                            onChange={(e) => updateSlideObject(selectedObject.id, { name: e.target.value })}
                            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1">Text Content</label>
                          <input
                            type="text"
                            value={selectedObject.text || ''}
                            onChange={(e) => updateSlideObject(selectedObject.id, { text: e.target.value })}
                            placeholder="Enter text to display inside object..."
                            className="w-full px-3 py-2 bg-gray-700 rounded text-white text-sm"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1">
                            Scale: {(selectedObject.scale ?? 1).toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0.1"
                            max="3"
                            step="0.1"
                            value={selectedObject.scale ?? 1}
                            onChange={(e) => updateSlideObject(selectedObject.id, { scale: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1">
                            Rotation: {selectedObject.rotation ?? 0}°
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="360"
                            value={selectedObject.rotation ?? 0}
                            onChange={(e) => updateSlideObject(selectedObject.id, { rotation: parseInt(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1">
                            Opacity: {(selectedObject.opacity ?? 1).toFixed(1)}
                          </label>
                          <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.1"
                            value={selectedObject.opacity ?? 1}
                            onChange={(e) => updateSlideObject(selectedObject.id, { opacity: parseFloat(e.target.value) })}
                            className="w-full"
                          />
                        </div>

                        <div>
                          <label className="block text-xs mb-1">Color</label>
                          <input
                            type="color"
                            value={selectedObject.color ?? '#3b82f6'}
                            onChange={(e) => updateSlideObject(selectedObject.id, { color: e.target.value })}
                            className="w-full h-8 rounded"
                          />
                        </div>
                      </div>
                    );
                  })()}
                </>
              )}

              {/* Connection Management */}
              <div className="mt-6 pt-4 border-t border-gray-700">
                <h2 className="text-sm font-semibold mb-3">Connections</h2>

                {selectedIds.length === 2 ? (
                  <button
                    onClick={addSlideConnection}
                    className="w-full px-3 py-2 bg-yellow-600 hover:bg-yellow-700 rounded text-white text-sm transition-colors"
                  >
                    Connect Selected Objects
                  </button>
                ) : (
                  <p className="text-xs text-gray-400 mb-3">
                    Select exactly 2 objects (Ctrl+Click) to create a connection
                  </p>
                )}

                {currentSlide.connections && currentSlide.connections.length > 0 && (
                  <div className="mt-3 space-y-2">
                    <p className="text-xs text-gray-400">Existing connections:</p>
                    {currentSlide.connections.map(conn => {
                      const fromObj = currentSlide.objects.find(o => o.id === conn.fromId);
                      const toObj = currentSlide.objects.find(o => o.id === conn.toId);
                      return (
                        <div key={conn.id} className="flex items-center justify-between bg-gray-700 rounded px-2 py-1">
                          <span className="text-xs">
                            {fromObj?.name || 'Object'} → {toObj?.name || 'Object'}
                          </span>
                          <button
                            onClick={() => removeSlideConnection(conn.id)}
                            className="text-red-400 hover:text-red-300 text-xs"
                            title="Remove connection from this slide forward"
                          >
                            ✕
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          </>
        )}
      </div>

      {contextMenu && mode === 'timeline' && (
        <div className="fixed bg-gray-800 border border-gray-700 rounded shadow-lg py-1 z-50" style={{ left: contextMenu.x, top: contextMenu.y }} onClick={(e) => e.stopPropagation()}>
          {contextMenu.isObject ? (
            <>
              <button onClick={copyObjects} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700">Copy Object(s)</button>
              {copiedObjects && <button onClick={pasteObjects} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700">Paste Object(s)</button>}
            </>
          ) : (
            <>
              <button onClick={openTransitionModal} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700">Add Transition</button>
              <button onClick={copyTransition} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700">Copy Transition</button>
              {copiedTransition && <button onClick={pasteTransition} className="w-full px-4 py-2 text-left text-sm hover:bg-gray-700">Paste Transition</button>}
            </>
          )}
        </div>
      )}

      {showTransitionModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-800 p-6 rounded-lg w-96">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Add Transition {selectedIds.length > 1 && `(${selectedIds.length} objects)`}</h3>
              <button onClick={() => setShowTransitionModal(false)}><X size={20} /></button>
            </div>
            <TransitionForm onSubmit={addTransition} onCancel={() => setShowTransitionModal(false)} />
          </div>
        </div>
      )}

      {showStudentPreview && (
        <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50">
          <div className="bg-gray-800 rounded-lg w-full max-w-5xl mx-6 overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-700">
              <div>
                <h3 className="text-lg font-semibold">Student Preview</h3>
                <p className="text-xs text-gray-400">Plays the animation as students will see it.</p>
              </div>
              <button onClick={() => setShowStudentPreview(false)} className="text-gray-300 hover:text-white">
                <X size={20} />
              </button>
            </div>
            <div className="bg-gray-900">
              {currentAnimationId ? (
                <div className="w-full h-[520px]">
                  <AnimationRenderer animationId={currentAnimationId} />
                </div>
              ) : (
                <div className="p-8 text-center text-gray-300">
                  Save the animation to enable student preview.
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function TransitionForm({ onSubmit, onCancel }) {
  const [duration, setDuration] = useState(1);
  const [easing, setEasing] = useState('linear');

  return (
    <div>
      <div className="mb-4">
        <label className="block text-sm mb-2">Duration (seconds)</label>
        <input type="number" min="0.1" max="10" step="0.1" value={duration} onChange={(e) => setDuration(parseFloat(e.target.value))} className="w-full px-3 py-2 bg-gray-700 rounded text-white" />
      </div>
      <div className="mb-4">
        <label
          className="block text-sm mb-2"
          title="Controls how the motion accelerates between this keyframe and the next one."
        >
          Easing
        </label>
        <select value={easing} onChange={(e) => setEasing(e.target.value)} className="w-full px-3 py-2 bg-gray-700 rounded text-white">
          <option value="linear">Linear</option>
          <option value="ease-in">Ease In</option>
          <option value="ease-out">Ease Out</option>
          <option value="ease-in-out">Ease In-Out</option>
          <option value="bounce">Bounce</option>
        </select>
      </div>
      <div className="flex gap-2">
        <button type="button" onClick={onCancel} className="flex-1 px-4 py-2 bg-gray-600 hover:bg-gray-700 rounded">Cancel</button>
        <button type="button" onClick={() => onSubmit(duration, easing)} className="flex-1 px-4 py-2 bg-green-600 hover:bg-green-700 rounded">Add</button>
      </div>
    </div>
  );
}
