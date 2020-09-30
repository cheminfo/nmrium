import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import { createPortal } from 'react-dom';
// import { Rnd } from 'react-rnd';
import { Rnd } from 'react-rnd';
import { TransitionGroup } from 'react-transition-group';

import ConfirmDialog from './ConfirmDialog';
import DefaultContext from './Context';
// import Modal from './Modal';
import Transition from './Transition';
import Wrapper from './Wrapper';
// import { groupBy } from './helpers';
import { positions, transitions } from './options';

const ModalProvider = ({
  children,
  context: Context,
  style,
  offset,
  position,
  transition,
  wrapperID,
}) => {
  const root = useRef();
  // const rndRef = useRef();
  const modalContext = useRef(null);
  const [modal, setModal] = useState();
  useEffect(() => {
    root.current = document.createElement('div');
    if (wrapperID) {
      document.getElementById(wrapperID).appendChild(root.current);
    } else {
      document.body.appendChild(root.current);
    }

    return () => {
      if (root.current) {
        if (wrapperID) {
          document.getElementById(wrapperID).removeChild(root.current);
        } else {
          document.body.removeChild(root.current);
        }
      }
    };
  }, [wrapperID]);

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
    document.addEventListener('keydown', keyHandler);
    return () => document.removeEventListener('keydown', keyHandler);
  }, [closeHandler]);

  modalContext.current = {
    show,
    close,
    modal,
    showConfirmDialog,
  };

  const outerStyle =
    modal && modal.options.isBackgroundBlur
      ? { backgroundColor: 'rgba(255,255,255,0.8)' }
      : { pointerEvents: 'none' };

  // const isEnableResizing = (flag) => {
  //   return {
  //     bottom: flag,
  //     bottomLeft: flag,
  //     bottomRight: flag,
  //     left: flag,
  //     right: flag,
  //     top: flag,
  //     topLeft: flag,
  //     topRight: flag,
  //   };
  // };

  const stopPropagation = useCallback((e) => {
    e.stopPropagation();
    e.stopImmediatePropagation();
  }, []);

  return (
    <Context.Provider value={modalContext}>
      {children}
      {root.current &&
        createPortal(
          <Fragment>
            {modal && (
              <div
                style={{
                  position: 'fixed',
                  top: 0,
                  right: 0,
                  bottom: 0,
                  left: 0,
                  zIndex: 1,
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
                      // ref={rndRef}
                      style={{
                        boxSizing: 'initial',
                        backgroundColor: '#fff',
                        boxShadow: '0 0 0 0, 0 8px 16px rgba(0,0,0,.30)',
                        borderRadius: '5px',
                        ...style,
                        margin: offset,
                        pointerEvents: 'all',
                        position: 'none',
                        userSelect: 'none',
                        cursor: 'default',
                      }}
                      enableResizing={
                        modal.options.enableResizing
                        //   ? isEnableResizing(true)
                        //   : isEnableResizing(false)
                      }
                    >
                      {/* <div
                      style={{
                        boxSizing: 'initial',
                        backgroundColor: '#fff',
                        boxShadow: '0 0 0 0, 0 8px 16px rgba(0,0,0,.30)',
                        borderRadius: '5px',
                        ...style,
                        margin: offset,
                        pointerEvents: 'all',
                        position: 'none',
                      }}
                    > */}
                      {modal.options &&
                        React.cloneElement(modal.component, {
                          ...modal.options,
                          onClose: closeHandler,
                          style: { cursor: 'default' },
                          onDrag: stopPropagation,
                          onMouseDown: stopPropagation,
                          onMouseUp: stopPropagation,
                          onStart: stopPropagation,
                          onStop: stopPropagation,
                        })}
                      {/* </div> */}
                    </Rnd>
                  </Transition>
                </TransitionGroup>
              </div>
            )}
          </Fragment>,
          root.current,
        )}
    </Context.Provider>
  );
};

export default ModalProvider;

ModalProvider.defaultProps = {
  offset: '10px',
  position: positions.CENTER,
  transition: transitions.SCALE,
  // containerStyle: {
  //   zIndex: 100,
  // },
  wrapperID: null,
  context: DefaultContext,
  style: {},
};
