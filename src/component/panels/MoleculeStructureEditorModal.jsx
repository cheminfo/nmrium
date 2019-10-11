import React, { useState, useEffect, useCallback } from 'react';
import { StructureEditor } from 'react-ocl/full';

import { useDispatch } from '../context/DispatchContext';
import { SET_MOLECULE, ADD_MOLECULE } from '../reducer/Actions';
import Modal from '../elements/Modal';

const MoleculeStructureEditorModal = (props) => {
  const { onClose, open, selectedMolFile } = props;
  const [molfile, setMolfile] = useState(selectedMolFile);
  const dispatch = useDispatch();

  useEffect(() => {
    if (selectedMolFile) {
      setMolfile(selectedMolFile.molfile);
    } else {
      setMolfile(null);
    }
  }, [selectedMolFile, open]);

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
    if (selectedMolFile) {
      dispatch({ type: SET_MOLECULE, molfile, key: selectedMolFile.key });
    } else {
      dispatch({ type: ADD_MOLECULE, molfile });
    }
    onClose();
  }, [dispatch, selectedMolFile, molfile, onClose]);

  const styles = {
    outerContainer: {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      left: 0,
      backgroundColor: 'rgba(255,255,255,0.8)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1,
    },
    innerContainer: {
      padding: '10px 10px 0',
      boxSizing: 'initial',
      background: '#fff',
      borderRadius: '4px',
      boxShadow: '0 0 0 0, 0 8px 16px rgba(0,0,0,.30)',
      display: 'flex',
      flexDirection: 'column',
    },
    footer: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      margin: 5,
    },
  };

  return (
    // open && (
    //   <div style={styles.outerContainer} onClick={handleClose}>
    //     <div
    //       style={styles.innerContainer}
    //       onClick={(e) => {
    //         e.preventDefault();
    //         e.stopPropagation();
    //       }}
    //     >
    <Modal open={open} onClose={handleClose}>
      <StructureEditor
        molfile={molfile}
        initialMolfile={molfile}
        svgMenu={true}
        fragment={false}
        onChange={cb}
      />
      <div style={styles.footer}>
        <button type="button" className="modal-bt" onClick={handleClose}>
          Close
        </button>
        <button type="button" className="modal-bt" onClick={handleSave}>
          Save
        </button>
      </div>
    </Modal>
    //   </div>
    // </div>
    // )
  );
};

export default MoleculeStructureEditorModal;
