/** @jsxImportSource @emotion/react */
import { StructureEditor } from 'react-ocl/full';
import { Modal } from 'react-science/ui';

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
    <Modal
      hasCloseButton
      isOpen={isOpen}
      onRequestClose={() => {
        onClose?.();
      }}
      maxWidth={1000}
    >
      <Modal.Header>
        <div
          style={{
            color: 'rgb(0, 93, 158)',
            width: '100%',
            textAlign: 'center',
          }}
        >
          <span>Search by structure</span>
        </div>
      </Modal.Header>
      <Modal.Body>
        <StructureEditor
          initialIDCode={idCode}
          svgMenu
          fragment
          onChange={(molFile, molecule, idCode) => onChange(idCode)}
        />
      </Modal.Body>
    </Modal>
  );
}
