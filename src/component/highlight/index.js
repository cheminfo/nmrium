import React, {
  createContext,
  useReducer,
  useMemo,
  useContext,
  useCallback,
} from 'react';

const highlightContext = createContext();

function highlightReducer(state, action) {
  switch (action.type) {
    case 'SHOW': {
      const newState = { ...state, highlights: { ...state.highlights } };
      for (const value of action.payload) {
        if (value in newState.highlights) {
          newState.highlights[value]++;
        } else {
          newState.highlights[value] = 1;
        }
      }
      newState.highlighted = Object.keys(newState.highlights);
      return newState;
    }
    case 'HIDE': {
      const newState = { ...state, highlights: { ...state.highlights } };
      for (const value of action.payload) {
        if (value in newState.highlights) {
          newState.highlights[value]--;
          if (newState.highlights[value] === 0) {
            delete newState.highlights[value];
          }
        }
      }
      newState.highlighted = Object.keys(newState.highlights);
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

export function useHighlight(highlights) {
  if (!Array.isArray(highlights)) {
    throw new Error('highlights must be an array');
  }

  const convertedHighlights = useMemo(() => {
    const newHighlights = [];
    for (const highlight of highlights) {
      if (typeof highlight !== 'string' && typeof highlight !== 'number') {
        throw new Error(`highlight key must be a string or number`);
      }
      newHighlights.push(String(highlight));
    }
    return newHighlights;
  }, [highlights]);

  const context = useContext(highlightContext);

  const isActive = useMemo(() => {
    return context.highlight.highlighted.some((key) =>
      convertedHighlights.includes(key),
    );
  }, [context.highlight.highlighted, convertedHighlights]);

  const show = useCallback(() => {
    context.dispatch({ type: 'SHOW', payload: convertedHighlights });
  }, [context, convertedHighlights]);

  const hide = useCallback(() => {
    context.dispatch({ type: 'HIDE', payload: convertedHighlights });
  }, [context, convertedHighlights]);

  const onHover = {
    onMouseEnter: show,
    onMouseLeave: hide,
  };

  return { isActive, show, hide, onHover };
}
