import { assert } from '@zakodium/utils';
import { EventEmitter } from 'eventemitter3';
import { createContext, use, useState } from 'react';

export type BrushTrackerEventEmitterSupportedEvents =
  'click' | 'click-double' | 'zoom' | 'brush' | 'brush-end';
export type BrushTrackerEventEmitter =
  EventEmitter<BrushTrackerEventEmitterSupportedEvents>;

export const BrushTrackerEventEmitterContext =
  createContext<BrushTrackerEventEmitter | null>(null);

export function useBrushTrackerEventEmitter() {
  const context = use(BrushTrackerEventEmitterContext);
  assert(
    context,
    'useBrushTrackerEventEmitter hook must be use within a BrushTrackerEventEmitterProvider tree',
  );

  return context;
}

export function useInitBrushTrackerEventEmitter() {
  const [emitter] = useState(
    () => new EventEmitter<BrushTrackerEventEmitterSupportedEvents>(),
  );

  return emitter;
}
