/** @jsxImportSource @emotion/react */
import { Molecule } from 'openchemlib/full';
import { StructureEditor } from 'react-ocl/full';

import CloseButton from '../../elements/CloseButton';
import { ModalStyles } from '../../modal/ModalStyle';

interface DatabaseStructureSearchModalProps {
  onChange: (molecule: Molecule) => void;
  molecule: Molecule | undefined;
  onClose?: () => void;
}

export function DatabaseStructureSearchModal({
  onChange,
  molecule,
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
          initialMolfile={molecule?.toMolfileV3()}
          svgMenu
          fragment
          onChange={(mplFile, molecule) => onChange(molecule)}
        />
      </div>
    </div>
  );
}
