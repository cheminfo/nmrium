/** @jsxImportSource @emotion/react */
import { BsHexagon, BsHexagonFill } from 'react-icons/bs';
import { StructureEditor } from 'react-ocl/full';
import { Modal, useOnOff } from 'react-science/ui';

import Button from '../../elements/Button';

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
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);

  return (
    <>
      <Button.Done
        fill="clear"
        onClick={openDialog}
        style={{ marginLeft: '5px' }}
      >
        {!idCode ? (
          <BsHexagon
            style={{
              fontSize: '14px',
            }}
          />
        ) : (
          <BsHexagonFill
            style={{
              fontSize: '14px',
            }}
          />
        )}
      </Button.Done>
      <Modal
        hasCloseButton
        isOpen={isOpenDialog}
        onRequestClose={() => {
          onClose?.();
          closeDialog();
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
    </>
  );
}
