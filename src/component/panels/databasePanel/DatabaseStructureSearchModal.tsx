import { Dialog } from '@blueprintjs/core';
import { CanvasMoleculeEditor } from 'react-ocl';
import type { CanvasEditorOnChangeMolecule } from 'react-ocl';

import { StyledDialogBody } from '../../elements/StyledDialogBody.js';

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
      <StyledDialogBody>
        <CanvasMoleculeEditor
          inputFormat="idcode"
          inputValue={idCode}
          fragment
          onChange={(event: CanvasEditorOnChangeMolecule) =>
            onChange(event.getIdcode())
          }
        />
      </StyledDialogBody>
    </Dialog>
  );
}
