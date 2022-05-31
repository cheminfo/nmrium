/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback } from 'react';
import { StructureEditor } from 'react-ocl/full';

import { Molecule } from '../../data/molecules/Molecule';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import { useModal } from '../elements/popup/Modal';
import { positions } from '../elements/popup/options';
import { SET_MOLECULE, ADD_MOLECULE } from '../reducer/types/Types';

import { ModalStyles } from './ModalStyle';

interface MoleculeStructureEditorModalProps {
  onClose?: (element?: string) => void;
  selectedMolecule?: Molecule;
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
      const molText =
        /(?<s>M {2}V30 BEGIN BOND)(?<mol>.*?)(?<e>M {2}V30 END BOND)/gs.exec(
          newMolfile,
        )?.groups?.mol;

      setMolfile(molText?.trim() ? newMolfile : null);
    },
    [setMolfile],
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (selectedMolecule) {
      const { key, isFloat, label } = selectedMolecule;
      dispatch({
        type: SET_MOLECULE,
        payload: {
          molfile,
          key,
          isFloat,
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

export function useMoleculeEditor(): (molecule?: Molecule) => void {
  const modal = useModal();
  return useCallback(
    (molecule?: Molecule) => {
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
