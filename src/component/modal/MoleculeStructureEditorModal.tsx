/** @jsxImportSource @emotion/react */
import { useState, useEffect, useCallback } from 'react';
import { StructureEditor } from 'react-ocl/full';

import { useDispatch } from '../context/DispatchContext';
import { SET_MOLECULE, ADD_MOLECULE } from '../reducer/types/Types';

import { ModalStyles } from './ModalStyle';

interface MoleculeStructureEditorModalProps {
  onClose?: (element?: string) => void;
  selectedMolecule: {
    key: any;
    molfile: string;
  };
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
      dispatch({ type: SET_MOLECULE, molfile, key: selectedMolecule.key });
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
        <button
          type="button"
          className="btn"
          onClick={handleSave}
          disabled={!molfile}
        >
          Save
        </button>
        <button type="button" className="btn" onClick={handleClose}>
          Close
        </button>
      </div>
    </div>
  );
}

export default MoleculeStructureEditorModal;
