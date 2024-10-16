/** @jsxImportSource @emotion/react */
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
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: not-allowed;
`;

const MessageContainer = styled.div<{ show: boolean }>`
  background-color: white;
  padding: 16px;
  border-radius: 5px;
  align-items: center;
  box-shadow: 0 2px 10px rgb(0 0 0 / 10%);
  display: ${({ show }) => (show ? 'flex' : 'none')};
  animation: ${fadeIn} 0.3s ease;
  gap: 8px;
`;

interface ReadOnlyProps {
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
  } = props;
  const [showMessage, setShowMessage] = useState(false);

  function handleOverlayClick() {
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
