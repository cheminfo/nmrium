import type { Range } from '@zakodium/nmr-types';
import type { CSSProperties, MouseEvent } from 'react';
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useReducer,
} from 'react';

import type { ExclusionZone } from '../../data/types/data1d/ExclusionZone.js';

interface BaseSource {
  id: string;
  spectrumID?: string;
}

interface ExclusionZoneSource {
  zone: ExclusionZone;
  spectrumID: string;
}

interface HighlightEventSourceMap {
  PEAK: BaseSource;
  INTEGRAL: BaseSource;
  SIGNAL: never;
  SIGNAL_1D: BaseSource & { rangeId: string };
  RANGE: BaseSource;
  RANGE_PEAK: BaseSource;
  ZONE: { id: string };
  BASELINE_ZONE: { id: string };
  PHASE_CORRECTION_TRACE: { id: string };
  EXCLUSION_ZONE: ExclusionZoneSource;
  MATRIX_GENERATION_EXCLUSION_ZONE: ExclusionZoneSource;
  MULTIPLE_ANALYSIS_ZONE: { colKey: string };
  DATABASE: { ranges: Range[]; jcampURL: string; baseURL: string };
  ATOM: never;
  UNKNOWN: never;
}

// Auto-generate the discriminated union from the map
export type HighlightEventSource = {
  [K in keyof HighlightEventSourceMap]: HighlightEventSourceMap[K] extends never
    ? { type: K; extra?: never }
    : { type: K; extra: HighlightEventSourceMap[K] };
}[keyof HighlightEventSourceMap];

// Derive the type keys for free — no duplication
export type HighlightEventSourceType = keyof HighlightEventSourceMap;

// Extract extra type for a specific source — useful in components
export type HighlightEventSourceExtra<T extends HighlightEventSourceType> =
  HighlightEventSourceMap[T];

export function isHighlightEventSource<T extends HighlightEventSourceType>(
  source: HighlightEventSource,
  ...types: T[]
): source is Extract<HighlightEventSource, { type: T }> {
  return types.includes(source.type as T);
}

const highLightStyle: CSSProperties = {
  backgroundColor: '#ff6f0091',
};

type HighlightActions = 'HIDE' | 'SHOW' | 'SET_PERMANENT' | 'UNSET_PERMANENT';

interface HighlightState {
  highlights: Record<string, number>;
  highlighted: string[];
  highlightedPermanently: string[];
  sourceData: HighlightEventSource | null;
}
interface HighlightPayload {
  convertedHighlights: string[];
  id?: number | string;
  sourceData?: HighlightEventSource | null;
}
interface HighlightContextProps {
  highlight: HighlightState;
  dispatch: (props: {
    type: HighlightActions;
    payload?: HighlightPayload;
  }) => void;
  remove: () => void;
}

const emptyState = {
  highlight: {
    highlights: {},
    highlighted: [],
    highlightedPermanently: [],
    sourceData: null,
  },
  dispatch: () => null,
  remove: () => null,
};

const highlightContext = createContext<HighlightContextProps>(emptyState);

function highlightReducer(
  state: HighlightState,
  action: {
    type: HighlightActions;
    payload?: HighlightPayload;
  },
): HighlightState {
  switch (action.type) {
    case 'SHOW': {
      const { convertedHighlights = [], sourceData } = action.payload || {};

      const newState: HighlightState = {
        ...state,
        highlights: { ...state.highlights },
        sourceData: sourceData ?? { type: 'UNKNOWN' },
      };
      for (const value of convertedHighlights) {
        if (!(value in newState.highlights)) {
          newState.highlights[value] = 1;
        }
      }
      newState.highlighted = Object.keys(newState.highlights);

      return newState;
    }
    case 'HIDE': {
      const { convertedHighlights = [] } = action.payload || {};

      const newState = {
        ...state,
        highlights: { ...state.highlights },
        sourceData: null,
      };
      for (const value of convertedHighlights) {
        if (value in newState.highlights) {
          // eslint-disable-next-line @typescript-eslint/no-dynamic-delete
          delete newState.highlights[value];
        }
      }
      newState.highlighted = Object.keys(newState.highlights);
      return newState;
    }
    case 'SET_PERMANENT': {
      const newState = {
        ...state,
        // allow just one permanent highlights group at same time
        highlightedPermanently: action.payload?.convertedHighlights || [],
      };

      return newState;
    }
    case 'UNSET_PERMANENT': {
      const newState = {
        ...state,
        highlightedPermanently: [],
      };

      return newState;
    }
    default: {
      throw new Error(`unknown action type: ${String(action.type)}`);
    }
  }
}

export function HighlightProvider(props: any) {
  const [highlight, dispatch] = useReducer(
    highlightReducer,
    emptyState.highlight,
  );

  const contextValue = useMemo(() => {
    function remove() {
      dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: highlight.highlighted },
      });
    }
    return { highlight, dispatch, remove };
  }, [highlight]);

  return (
    <highlightContext.Provider value={contextValue}>
      {props.children}
    </highlightContext.Provider>
  );
}

export function useHighlightData() {
  return useContext(highlightContext);
}

/**
 * @param {Array<string | number>}  highlights
 * @param {SourceData = null} sourceData
 */
export function useHighlight(
  highlights: Array<string | number>,
  sourceData: HighlightEventSource | null = null,
) {
  if (!Array.isArray(highlights)) {
    throw new Error('highlights must be an array');
  }
  const { dispatch, highlight } = useHighlightData();

  const convertedHighlights = useMemo(() => {
    const newHighlights: any[] = [];
    for (const highlight of highlights) {
      if (typeof highlight !== 'string' && typeof highlight !== 'number') {
        throw new Error(`highlight key must be a string or number`);
      }
      if (highlight !== '') {
        newHighlights.push(String(highlight));
      }
    }
    return newHighlights;
  }, [highlights]);

  useEffect(() => {
    // if deletion of component then also delete its highlight information -> componentWillUnmount
    return () => {
      dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: [] },
      });
      dispatch({
        type: 'UNSET_PERMANENT',
      });
    };
  }, [dispatch]);

  const isActive = useMemo(() => {
    return highlight.highlighted.some((key) =>
      convertedHighlights.includes(key),
    );
  }, [convertedHighlights, highlight.highlighted]);

  const isActivePermanently = useMemo(() => {
    return highlight.highlightedPermanently.some((key) =>
      convertedHighlights.includes(key),
    );
  }, [convertedHighlights, highlight.highlightedPermanently]);

  const show = useCallback(() => {
    dispatch({
      type: 'SHOW',
      payload: {
        convertedHighlights,
        sourceData,
      },
    });
  }, [dispatch, convertedHighlights, sourceData]);

  const hide = useCallback(() => {
    dispatch({
      type: 'HIDE',
      payload: {
        convertedHighlights,
      },
    });
  }, [convertedHighlights, dispatch]);

  const add = useCallback(
    (id: number | string) => {
      dispatch({
        type: 'SHOW',
        payload: { convertedHighlights: [], id },
      });
    },
    [dispatch],
  );

  const remove = useCallback(
    (id: number | string) => {
      dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: [], id },
      });
    },
    [dispatch],
  );

  const click = useCallback(
    (e: MouseEvent) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!isActivePermanently) {
        dispatch({
          type: 'SET_PERMANENT',
          payload: { convertedHighlights },
        });
      } else {
        dispatch({
          type: 'UNSET_PERMANENT',
        });
      }
    },
    [convertedHighlights, dispatch, isActivePermanently],
  );

  return useMemo(() => {
    return {
      isActive,
      defaultActiveStyle: isActive ? highLightStyle : {},
      onHover: {
        onMouseEnter: show,
        onMouseLeave: hide,
      },
      onClick: click,
      show,
      hide,
      isActivePermanently,
      click,
      add,
      remove,
    };
  }, [add, click, hide, isActive, isActivePermanently, remove, show]);
}
