/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback } from 'react';
import { StructureEditor, IStructureEditorProps } from 'react-ocl/full';

import { StateMoleculeExtended } from '../../data/molecules/Molecule';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import { useModal } from '../elements/popup/Modal';
import { positions } from '../elements/popup/options';

import { ModalStyles } from './ModalStyle';

interface MoleculeStructureEditorModalProps {
  onClose?: (element?: string) => void;
  selectedMolecule?: StateMoleculeExtended;
  floatMoleculeOnSave?: boolean;
}

function MoleculeStructureEditorModal(
  props: MoleculeStructureEditorModalProps,
) {
  const {
    onClose = () => null,
    selectedMolecule,
    floatMoleculeOnSave = false,
  } = props;

  const [molfile, setMolfile] = useState<string | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (selectedMolecule) {
      setMolfile(selectedMolecule.molfile);
    } else {
      setMolfile(null);
    }
  }, [selectedMolecule]);

  const cb = useCallback<Exclude<IStructureEditorProps['onChange'], undefined>>(
    (newMolfile, molecule) => {
      if (molecule.getAllAtoms() === 0) {
        setMolfile(null);
      } else {
        setMolfile(newMolfile);
      }
    },
    [setMolfile],
  );

  const handleClose = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleSave = useCallback(() => {
    if (molfile) {
      if (selectedMolecule) {
        const { id, label } = selectedMolecule;
        dispatch({
          type: 'SET_MOLECULE',
          payload: {
            molfile,
            id,
            label,
          },
        });
        onClose('replace');
      } else {
        dispatch({
          type: 'ADD_MOLECULE',
          payload: {
            molfile,
            floatMoleculeOnSave,
          },
        });
        onClose('new');
      }
    }
  }, [molfile, selectedMolecule, dispatch, floatMoleculeOnSave, onClose]);

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

export function useMoleculeEditor(
  floatMoleculeOnSave = false,
): (molecule?: StateMoleculeExtended) => void {
  const modal = useModal();
  return useCallback(
    (molecule?: StateMoleculeExtended) => {
      modal.show(
        <MoleculeStructureEditorModal
          selectedMolecule={molecule}
          floatMoleculeOnSave={floatMoleculeOnSave}
        />,
        {
          position: positions.TOP_CENTER,
          width: 700,
          height: 500,
        },
      );
    },
    [floatMoleculeOnSave, modal],
  );
}

export default MoleculeStructureEditorModal;
