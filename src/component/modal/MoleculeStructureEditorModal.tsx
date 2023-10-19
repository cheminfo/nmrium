/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback } from 'react';
import { StructureEditor, IStructureEditorProps } from 'react-ocl/full';
import { ConfirmModal, Modal, useOnOff } from 'react-science/ui';

import { StateMoleculeExtended } from '../../data/molecules/Molecule';
import { useDispatch } from '../context/DispatchContext';

interface MoleculeStructureEditorModalProps {
  onClose?: (element?: string) => void;
  selectedMolecule?: StateMoleculeExtended;
  floatMoleculeOnSave?: boolean;
  isOpen?: boolean;
}

function MoleculeStructureEditorModal(
  props: MoleculeStructureEditorModalProps,
) {
  const {
    onClose = () => null,
    selectedMolecule,
    floatMoleculeOnSave = false,
    isOpen = false,
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
    <ConfirmModal
      headerColor="transparent"
      isOpen={isOpen}
      onRequestClose={handleClose}
      onCancel={handleClose}
      onConfirm={handleSave}
      maxWidth={700}
    >
      <Modal.Body>
        <StructureEditor
          initialMolfile={selectedMolecule?.molfile}
          svgMenu
          fragment={false}
          onChange={cb}
        />
      </Modal.Body>
    </ConfirmModal>
  );
}

export function useMoleculeEditor(floatMoleculeOnSave = false) {
  const [isOpen, openModal, closeModal] = useOnOff(false);
  const [molecule, setMolecule] = useState<StateMoleculeExtended | undefined>();
  const modal = (
    <MoleculeStructureEditorModal
      selectedMolecule={molecule}
      floatMoleculeOnSave={floatMoleculeOnSave}
      onClose={closeModal}
      isOpen={isOpen}
    />
  );
  const openMoleculeEditor = useCallback(
    (molecule?: StateMoleculeExtended) => {
      setMolecule(molecule);
      openModal();
    },
    [openModal],
  );
  return { modal, openMoleculeEditor };
}

export default MoleculeStructureEditorModal;
