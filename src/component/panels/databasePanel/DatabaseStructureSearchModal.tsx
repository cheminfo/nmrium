import { Dialog } from '@blueprintjs/core';
import { useState } from 'react';
import type { CanvasEditorOnChangeMolecule } from 'react-ocl';
import { CanvasMoleculeEditor } from 'react-ocl';

import { StyledDialogBody } from '../../elements/StyledDialogBody.js';

interface DatabaseStructureSearchModalProps {
  onChange: (idCode: string) => void;
  initialIdCode: string | undefined;
  onClose?: () => void;
}

export function DatabaseStructureSearchModal({
  onChange,
  initialIdCode,
  onClose,
}: DatabaseStructureSearchModalProps) {
  const [idCode] = useState(initialIdCode);
  return (
    <Dialog
      isOpen
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
          width={675}
          height={450}
        />
      </StyledDialogBody>
    </Dialog>
  );
}
