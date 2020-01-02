import React, { useRef, useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';

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

  const close = () => {
    closeHandler();
  };

  modalContext.current = {
    show,
    close,
    modal,
  };

  return (
    <Context.Provider value={modalContext}>
      {children}
      {root.current &&
        createPortal(
          <Modal open={modal.show} onClose={closeHandler} style={style}>
            {modal.component}
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
