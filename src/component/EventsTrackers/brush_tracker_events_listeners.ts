import { assert } from '@zakodium/utils';
import { EventEmitter } from 'eventemitter3';
import { createContext, useContext, useState } from 'react';

export type BrushTrackerEventEmitterSupportedEvents =
  'click' | 'click-double' | 'zoom' | 'brush' | 'brush-end';
export type BrushTrackerEventEmitter =
  EventEmitter<BrushTrackerEventEmitterSupportedEvents>;

const BrushTrackerEventEmitterContext =
  createContext<BrushTrackerEventEmitter | null>(null);

export const BrushTrackerEventEmitterProvider =
  BrushTrackerEventEmitterContext.Provider;

export function useBrushTrackerEventEmitter() {
  const context = useContext(BrushTrackerEventEmitterContext);
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
