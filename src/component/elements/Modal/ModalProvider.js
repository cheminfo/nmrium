import React, {
  useRef,
  useState,
  useEffect,
  useCallback,
  Fragment,
} from 'react';
import { createPortal } from 'react-dom';
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
}) => {
  const root = useRef();
  const modalContext = useRef(null);
  const [modal, setModal] = useState();
  useEffect(() => {
    root.current = document.createElement('div');
    document.body.appendChild(root.current);

    return () => {
      if (root.current) document.body.removeChild(root.current);
    };
  }, []);

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
   * @param {boolean} options.isBackgroundBlure
   */
  const show = (component, options = {}) => {
    const _modal = {
      component,
      options: { isBackgroundBlure: true, ...options },
    };

    _modal.close = () => remove();

    setModal(_modal);
    if (_modal.options.onOpen) _modal.options.onOpen();
    return _modal;
  };

  const showConfirmDialog = (message, options = {}) => {
    const _modal = {
      component: <ConfirmDialog message={message} />,
      options: { isBackgroundBlure: true, ...options },
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
    modal && modal.options.isBackgroundBlure
      ? { backgroundColor: 'rgba(255,255,255,0.8)' }
      : { pointerEvents: 'none' };

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
                  ...outerStyle,
                }}
              >
                <TransitionGroup
                  appear
                  key={
                    positions[modal.transition ? modal.transition : transition]
                  }
                  options={{
                    position: modal.position ? modal.position : position,
                  }}
                  component={Wrapper}
                >
                  <Transition
                    type={modal.transition ? modal.transition : transition}
                    key={modal.id}
                  >
                    <div
                      style={{
                        boxSizing: 'initial',
                        backgroundColor: '#fff',
                        boxShadow: '0 0 0 0, 0 8px 16px rgba(0,0,0,.30)',
                        borderRadius: '5px',
                        ...style,
                        margin: offset,
                        pointerEvents: 'all',
                      }}
                    >
                      {modal.options &&
                        React.cloneElement(modal.component, {
                          ...modal.options,
                          onClose: closeHandler,
                        })}
                    </div>
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
  context: DefaultContext,
  style: {},
};
