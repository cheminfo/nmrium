import { describe, expect, test } from 'vitest';

import type { DragGestureOptions } from '../brush_tracker_drag_gesture.ts';
import { createDragGesture } from '../brush_tracker_drag_gesture.ts';

function createPointerEvent(
  options: Partial<globalThis.PointerEvent> = {},
): globalThis.PointerEvent {
  return {
    clientX: 0,
    clientY: 0,
    shiftKey: false,
    altKey: false,
    ctrlKey: false,
    ...options,
  } as globalThis.PointerEvent;
}

const options: DragGestureOptions = {
  mouseButton: 'main',
  startX: 30,
  startY: 40,
  rectX: 100,
  rectY: 200,
};

describe('createDragGesture', () => {
  test('move event coordinates are relative to the chart container', () => {
    const gesture = createDragGesture(options);

    const event = gesture.move(
      createPointerEvent({ clientX: 120, clientY: 280 }),
    );

    expect(event.x).toBe(20);
    expect(event.y).toBe(80);
    expect(event.startX).toBe(30);
    expect(event.startY).toBe(40);
  });

  test('move event carries the pointerdown mouse button and move modifier keys', () => {
    const gesture = createDragGesture({
      ...options,
      mouseButton: 'secondary',
    });

    const event = gesture.move(
      createPointerEvent({ shiftKey: true, altKey: true, ctrlKey: false }),
    );

    expect(event.mouseButton).toBe('secondary');
    expect(event.shiftKey).toBe(true);
    expect(event.altKey).toBe(true);
    expect(event.ctrlKey).toBe(false);
  });

  test('claiming a drag persists for the rest of the gesture', () => {
    const gesture = createDragGesture(options);

    const firstEvent = gesture.move(createPointerEvent());
    expect(firstEvent.isPropagationStopped()).toBe(false);

    firstEvent.stopPropagation();

    expect(firstEvent.isPropagationStopped()).toBe(true);

    const secondEvent = gesture.move(createPointerEvent());
    expect(secondEvent.isPropagationStopped()).toBe(true);

    const endEvent = gesture.end(createPointerEvent());
    expect(endEvent?.isPropagationStopped()).toBe(true);
  });

  test('default prevention persists for the rest of the gesture', () => {
    const gesture = createDragGesture(options);

    const firstEvent = gesture.move(createPointerEvent());
    firstEvent.preventDefault();

    expect(firstEvent.isDefaultPrevented()).toBe(true);

    const secondEvent = gesture.move(createPointerEvent());
    expect(secondEvent.isDefaultPrevented()).toBe(true);
  });

  test('end returns null when no drag was emitted', () => {
    const gesture = createDragGesture(options);

    expect(gesture.end(createPointerEvent())).toBeNull();
  });

  test('end event uses the pointerup coordinates', () => {
    const gesture = createDragGesture(options);

    gesture.move(createPointerEvent({ clientX: 130, clientY: 240 }));

    const endEvent = gesture.end(
      createPointerEvent({ clientX: 150, clientY: 260 }),
    );

    expect(endEvent?.x).toBe(50);
    expect(endEvent?.y).toBe(60);
  });
});
