import { Dialog } from '@blueprintjs/core';
import { StructureEditor } from 'react-ocl/full';

import { DialogBody } from '../../elements/DialogBody.js';

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
      <DialogBody>
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
