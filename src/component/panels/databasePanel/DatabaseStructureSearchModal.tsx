/** @jsxImportSource @emotion/react */
import { StructureEditor } from 'react-ocl/full';

import CloseButton from '../../elements/CloseButton';
import { ModalStyles } from '../../modal/ModalStyle';

interface DatabaseStructureSearchModalProps {
  onChange: (idCode: string) => void;
  idCode: string | undefined;
  onClose?: () => void;
}

export function DatabaseStructureSearchModal({
  onChange,
  idCode,
  onClose,
}: DatabaseStructureSearchModalProps) {
  return (
    <div css={ModalStyles}>
      <div className="header handle">
        <span>Search by structure</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>

      <div className="main-content">
        <StructureEditor
          initialIDCode={idCode}
          svgMenu
          fragment
          onChange={(mplFile, molecule, idCode) => onChange(idCode)}
        />
      </div>
    </div>
  );
}
