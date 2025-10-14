import { EventEmitter } from 'eventemitter3';
import { useEffect } from 'react';

import type {
  BrushTrackerData,
  ClickOptions,
} from '../EventsTrackers/BrushTracker.js';

const eventEmitter = new EventEmitter();

const Emitter = {
  on: (event: any, fn: any) => eventEmitter.on(event, fn),
  once: (event: any, fn: any) => eventEmitter.once(event, fn),
  off: (event: any, fn: any) => eventEmitter.off(event, fn),
  emit: (event: any, payload: any) => eventEmitter.emit(event, payload),
};

Object.freeze(Emitter);

type EventEmitterClickOptions = ClickOptions & { xPPM: number };

interface UseEventOptions {
  onBrushEnd?: (options: BrushTrackerData & { range: number[] }) => void;
  onClick?: (options: EventEmitterClickOptions) => void;
}

export function useEvent(options: UseEventOptions) {
  const { onBrushEnd, onClick } = options;

  useEffect(() => {
    function handle(event: any) {
      onBrushEnd?.(event);
    }

    Emitter.on('brushEnd', handle);

    return () => {
      Emitter.off('brushEnd', handle);
    };
  }, [onBrushEnd]);

  useEffect(() => {
    function handle(event: any) {
      onClick?.(event);
    }

    Emitter.on('mouseClick', handle);

    return () => {
      Emitter.off('mouseClick', handle);
    };
  }, [onClick]);
}

export default Emitter;
