import { Draft, produce } from 'immer';
import {
  createContext,
  useContext,
  useMemo,
  useCallback,
  useReducer,
  ReactElement,
  ReactFragment,
} from 'react';

type CallBackFun = (data?: any) => void;
interface EventState {
  callbackLists: { [eventName: string]: CallBackFun };
}

export interface EventContext {
  on: (eventName: string, handler: CallBackFun) => void;
  trigger: (eventName: string, data?: any) => void;
  clean: (eventName: string | string[]) => void;
}

type ActionType<Action, Payload = void> = Payload extends void
  ? { type: Action }
  : { type: Action; payload: Payload };

type PreferencesActions =
  | ActionType<'ON', { eventName: string; handler: CallBackFun }>
  | ActionType<'CLEAN', { eventNames: string | string[] }>;

const initState: EventState = {
  callbackLists: {},
};

const reducer = produce(
  (draft: Draft<EventState>, action: PreferencesActions) => {
    switch (action.type) {
      case 'ON': {
        const { eventName, handler } = action.payload;
        if (!draft.callbackLists[eventName]) {
          draft.callbackLists[eventName] = handler;
        }
        return draft;
      }
      case 'CLEAN': {
        const { eventNames } = action.payload;
        const names = Array.isArray(eventNames) ? eventNames : [eventNames];
        draft.callbackLists = Object.entries(draft.callbackLists)
          .filter(([key]) => !names.includes(key))
          .reduce((acc, [eventName, func]) => (acc[eventName] = func), {});
        return draft;
      }

      default: {
        return draft;
      }
    }
  },
);

const eventContext = createContext<EventContext | null>(null);

export function useEventContext(): EventContext {
  const context = useContext(eventContext);
  if (!context) {
    throw new Error('Event context  was not found');
  }

  return context;
}

type ChildrenNodes =
  | ReactElement<any>
  | Array<ReactElement<any>>
  | ReactFragment
  | boolean
  | null;

export function EventContextProvider(props: {
  children: ChildrenNodes | ((state: EventContext) => ChildrenNodes);
}) {
  const [events, dispatch] = useReducer(reducer, initState);

  const onHandler = useCallback((eventName: string, handler: CallBackFun) => {
    dispatch({ type: 'ON', payload: { eventName, handler } });
  }, []);

  const triggerHandler = useCallback(
    (eventName: string, data?: any) => {
      if (events.callbackLists[eventName]) {
        events.callbackLists[eventName](data);
      }
    },
    [events.callbackLists],
  );
  const cleanHandler = useCallback((eventNames: string | string[]) => {
    dispatch({ type: 'CLEAN', payload: { eventNames } });
  }, []);

  const state = useMemo(
    () => ({
      on: onHandler,
      trigger: triggerHandler,
      clean: cleanHandler,
    }),
    [cleanHandler, onHandler, triggerHandler],
  );

  return (
    <eventContext.Provider value={state}>
      {typeof props.children === 'function'
        ? props.children?.(state)
        : props.children}
    </eventContext.Provider>
  );
}
