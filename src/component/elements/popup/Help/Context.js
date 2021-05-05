import { createContext, useCallback, useContext } from 'react';

const HelpContext = createContext();

export const HelpProvider = HelpContext.Provider;

export function useHelptData() {
  return useContext(HelpContext).helpState;
}
export function useHelp() {
  const context = useContext(HelpContext);

  const show = useCallback(
    (e) => {
      const id = e.target.getAttribute('data-helpid');
      if (id) {
        e.target.style.cursor =
          !context.preventAutoHelp || e.ctrlKey ? 'help' : 'pointer';
        context.dispatch({ type: 'SHOW', id });
        context.show(id, { delay: e.ctrlKey ? 0 : null });
      }
    },
    [context],
  );

  const hide = useCallback(() => {
    context.dispatch({ type: 'HIDE' });
    context.clear();
  }, [context]);

  const onHover = {
    onMouseEnter: show,
    onMouseLeave: hide,
  };

  return { show, hide, onHover };
}
