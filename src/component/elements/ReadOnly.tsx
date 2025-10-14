import { keyframes } from '@emotion/react';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import { useState } from 'react';
import { IoLockClosedOutline } from 'react-icons/io5';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Overlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  align-items: center;
  cursor: not-allowed;
  display: flex;
  height: 100%;
  justify-content: center;
  width: 100%;
`;

const MessageContainer = styled.div<{ show: boolean }>`
  align-items: center;
  animation: ${fadeIn} 0.3s ease;
  background-color: white;
  border-radius: 5px;
  box-shadow: 0 2px 10px rgb(0 0 0 / 10%);
  display: ${({ show }) => (show ? 'flex' : 'none')};
  gap: 8px;
  padding: 16px;
`;

interface ReadOnlyProps
  extends Pick<React.HTMLAttributes<HTMLDivElement>, 'onClick'> {
  enabled: boolean;
  children: ReactNode;
  message?: string;
  messageDisplayDuration?: number;
}

export function ReadOnly(props: ReadOnlyProps) {
  const {
    enabled,
    children,
    message = 'Read only',
    messageDisplayDuration = 800,
    onClick,
  } = props;
  const [showMessage, setShowMessage] = useState(false);

  function handleOverlayClick(event: any) {
    onClick?.(event);
    setShowMessage(true);
    setTimeout(() => setShowMessage(false), messageDisplayDuration);
  }

  return (
    <div style={{ position: 'relative' }}>
      {children}
      {enabled && (
        <Overlay
          onClick={handleOverlayClick}
          style={{ backdropFilter: showMessage ? 'blur(1px)' : 'none' }}
        >
          <MessageContainer show={showMessage}>
            <IoLockClosedOutline fontSize={18} />
            <span>{message}</span>
          </MessageContainer>
        </Overlay>
      )}
    </div>
  );
}
