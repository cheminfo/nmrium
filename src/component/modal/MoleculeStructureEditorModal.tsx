/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback } from 'react';
import { StructureEditor } from 'react-ocl/full';

import { StateMoleculeExtended } from '../../data/molecules/Molecule';
import { isMolFileEmpty } from '../../data/utilities/isMolFileEmpty';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import { useModal } from '../elements/popup/Modal';
import { positions } from '../elements/popup/options';
import { SET_MOLECULE, ADD_MOLECULE } from '../reducer/types/Types';

import { ModalStyles } from './ModalStyle';

interface MoleculeStructureEditorModalProps {
  onClose?: (element?: string) => void;
  selectedMolecule?: StateMoleculeExtended;
}

function MoleculeStructureEditorModal(
  props: MoleculeStructureEditorModalProps,
) {
  const { onClose = () => null, selectedMolecule } = props;

  const [molfile, setMolfile] = useState<string | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (selectedMolecule) {
      setMolfile(selectedMolecule.molfile);
    } else {
      setMolfile(null);
    }
  }, [selectedMolecule]);

  const cb = useCallback(
    (newMolfile) => {
      setMolfile(isMolFileEmpty(newMolfile) ? null : newMolfile);
    },
    [setMolfile],
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (selectedMolecule) {
      const { id, label } = selectedMolecule;
      dispatch({
        type: SET_MOLECULE,
        payload: {
          molfile,
          id,
          label,
        },
      });
      onClose('replace');
    } else {
      dispatch({ type: ADD_MOLECULE, molfile });
      onClose('new');
    }
  }, [dispatch, selectedMolecule, molfile, onClose]);

  return (
    <div css={ModalStyles}>
      <StructureEditor
        initialMolfile={selectedMolecule?.molfile}
        svgMenu
        fragment={false}
        onChange={cb}
      />
      <div className="footer-container">
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={handleSave}
          doneLabel="Save"
          onCancel={handleClose}
        />
      </div>
    </div>
  );
}

export function useMoleculeEditor(): (
  molecule?: StateMoleculeExtended,
) => void {
  const modal = useModal();
  return useCallback(
    (molecule?: StateMoleculeExtended) => {
      modal.show(<MoleculeStructureEditorModal selectedMolecule={molecule} />, {
        position: positions.TOP_CENTER,
        width: 700,
        height: 500,
      });
    },
    [modal],
  );
}

export default MoleculeStructureEditorModal;
