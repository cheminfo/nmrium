import groupBy from 'lodash/groupBy';
import {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
  memo,
  CSSProperties,
  ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { TransitionGroup } from 'react-transition-group';

import Transition from '../Transition';
import Wrapper from '../Wrapper';
import {
  Position,
  positions,
  transitions,
  Type,
  types,
  Transition as TransitionOption,
} from '../options';

import AlertBlock from './AlertBlock';
import { Alert, AlertOption, AlertProvider } from './Context';

interface ProviderProps {
  children: ReactNode;
  offset?: string;
  position?: Position;
  timeout?: number;
  type?: Type;
  transition?: TransitionOption;
  containerStyle?: CSSProperties;
  wrapperRef?: any;
  context?: {
    Provider?: any;
    Consumer?: any;
  };
}

function Provider({
  children,
  wrapperRef = null,
  offset = '5px',
  position = positions.BOTTOM_CENTER,
  timeout = 3000,
  type,
  transition = transitions.FADE,
  ...props
}: ProviderProps) {
  const root = useRef<HTMLDivElement | null>(null);
  const timersId = useRef<number[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    root.current = document.createElement('div');
    const ref = root.current;
    const timersIdRef = timersId.current;

    if (wrapperRef) {
      wrapperRef.append(ref);
    }
    return () => {
      if (ref && wrapperRef) {
        for (const id of timersIdRef) {
          clearTimeout(id);
        }
        ref.remove();
      }
    };
  }, [wrapperRef]);

  const remove = useCallback((alert) => {
    setAlerts((currentAlerts) => {
      const lengthBeforeRemove = currentAlerts.length;
      const filteredAlerts = currentAlerts.filter((a) => a.id !== alert.id);

      if (lengthBeforeRemove > filteredAlerts.length && alert.options.onClose) {
        alert.options.onClose();
      }

      return filteredAlerts;
    });
  }, []);

  const show = useCallback(
    (message = '', options: AlertOption = {}) => {
      const id = Math.random().toString(36).slice(2, 9);

      const alertOptions = {
        position: options.position || position,
        timeout,
        type,
        backgroundColor: 'black',
        color: 'white',
        ...options,
      };

      const alert: Alert = {
        id,
        message,
        options: alertOptions,
        close: () => remove(alert),
      };

      if (alert.options.timeout) {
        const timerId = window.setTimeout(() => {
          remove(alert);

          timersId.current.splice(timersId.current.indexOf(timerId), 1);
        }, alert.options.timeout);

        timersId.current.push(timerId);
      }

      setAlerts((state) => state.concat(alert));
      if (alert.options.onOpen) alert.options.onOpen();

      return alert;
    },
    [position, remove, timeout, type],
  );

  const success = useCallback(
    (message = '', options: AlertOption = {}) => {
      options.type = types.SUCCESS;
      options = { backgroundColor: '#28ba62', color: 'white', ...options };

      return show(message, options);
    },
    [show],
  );

  const error = useCallback(
    (message = '', options: AlertOption = {}) => {
      const alertOptions = {
        type: types.ERROR,
        backgroundColor: '#cf3c4f',
        color: 'white',
        timeout: 0,
        ...options,
      };
      return show(message, alertOptions);
    },
    [show],
  );

  const info = useCallback(
    (message = '', options: AlertOption = {}) => {
      const alertOptions = {
        type: types.INFO,
        backgroundColor: '#28ba62',
        ...options,
      };
      return show(message, alertOptions);
    },
    [show],
  );

  const showLoading = useCallback(
    (message = 'Process in progress', options: AlertOption = {}) => {
      const alertOptions = {
        type: types.PROGRESS_INDICATOR,
        backgroundColor: '#232323',
        timeout: 0,
        ...options,
      };

      return new Promise<() => void>((resolve) => {
        const alert = show(message, alertOptions);
        setTimeout(() => {
          resolve(() => remove(alert));
        }, 500);
      });
    },
    [remove, show],
  );

  const closeHandler = useCallback(
    (alert) => {
      remove(alert);
    },
    [remove],
  );

  const alertsByPosition = groupBy(alerts, (alert) => alert.options.position);

  const parentStyle = wrapperRef
    ? wrapperRef.getBoundingClientRect()
    : {
        top: 0,
        left: 0,
        width: window.innerWidth,
        height: window.innerHeight,
      };

  const alertContextValue = useMemo(
    () => ({ show, success, error, info, showLoading }),
    [show, success, error, info, showLoading],
  );

  return (
    <AlertProvider value={alertContextValue}>
      {children}
      {root.current &&
        createPortal(
          <Fragment>
            {Object.keys(positions).map((key) => {
              const position = positions[key];

              return (
                <TransitionGroup
                  appear
                  key={position}
                  options={{ position, zIndex: 999999 }}
                  component={Wrapper}
                  containerStyle={parentStyle}
                  {...props}
                >
                  {alertsByPosition[position]
                    ? alertsByPosition[position].map((alert) => (
                        <Transition type={transition} key={alert.id}>
                          <AlertBlock
                            offset={offset}
                            alert={alert}
                            onClose={() => closeHandler(alert)}
                          />
                        </Transition>
                      ))
                    : null}
                </TransitionGroup>
              );
            })}
          </Fragment>,
          root.current,
        )}
    </AlertProvider>
  );
}

export default memo(Provider);
