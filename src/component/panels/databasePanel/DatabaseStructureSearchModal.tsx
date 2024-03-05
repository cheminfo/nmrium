/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { StructureEditor } from 'react-ocl/full';

interface DatabaseStructureSearchModalProps {
  onChange: (idCode: string) => void;
  isOpen: boolean;
  idCode: string | undefined;
  onClose?: () => void;
}

export function DatabaseStructureSearchModal({
  onChange,
  isOpen,
  idCode,
  onClose,
}: DatabaseStructureSearchModalProps) {
  return (
    <Dialog
      isOpen={isOpen}
      onClose={() => {
        onClose?.();
      }}
      style={{ width: 720 }}
      title="Search by structure"
    >
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <StructureEditor
          initialIDCode={idCode}
          svgMenu
          fragment
          onChange={(molFile, molecule, idCode) => onChange(idCode)}
        />
      </DialogBody>
    </Dialog>
  );
}
