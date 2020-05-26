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
      const id = e.target.getAttribute('data-helpID');
      if (id) {
        context.dispatch({ type: 'SHOW', id });
        context.show(id);
      }
    },
    [context],
  );

  const hide = useCallback(() => {
    context.dispatch({ type: 'HIDE' });
  }, [context]);

  const onHover = {
    onMouseEnter: show,
    onMouseLeave: hide,
  };

  return { show, hide, onHover };
}
