import { useState } from 'react';
import type { CanvasEditorOnChangeMolecule } from 'react-ocl';
import { CanvasMoleculeEditor } from 'react-ocl';

import { StandardDialog } from '../../elements/StandardDialog.tsx';
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
    <StandardDialog
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
    </StandardDialog>
  );
}
