/** @jsxImportSource @emotion/react */
import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Molecule } from 'openchemlib/full';
import { TopicMolecule } from 'openchemlib-utils';
import { useState, useEffect, useCallback, useMemo } from 'react';
import { StructureEditor, StructureEditorProps } from 'react-ocl/full';
import { useOnOff } from 'react-science/ui';

import { StateMoleculeExtended } from '../../data/molecules/Molecule';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';

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

  const initialMolfile = selectedMolecule?.molfile;
  const initialEnhancedMolfile = useMemo(() => {
    if (!initialMolfile) {
      return null;
    }
    // Add mapNo to molfile, so we can remap diaIDs after edition.
    const molecule = Molecule.fromMolfile(initialMolfile);
    const topicMolecule = new TopicMolecule(molecule);
    topicMolecule.ensureMapNo();
    const newMolfile = topicMolecule.toMolfile({ version: 3 });
    return { molfile: newMolfile, topicMolecule };
  }, [initialMolfile]);

  const [molfile, setMolfile] = useState<string | null>(null);
  const dispatch = useDispatch();
  useEffect(() => {
    if (initialEnhancedMolfile) {
      setMolfile(initialEnhancedMolfile.molfile);
    } else {
      setMolfile(null);
    }
  }, [initialEnhancedMolfile]);

  const cb = useCallback<Exclude<StructureEditorProps['onChange'], undefined>>(
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
      if (selectedMolecule && initialEnhancedMolfile) {
        const { id, label } = selectedMolecule;
        const editedMolecule = Molecule.fromMolfile(molfile);
        const mappings =
          initialEnhancedMolfile.topicMolecule.getDiaIDsMapping(editedMolecule);
        dispatch({
          type: 'SET_MOLECULE',
          payload: {
            molfile,
            id,
            label,
            mappings,
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
  }, [
    molfile,
    selectedMolecule,
    initialEnhancedMolfile,
    dispatch,
    floatMoleculeOnSave,
    onClose,
  ]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} style={{ width: 710 }}>
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <StructureEditor
          initialMolfile={initialEnhancedMolfile?.molfile}
          svgMenu
          fragment={false}
          onChange={cb}
        />
      </DialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={handleSave}
          doneLabel="Save"
          onCancel={() => {
            onClose();
          }}
        />
      </DialogFooter>
    </Dialog>
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
