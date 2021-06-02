import { useState, useEffect, useCallback } from 'react';
import { StructureEditor } from 'react-ocl/full';

import { useDispatch } from '../context/DispatchContext';
import { SET_MOLECULE, ADD_MOLECULE } from '../reducer/types/Types';

import { ModalStyles } from './ModalStyle';

function MoleculeStructureEditorModal(props) {
  const { onClose, selectedMolecule } = props;

  const [molfile, setMolfile] = useState(null);
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
      setMolfile(newMolfile);
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
        initialMolfile={selectedMolecule && selectedMolecule.molfile}
        svgMenu
        fragment={false}
        onChange={cb}
      />
      <div className="footer-container">
        <button type="button" className="btn" onClick={handleSave}>
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
