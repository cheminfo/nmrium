import PropTypes from 'prop-types';
import {
  Fragment,
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { createPortal } from 'react-dom';
import { FaTimes } from 'react-icons/fa';
import { TransitionGroup } from 'react-transition-group';

import Transition from '../Transition';
import Wrapper from '../Wrapper';
import { groupBy } from '../helpers';
import { positions, transitions, types } from '../options';

import { AlertProvider } from './Context';
import ProgressIndicator from './ProgressIndicator';

function Provider({
  children,
  wrapperRef,
  offset,
  position,
  timeout,
  type,
  transition,
  ...props
}) {
  const root = useRef(null);
  const alertContext = useRef(null);
  const timersId = useRef([]);
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    root.current = document.createElement('div');
    const ref = root.current;
    const timersIdRef = timersId.current;

    if (wrapperRef) {
      wrapperRef.appendChild(ref);
    }
    return () => {
      if (ref) {
        if (wrapperRef) {
          timersIdRef.forEach(clearTimeout);

          wrapperRef.removeChild(ref);
        }
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

  const removeAll = useCallback(() => {
    alertContext.current.alerts.forEach(remove);
  }, [remove]);

  const show = useCallback(
    (message = '', options = {}) => {
      const id = Math.random().toString(36).substr(2, 9);

      const alertOptions = {
        position: options.position || position,
        timeout,
        type,
        backgroundColor: 'black',
        color: 'white',
        ...options,
      };

      const alert = {
        id,
        message,
        options: alertOptions,
      };

      alert.close = () => remove(alert);

      if (alert.options.timeout) {
        const timerId = setTimeout(() => {
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
    (message = '', options = {}) => {
      options.type = types.SUCCESS;
      options = { backgroundColor: '#28ba62', color: 'white', ...options };

      return show(message, options);
    },
    [show],
  );

  const error = useCallback(
    (message = '', options = {}) => {
      options.type = types.ERROR;
      options = { backgroundColor: '#cf3c4f', color: 'white', ...options };
      return show(message, options);
    },
    [show],
  );

  const info = useCallback(
    (message = '', options = {}) => {
      options.type = types.INFO;
      options.color = '#28ba62';
      return show(message, options);
    },
    [show],
  );

  const showLoading = useCallback(
    (message = 'Process in progress', options = {}) => {
      options.type = types.PROGRESS_INDICATOR;
      options.timeout = 0;
      options.backgroundColor = '#232323';

      const alert = show(message, options);
      return () => remove(alert);
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

  const parentStyle = useMemo(() => {
    return wrapperRef
      ? wrapperRef.getBoundingClientRect()
      : {
          top: 0,
          left: 0,
          width: window.innerWidth,
          height: window.innerHeight,
        };
  }, [wrapperRef]);

  return (
    <AlertProvider
      value={{
        alerts,
        show,
        remove,
        removeAll,
        success,
        error,
        info,
        showLoading,
      }}
    >
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
                          <div
                            style={{
                              margin: offset,
                              padding: '25px',
                              borderRadius: '10px',
                              pointerEvents: 'all',
                              backgroundColor: alert.options.backgroundColor,
                              color: alert.options.color,
                              minHeight: '60px',
                              position: 'relative',
                            }}
                            key={alert.id}
                          >
                            <button
                              style={{
                                position: 'absolute',
                                right: '5px',
                                top: '5px',
                                border: 'none',
                                backgroundColor: 'transparent',
                                color: 'white',
                              }}
                              type="button"
                              onClick={() => closeHandler(alert)}
                            >
                              <FaTimes />
                            </button>

                            <span>{alert.message}</span>
                            {alert.options.type ===
                              types.PROGRESS_INDICATOR && <ProgressIndicator />}
                          </div>
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

Provider.propTypes = {
  offset: PropTypes.string,
  position: PropTypes.oneOf(
    Object.keys(positions).map((position) => positions[position]),
  ),
  timeout: PropTypes.number,
  type: PropTypes.oneOf(Object.keys(types).map((type) => types[type])),
  transition: PropTypes.oneOf(
    Object.keys(transitions).map((transition) => transitions[transition]),
  ),
  containerStyle: PropTypes.object,
  wrapperRef: PropTypes.object,
  context: PropTypes.shape({
    Provider: PropTypes.object,
    Consumer: PropTypes.object,
  }),
};

Provider.defaultProps = {
  offset: '5px',
  position: positions.BOTTOM_CENTER,
  transition: transitions.FADE,
  wrapperRef: null,
  timeout: 3000,
};

export default Provider;
