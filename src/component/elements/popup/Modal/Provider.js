/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import {
  useRef,
  useState,
  useEffect,
  useCallback,
  Fragment,
  cloneElement,
} from 'react';
import { createPortal } from 'react-dom';
import { Rnd } from 'react-rnd';
import { TransitionGroup } from 'react-transition-group';

import Transition from '../Transition';
import Wrapper from '../Wrapper';
import { positions, transitions } from '../options';

import ConfirmDialog from './ConfirmDialog';
import DefaultContext from './Context';

const transitionStyles = {
  [transitions.FADE]: {
    entering: { opacity: 0 },
    entered: { opacity: 1 },
  },
  [transitions.SCALE]: {
    entering: { transform: 'scale(0)' },
    entered: { transform: 'scale(1)' },
    exiting: { transform: 'scale(0)' },
    exited: { transform: 'scale(0)' },
  },
};

const Provider = ({
  children,
  context: Context,
  style,
  offset,
  position,
  transition,
  wrapperRef,
}) => {
  const root = useRef();
  const modalContext = useRef(null);
  const [modal, setModal] = useState();
  useEffect(() => {
    root.current = document.createElement('div');
    const ref = root.current;
    if (wrapperRef) {
      wrapperRef.appendChild(ref);
    }
    return () => {
      if (ref) {
        if (wrapperRef) {
          wrapperRef.removeChild(ref);
        }
      }
    };
  }, [wrapperRef]);

  const remove = () => {
    setModal(null);
  };

  const closeHandler = useCallback(() => {
    remove();
  }, []);
  /**
   *
   * @param {*} component  <component />
   * @param {object} options    {onYest:()=>{}, prop1, .... etc}
   * @param {transitions} options.transition
   * @param {positions} options.position
   * @param {boolean} options.isBackgroundBlur
   * @param {boolean} options.enableResizing
   */
  const show = (component, options = {}) => {
    const _modal = {
      component,
      options: { isBackgroundBlur: true, enableResizing: false, ...options },
    };

    _modal.close = () => remove();

    setModal(_modal);
    if (_modal.options.onOpen) _modal.options.onOpen();
    return _modal;
  };

  const showConfirmDialog = (message, options = {}) => {
    const _modal = {
      component: <ConfirmDialog message={message} />,
      options: { isBackgroundBlur: true, ...options },
    };

    _modal.close = () => remove();

    setModal(_modal);
    if (_modal.options.onOpen) _modal.options.onOpen();

    return _modal;
  };

  const close = () => {
    closeHandler();
  };

  useEffect(() => {
    const keyHandler = (e) => {
      if (['Escape', 'Esc'].includes(e.key)) {
        closeHandler();
      }
    };
    document.addEventListener('keydown', keyHandler, false);
    return () => document.removeEventListener('keydown', keyHandler, false);
  }, [closeHandler]);

  modalContext.current = {
    show,
    close,
    modal,
    showConfirmDialog,
  };

  const styles = css`
    position: fixed;
    top: 0;
    right: 0;
    bottom: 0;
    left: 0;
    z-index: 1;

    .handle {
      cursor: move;
    }

    .rnd-container {
      box-sizing: initial;
      background-color: #fff;
      box-shadow: 0 0 0 0, 0 8px 16px rgba(0, 0, 0, 0.3);
      borderradius: 5px;
    }
  `;

  const outerStyle =
    modal && modal.options.isBackgroundBlur
      ? { backgroundColor: 'rgba(255,255,255,0.8)' }
      : { pointerEvents: 'none' };

  return (
    <Context.Provider value={modalContext}>
      {children}
      {root.current &&
        createPortal(
          <Fragment>
            {modal ? (
              <div
                css={styles}
                style={{
                  ...outerStyle,
                }}
              >
                <TransitionGroup
                  appear
                  key={
                    positions[
                      modal.options.transition
                        ? modal.options.transition
                        : transition
                    ]
                  }
                  options={{
                    position: modal.options.position
                      ? modal.options.position
                      : position,
                  }}
                  component={Wrapper}
                >
                  <Transition
                    type={
                      modal.options.transition
                        ? modal.options.transition
                        : transition
                    }
                    transitionStyles={transitionStyles}
                    key={modal.id}
                  >
                    <Rnd
                      default={{
                        width: modal.options.width
                          ? modal.options.width
                          : 'auto',
                        height: modal.options.height
                          ? modal.options.height
                          : 'auto',
                        x: 0,
                        y: 0,
                      }}
                      className="rnd-container"
                      style={{
                        ...style,
                        margin: offset,
                        pointerEvents: 'all',
                        position: 'none',
                        userSelect: 'none',
                      }}
                      enableResizing={modal.options.enableResizing}
                      dragHandleClassName="handle"
                      enableUserSelectHack={false}
                    >
                      {modal.options &&
                        cloneElement(modal.component, {
                          ...modal.options,
                          onClose: closeHandler,
                          style: { cursor: 'default' },
                        })}
                    </Rnd>
                  </Transition>
                </TransitionGroup>
              </div>
            ) : (
              <div />
            )}
          </Fragment>,
          root.current,
        )}
    </Context.Provider>
  );
};

Provider.defaultProps = {
  offset: '10px',
  position: positions.CENTER,
  transition: transitions.SCALE,
  wrapperRef: null,
  context: DefaultContext,
  style: {},
};

export default Provider;
