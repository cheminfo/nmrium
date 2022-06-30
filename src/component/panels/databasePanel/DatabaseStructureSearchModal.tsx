/** @jsxImportSource @emotion/react */
import { StructureEditor } from 'react-ocl/full';

import CloseButton from '../../elements/CloseButton';
import { ModalStyles } from '../../modal/ModalStyle';

interface DatabaseStructureSearchModalProps {
  onChange: (molfile: string) => void;
  molfile: string;
  onClose?: () => void;
}

export function DatabaseStructureSearchModal({
  onChange,
  molfile,
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
          initialMolfile={molfile}
          svgMenu
          fragment
          onChange={onChange}
        />
      </div>
    </div>
  );
}
