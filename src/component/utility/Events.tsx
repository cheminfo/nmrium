import EE from 'eventemitter3';
import { useEffect } from 'react';

import {
  BrushTrackerContext,
  ClickOptions,
} from '../EventsTrackers/BrushTracker';

const eventEmitter = new EE();

const Emitter = {
  on: (event, fn) => eventEmitter.on(event, fn),
  once: (event, fn) => eventEmitter.once(event, fn),
  off: (event, fn) => eventEmitter.off(event, fn),
  emit: (event, payload) => eventEmitter.emit(event, payload),
};

Object.freeze(Emitter);

export type EventEmitterClickOptions = ClickOptions & { xPPM: number };

interface UseEventOptions {
  onBrushEnd?: (options: BrushTrackerContext & { range: number[] }) => void;
  onClick?: (options: EventEmitterClickOptions) => void;
}

export function useEvent(options: UseEventOptions) {
  const { onBrushEnd, onClick } = options;

  useEffect(() => {
    function handle(event) {
      onBrushEnd?.(event);
    }

    Emitter.on('brushEnd', handle);

    return () => {
      Emitter.off('brushEnd', handle);
    };
  }, [onBrushEnd]);

  useEffect(() => {
    function handle(event) {
      onClick?.(event);
    }

    Emitter.on('mouseClick', handle);

    return () => {
      Emitter.off('mouseClick', handle);
    };
  }, [onClick]);
}

export default Emitter;