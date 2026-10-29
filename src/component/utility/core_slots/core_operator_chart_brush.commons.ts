import type {
  BrushTrackerEvents,
  BrushTrackerEventsDragEvent,
  BrushTrackerEventsOnClickEvent,
  BrushTrackerEventsTrackerEvent,
  BrushTrackerEventsZoomEvent,
} from '@zakodium/nmrium-core';
import type { Optional } from '@zakodium/utils';
import { useEffect } from 'react';
import { useEventCallback } from 'usehooks-ts';

import type {
  BrushTrackerData,
  ClickOptions,
  DragTrackerEvent,
  ZoomOptions,
} from '../../EventsTrackers/brush_tracker.types.ts';
import type {
  BrushTrackerEventEmitter,
  BrushTrackerEventEmitterSupportedEvents,
} from '../../EventsTrackers/brush_tracker_events_listeners.ts';
import { useBrushTrackerEventEmitter } from '../../EventsTrackers/brush_tracker_events_listeners.ts';
import {
  getModifiers,
  useMapKeyModifiers,
} from '../../context/KeyModifierContext.tsx';

/**
 * Hook to forward to `ProcessingOperatorUI.ChartBrushTracker`.
 * @param events
 */
export function useBrushTrackerEvent(events: BrushTrackerEvents) {
  const emitter = useBrushTrackerEventEmitter();
  const isPrimaryKeyActivated = useMapKeyModifiers();

  //
  // Integration mapping to core events listening stabilized
  //

  const onBrushStable = useEventCallback((data: BrushTrackerData) => {
    const event = brushDataToCoreBrushEvent(data);

    events.onBrush?.(event);
  });
  const onBrushEndStable = useEventCallback((data: BrushTrackerData) => {
    const event = brushDataToCoreBrushEvent(data);

    events.onBrushEnd?.(event);
  });
  const onZoomStable = useEventCallback((data: ZoomOptions) => {
    const event = zoomOptionsToCoreZoomEvent(data);

    events.onZoom?.(event);
  });
  const onClickStable = useEventCallback((options: ClickOptions) => {
    const event = clickOptionsToCoreClickEvent(
      options,
      isPrimaryKeyActivated(getModifiers(options)),
    );

    events.onClick?.(event);
  });
  const onDoubleClickStable = useEventCallback((options: ClickOptions) => {
    const event = clickOptionsToCoreClickEvent(
      options,
      isPrimaryKeyActivated(getModifiers(options)),
    );

    events.onDoubleClick?.(event);
  });
  const onDragStable = useEventCallback((data: DragTrackerEvent) => {
    const event = dragTrackerEventToCoreDragEvent(
      data,
      isPrimaryKeyActivated(getModifiers(getDragEventModifiers(data))),
    );

    events.onDrag?.(event);
  });
  const onDragEndStable = useEventCallback((data: DragTrackerEvent) => {
    const event = dragTrackerEventToCoreDragEvent(
      data,
      isPrimaryKeyActivated(getModifiers(getDragEventModifiers(data))),
    );

    events.onDragEnd?.(event);
  });

  //
  // Use stable version if the event is defined.
  // It registers callback when needed and avoid to unregister - register at each render.
  //

  const onBrush = events.onBrush && onBrushStable;
  const onBrushEnd = events.onBrushEnd && onBrushEndStable;
  const onZoom = events.onZoom && onZoomStable;
  const onClick = events.onClick && onClickStable;
  const onDoubleClick = events.onDoubleClick && onDoubleClickStable;
  const onDrag = events.onDrag && onDragStable;
  const onDragEnd = events.onDragEnd && onDragEndStable;

  //
  // Forward the events listeners
  //

  useRegisterListener(emitter, 'brush', onBrush);
  useRegisterListener(emitter, 'brush-end', onBrushEnd);
  useRegisterListener(emitter, 'zoom', onZoom);
  useRegisterListener(emitter, 'click', onClick);
  useRegisterListener(emitter, 'click-double', onDoubleClick);
  useRegisterListener(emitter, 'drag', onDrag);
  useRegisterListener(emitter, 'drag-end', onDragEnd);
}

function useRegisterListener(
  emitter: BrushTrackerEventEmitter,
  event: BrushTrackerEventEmitterSupportedEvents,
  listener: Optional<Parameters<BrushTrackerEventEmitter['on']>[1]>,
) {
  useEffect(() => {
    if (!listener) return;

    emitter.on(event, listener);
    return () => void emitter.off(event, listener);
  }, [emitter, event, listener]);
}

function brushDataToCoreBrushEvent(
  event: BrushTrackerData,
): BrushTrackerEventsTrackerEvent {
  const {
    step,
    mouseButton,
    ctrlKey,
    altKey,
    metaKey,
    shiftKey,
    startX,
    startY,
    endX,
    endY,
  } = event;

  return {
    step,
    mouseButton,
    modifiersKey: { ctrlKey, altKey, shiftKey, metaKey },
    positionStart: { x: startX, y: startY },
    positionEnd: { x: endX, y: endY },
  };
}

function zoomOptionsToCoreZoomEvent(
  event: ZoomOptions,
): BrushTrackerEventsZoomEvent {
  const { x, y, invertScroll, isBidirectionalZoom, ...wheelEvent } = event;

  return {
    domEvent: wheelEvent,
    position: { x, y },
    isBidirectionalZoom,
    invertScroll,
  };
}

function clickOptionsToCoreClickEvent(
  event: ClickOptions,
  isPrimaryKeyActivated: boolean,
): BrushTrackerEventsOnClickEvent {
  const { x, y, ...domEvent } = event;

  return {
    // Claiming the event flags the emitted tracker event (NOT the native
    // domEvent, whose stopPropagation would not be honored by the veto
    // check), so the host `useWrappedEvents` skips its default behavior
    // for this event (like the double-click zoom-out).
    stopPropagation: () => claimTrackerEvent(event),
    domEvent,
    position: { x, y },
    isPrimaryKeyActivated,
  };
}

/**
 * Flag a tracker event as propagation-stopped.
 *
 * The emitted click events are spreads of the React synthetic event, so
 * they carry an own `isPropagationStopped` flag but no `stopPropagation`
 * method: it lives on the synthetic event prototype and is lost in the
 * spread. The claim reassigns the flag on the tracker event itself,
 * which is the flag checked by the host `useWrappedEvents` after
 * emitting to its listeners.
 */
function claimTrackerEvent(event: ClickOptions) {
  event.isPropagationStopped = () => true;
}

function dragTrackerEventToCoreDragEvent(
  event: DragTrackerEvent,
  isPrimaryKeyActivated: boolean,
): BrushTrackerEventsDragEvent {
  const {
    x,
    y,
    startX,
    startY,
    domEvent,
    mouseButton,
    ctrlKey,
    altKey,
    shiftKey,
  } = event;

  return {
    // Claiming the gesture delegates to the tracker event (NOT the native
    // domEvent, whose stopPropagation is a no-op for the veto), so the
    // brush suppression is honored by the host `BrushTracker`.
    stopPropagation: () => event.stopPropagation(),
    mouseButton,
    modifiersKey: { ctrlKey, altKey, shiftKey, metaKey: domEvent.metaKey },
    position: { x, y },
    positionStart: { x: startX, y: startY },
    isPrimaryKeyActivated,
  };
}

/**
 * Modifier keys of a drag tracker event, in the shape expected by the
 * `KeyModifierContext` helpers (`metaKey` comes from the native event).
 */
function getDragEventModifiers(event: DragTrackerEvent) {
  const { shiftKey, altKey, ctrlKey, domEvent } = event;

  return { shiftKey, altKey, ctrlKey, metaKey: domEvent.metaKey };
}
