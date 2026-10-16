import type { DragTrackerEvent, MouseButton } from './brush_tracker.types.ts';

export interface DragGestureOptions {
  mouseButton: MouseButton;
  /**
  x coordinate of the pointerdown relative to the chart container.
  */
  startX: number;
  /**
  y coordinate of the pointerdown relative to the chart container.
  */
  startY: number;
  /**
  x of the chart container bounding rect origin.
  */
  rectX: number;
  /**
  y of the chart container bounding rect origin.
  */
  rectY: number;
}

export interface DragGestureController {
  /**
   * Create the drag event for a pointermove.
   * The consumer decides via the event claim API (`stopPropagation`)
   * whether the gesture takes precedence over the default brush behavior.
   */
  move(pointerEvent: globalThis.PointerEvent): DragTrackerEvent;
  /**
   * Create the drag-end event for the pointerup,
   * or `null` if no drag was emitted during the gesture.
   */
  end(pointerEvent: globalThis.PointerEvent): DragTrackerEvent | null;
}

/**
 * Stateful factory for the drag events of a single pointer gesture.
 *
 * The claim state (`stopPropagation` / `preventDefault`) is shared by all
 * the events of the gesture, so a consumer claiming the gesture on the
 * first `drag` event keeps it claimed until `drag-end`.
 */
export function createDragGesture(
  options: DragGestureOptions,
): DragGestureController {
  const { mouseButton, startX, startY, rectX, rectY } = options;
  let claimed = false;
  let defaultPrevented = false;
  let emitted = false;

  function build(pointerEvent: globalThis.PointerEvent): DragTrackerEvent {
    return {
      x: pointerEvent.clientX - rectX,
      y: pointerEvent.clientY - rectY,
      startX,
      startY,
      domEvent: pointerEvent,
      mouseButton,
      shiftKey: pointerEvent.shiftKey,
      altKey: pointerEvent.altKey,
      ctrlKey: pointerEvent.ctrlKey,
      isDefaultPrevented: () => defaultPrevented,
      isPropagationStopped: () => claimed,
      preventDefault: () => {
        defaultPrevented = true;
      },
      stopPropagation: () => {
        claimed = true;
      },
    };
  }

  return {
    move(pointerEvent) {
      emitted = true;
      return build(pointerEvent);
    },
    end(pointerEvent) {
      if (!emitted) return null;
      return build(pointerEvent);
    },
  };
}
