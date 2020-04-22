import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

import ConfirmDialog from './ConfirmDialog';
import DefaultContext from './Context';
import Modal from './Modal';

const ModalProvider = ({ children, context: Context, style }) => {
  const root = useRef();
  const modalContext = useRef(null);
  const [modal, setModal] = useState({ show: false });
  useEffect(() => {
    root.current = document.createElement('div');
    document.body.appendChild(root.current);

    return () => {
      if (root.current) document.body.removeChild(root.current);
    };
  }, []);

  const remove = () => {
    setModal((currentModal) => {
      if (
        currentModal &&
        currentModal.options &&
        currentModal.options.onClose
      ) {
        currentModal.options.onClose();
      }
      return { show: false };
    });
  };

  const closeHandler = useCallback(() => {
    remove();
  }, []);
  /**
   *
   * @param {*} component  <component />
   * @param {*} options    {onYest:()=>{}, prop1, .... etc}
   */
  const show = (component, options = {}) => {
    const _modal = {
      component,
      options,
      show: true,
    };

    _modal.close = () => remove();

    setModal(_modal);
    if (_modal.options.onOpen) _modal.options.onOpen();
    return _modal;
  };

  const showConfirmDialog = (message, options = {}) => {
    const _modal = {
      component: <ConfirmDialog />,
      options,
      show: true,
    };
    options.message = message;

    _modal.close = () => remove();

    setModal(_modal);
    if (_modal.options.onOpen) _modal.options.onOpen();

    return _modal;
  };

  const close = () => {
    closeHandler();
  };

  modalContext.current = {
    show,
    close,
    modal,
    showConfirmDialog,
  };

  return (
    <Context.Provider value={modalContext}>
      {children}
      {root.current &&
        createPortal(
          <Modal open={modal.show} onClose={closeHandler} style={style}>
            {modal.options &&
              React.cloneElement(modal.component, {
                ...modal.options,
                onClose: closeHandler,
              })}
          </Modal>,
          root.current,
        )}
    </Context.Provider>
  );
};

export default ModalProvider;

ModalProvider.defaultProps = {
  context: DefaultContext,
  style: {},
};
