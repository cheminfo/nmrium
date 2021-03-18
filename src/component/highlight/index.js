import {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useCallback,
  useEffect,
} from 'react';

export const TYPES = {
  PEAK: 'PEAK',
  INTEGRAL: 'INTEGRAL',
  RANGE: 'RANGE',
  ZONE: 'ZONE',
};

const highlightContext = createContext();

function highlightReducer(state, action) {
  switch (action.type) {
    case 'SHOW': {
      const { convertedHighlights, type } = action.payload;
      const newState = {
        ...state,
        highlights: { ...state.highlights },
        type,
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
      const { convertedHighlights } = action.payload;

      const newState = {
        ...state,
        highlights: { ...state.highlights },
        type: null,
      };
      for (const value of convertedHighlights) {
        if (value in newState.highlights) {
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
        highlightedPermanently: action.payload,
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
      throw new Error(`unknown action type: ${action.type}`);
    }
  }
}

const emptyState = {
  highlights: {},
  highlighted: [],
  highlightedPermanently: [],
  type: null,
};

export function HighlightProvider(props) {
  const [highlight, dispatch] = useReducer(highlightReducer, emptyState);
  const contextValue = useMemo(() => ({ highlight, dispatch }), [highlight]);
  return (
    <highlightContext.Provider value={contextValue}>
      {props.children}
    </highlightContext.Provider>
  );
}

export function useHighlightData() {
  return useContext(highlightContext);
}

export function useHighlight(highlights, type = null) {
  if (!Array.isArray(highlights)) {
    throw new Error('highlights must be an array');
  }

  const context = useHighlightData();

  const convertedHighlights = useMemo(() => {
    const newHighlights = [];
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
      context.dispatch({
        type: 'HIDE',
        payload: { convertedHighlights },
      });
      context.dispatch({
        type: 'UNSET_PERMANENT',
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isActive = useMemo(() => {
    return context.highlight.highlighted.some((key) =>
      convertedHighlights.includes(key),
    );
  }, [context.highlight.highlighted, convertedHighlights]);

  const isActivePermanently = useMemo(() => {
    return context.highlight.highlightedPermanently.some((key) =>
      convertedHighlights.includes(key),
    );
  }, [context.highlight.highlightedPermanently, convertedHighlights]);

  const show = useCallback(() => {
    context.dispatch({
      type: 'SHOW',
      payload: {
        convertedHighlights,
        type,
      },
    });
  }, [context, convertedHighlights, type]);

  const hide = useCallback(() => {
    context.dispatch({
      type: 'HIDE',
      payload: {
        convertedHighlights,
      },
    });
  }, [context, convertedHighlights]);

  const add = useCallback(
    (id) => {
      context.dispatch({
        type: 'SHOW',
        payload: { convertedHighlights: [], id },
      });
    },
    [context],
  );

  const remove = useCallback(
    (id) => {
      context.dispatch({
        type: 'HIDE',
        payload: { convertedHighlights: [], id },
      });
    },
    [context],
  );

  const click = useCallback(
    (e) => {
      if (e) {
        e.preventDefault();
        e.stopPropagation();
      }

      if (!isActivePermanently) {
        context.dispatch({
          type: 'SET_PERMANENT',
          payload: convertedHighlights,
        });
      } else {
        context.dispatch({
          type: 'UNSET_PERMANENT',
        });
      }
    },
    [context, convertedHighlights, isActivePermanently],
  );

  const onHover = {
    onMouseEnter: show,
    onMouseLeave: hide,
  };

  const onClick = {
    onClick: click,
  };

  return {
    isActive,
    show,
    hide,
    onHover,
    onClick,
    isActivePermanently,
    click,
    add,
    remove,
  };
}
