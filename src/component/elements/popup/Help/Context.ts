import { useMemo, createContext, useCallback, useContext } from 'react';

import { helpList } from '../../../../constants';

const HelpContext = createContext<any>({});

export const HelpProvider = HelpContext.Provider;

export function useHelpText() {
  return useContext(HelpContext).helpText;
}

export function useHelp() {
  const context = useContext(HelpContext);

  const show = useCallback(
    (e) => {
      const id = e.target.getAttribute('data-helpid');
      if (id) {
        e.target.style.cursor =
          !context.preventAutoHelp || e.ctrlKey ? 'help' : 'pointer';
        context.setHelpText(helpList[id].text);
        context.show(id, { delay: e.ctrlKey ? 0 : null });
      }
    },
    [context],
  );

  const hide = useCallback(() => {
    context.setHelpText(null);
    context.clear();
  }, [context]);

  return useMemo(() => {
    const onHover = {
      onMouseEnter: show,
      onMouseLeave: hide,
    };

    return { show, hide, onHover };
  }, [hide, show]);
}
