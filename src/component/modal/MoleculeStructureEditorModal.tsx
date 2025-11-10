import { Dialog, DialogFooter } from '@blueprintjs/core';
import { Molecule } from 'openchemlib';
import { TopicMolecule } from 'openchemlib-utils';
import { useCallback, useEffect, useMemo, useState } from 'react';
import type { CanvasEditorOnChangeMolecule } from 'react-ocl';
import { CanvasMoleculeEditor } from 'react-ocl';
import { useOnOff } from 'react-science/ui';

import type { StateMoleculeExtended } from '../../data/molecules/Molecule.js';
import { useDispatch } from '../context/DispatchContext.js';
import { usePreferences } from '../context/PreferencesContext.tsx';
import ActionButtons from '../elements/ActionButtons.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';

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
    floatMoleculeOnSave,
    isOpen = false,
  } = props;

  const {
    current: { defaultMoleculeSettings },
  } = usePreferences();

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

  const cb = useCallback(
    (event: CanvasEditorOnChangeMolecule) => {
      const molFile = event.getMolfileV3();
      const molecule = Molecule.fromMolfile(molFile);
      if (molecule.getAllAtoms() === 0) {
        setMolfile(null);
      } else {
        setMolfile(molFile);
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
            defaultMoleculeSettings,
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
    onClose,
    floatMoleculeOnSave,
    defaultMoleculeSettings,
  ]);

  return (
    <Dialog isOpen={isOpen} onClose={handleClose} style={{ width: 710 }}>
      <StyledDialogBody>
        <CanvasMoleculeEditor
          inputFormat="molfile"
          inputValue={initialEnhancedMolfile?.molfile}
          fragment={false}
          onChange={cb}
          width={675}
          height={450}
        />
      </StyledDialogBody>
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

export function useMoleculeEditor(floatMoleculeOnSave?: boolean) {
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
