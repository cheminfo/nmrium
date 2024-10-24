/** @jsxImportSource @emotion/react */
import { Button, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import styled from '@emotion/styled';
import { FaCopy } from 'react-icons/fa';

const Body = styled.div`
  padding: 5px;
  width: 100%;
  height: 180px;
  border: none;
`;

interface CopyClipboardModalProps {
  text?: string;
  title: string;
  onClose: () => void;
  onCopyClick: (text: string) => void;
}

function CopyClipboardModal(props: CopyClipboardModalProps) {
  const { text, ...otherProps } = props;

  if (!text) return;

  return <InnerCopyClipboardModal text={text} {...otherProps} />;
}

function InnerCopyClipboardModal(props: Required<CopyClipboardModalProps>) {
  const { text, title, onClose, onCopyClick } = props;
  return (
    <Dialog isOpen title={title} onClose={onClose}>
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <Body dangerouslySetInnerHTML={{ __html: text }} />
      </DialogBody>
      <DialogFooter>
        <Button
          onClick={() => onCopyClick(text)}
          intent="success"
          icon={<FaCopy />}
        />
      </DialogFooter>
    </Dialog>
  );
}

export default CopyClipboardModal;
