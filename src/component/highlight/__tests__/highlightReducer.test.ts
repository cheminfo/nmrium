import { describe, expect, it } from 'vitest';

import {
  emptyHighlightState,
  highlightReducer,
  toInternalHighlightState,
  toPublicHighlightState,
} from '../index.js';

describe('highlightReducer', () => {
  it('starts from the empty public state when uncontrolled', () => {
    const internal = toInternalHighlightState(emptyHighlightState);
    expect(toPublicHighlightState(internal)).toStrictEqual(emptyHighlightState);
    expect(internal.highlights).toStrictEqual({});
  });

  it('SHOW then HIDE updates highlighted ids', () => {
    let state = toInternalHighlightState(emptyHighlightState);

    state = highlightReducer(state, {
      type: 'SHOW',
      payload: {
        convertedHighlights: ['peak-1'],
        sourceData: { type: 'PEAK', extra: { id: 'peak-1' } },
      },
    });
    expect(toPublicHighlightState(state)).toStrictEqual({
      highlighted: ['peak-1'],
      highlightedPermanently: [],
      sourceData: { type: 'PEAK', extra: { id: 'peak-1' } },
    });
    expect(state.highlights).toStrictEqual({ 'peak-1': 1 });

    state = highlightReducer(state, {
      type: 'HIDE',
      payload: { convertedHighlights: ['peak-1'] },
    });
    expect(toPublicHighlightState(state)).toStrictEqual({
      highlighted: [],
      highlightedPermanently: [],
      sourceData: null,
    });
  });

  it('composes consecutive dispatches against the latest reduced value', () => {
    let state = toInternalHighlightState({
      highlighted: ['peak-1'],
      highlightedPermanently: ['peak-1'],
      sourceData: { type: 'PEAK', extra: { id: 'peak-1' } },
    });

    // Mirrors useHighlight unmount cleanup: HIDE then UNSET_PERMANENT.
    state = highlightReducer(state, {
      type: 'HIDE',
      payload: { convertedHighlights: ['peak-1'] },
    });
    state = highlightReducer(state, { type: 'UNSET_PERMANENT' });

    expect(toPublicHighlightState(state)).toStrictEqual({
      highlighted: [],
      highlightedPermanently: [],
      sourceData: null,
    });
  });

  it('SET_PERMANENT replaces the previous permanent group', () => {
    let state = toInternalHighlightState({
      highlighted: ['a', 'b'],
      highlightedPermanently: ['a'],
      sourceData: null,
    });

    state = highlightReducer(state, {
      type: 'SET_PERMANENT',
      payload: { convertedHighlights: ['b'] },
    });

    expect(state.highlightedPermanently).toStrictEqual(['b']);
    expect(state.highlighted).toStrictEqual(['a', 'b']);
  });

  it('toInternalHighlightState derives the private highlights record', () => {
    const internal = toInternalHighlightState({
      highlighted: ['x', 'y'],
      highlightedPermanently: ['y'],
      sourceData: { type: 'UNKNOWN' },
    });
    expect(internal.highlights).toStrictEqual({ x: 1, y: 1 });
    expect(toPublicHighlightState(internal)).toStrictEqual({
      highlighted: ['x', 'y'],
      highlightedPermanently: ['y'],
      sourceData: { type: 'UNKNOWN' },
    });
  });
});
