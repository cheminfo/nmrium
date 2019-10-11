import React, { useEffect, useCallback } from 'react';

const styles = {
  outerContainer: {
    position: 'fixed',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0,
    backgroundColor: 'rgba(255,255,255,0.8)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1,
  },
  innerContainer: {
    padding: '10px 10px 0',
    boxSizing: 'initial',
    background: '#fff',
    borderRadius: '4px',
    boxShadow: '0 0 0 0, 0 8px 16px rgba(0,0,0,.30)',
    display: 'flex',
    flexDirection: 'column',
  },
};

const Modal = ({ children, open, onClose }) => {
  const handleClose = useCallback(
    (e) => {
      onClose(e);
    },
    [onClose],
  );

  useEffect(() => {
    if (open === false) {
      handleClose();
    }
  }, [handleClose, open]);

  return (
    open && (
      <div style={styles.outerContainer} onClick={handleClose}>
        <div
          style={styles.innerContainer}
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
        >
          {children}
        </div>
      </div>
    )
  );
};

Modal.defaultProps = {
  onClose: function() {
    return null;
  },
  open: false,
};

export default Modal;
