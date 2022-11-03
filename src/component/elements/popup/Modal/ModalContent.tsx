import { useRef, useEffect, cloneElement } from 'react';
import { useSize } from 'react-use';

const ModalContent = ({ modal, onClose, onLayout }) => {
  const contentSize = useRef<any>();

  const [Content, { width, height }] = useSize(() => {
    return (
      <div
        style={{
          height: '100%',
          display: 'block',
          overflow: 'auto',
        }}
      >
        {cloneElement(modal.component, {
          ...modal.options,
          onClose,
          style: { cursor: 'default' },
        })}
      </div>
    );
  });

  useEffect(() => {
    if (
      Number.isFinite(height) &&
      Number.isFinite(width) &&
      !contentSize.current
    ) {
      contentSize.current = { width, height };
      onLayout({ modal, layout: { width, height } });
    }
  }, [width, height, contentSize, onLayout, modal]);

  return Content;
};

export default ModalContent;
