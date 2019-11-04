import React, { useState, useEffect, useCallback } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { StructureEditor } from 'react-ocl/full';

import { useDispatch } from '../context/DispatchContext';
import { SET_MOLECULE, ADD_MOLECULE } from '../reducer/Actions';
import Modal from '../elements/Modal';

const modalButtonStyle = css`
  -moz-box-shadow: inset 0px 1px 0px 0px #ffffff;
  -webkit-box-shadow: inset 0px 1px 0px 0px #ffffff;
  box-shadow: inset 0px 1px 0px 0px #ffffff;
  background: -webkit-gradient(
    linear,
    left top,
    left bottom,
    color-stop(0.05, #ffffff),
    color-stop(1, #f6f6f6)
  );
  background: -moz-linear-gradient(top, #ffffff 5%, #f6f6f6 100%);
  background: -webkit-linear-gradient(top, #ffffff 5%, #f6f6f6 100%);
  background: -o-linear-gradient(top, #ffffff 5%, #f6f6f6 100%);
  background: -ms-linear-gradient(top, #ffffff 5%, #f6f6f6 100%);
  background: linear-gradient(to bottom, #ffffff 5%, #f6f6f6 100%);
  filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#ffffff', endColorstr='#f6f6f6',GradientType=0);
  background-color: #ffffff;
  border: 0.55px solid #dcdcdc;
  display: inline-block;
  cursor: pointer;
  color: #666666;
  font-weight: bold;
  padding: 6px 24px;
  text-decoration: none;
  text-shadow: 0px 1px 0px #ffffff;

  :hover {
    background: -webkit-gradient(
      linear,
      left top,
      left bottom,
      color-stop(0.05, #f6f6f6),
      color-stop(1, #ffffff)
    );
    background: -moz-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: -webkit-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: -o-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: -ms-linear-gradient(top, #f6f6f6 5%, #ffffff 100%);
    background: linear-gradient(to bottom, #f6f6f6 5%, #ffffff 100%);
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr='#f6f6f6', endColorstr='#ffffff',GradientType=0);
    background-color: #f6f6f6;
  }
`;

const MoleculeStructureEditorModal = (props) => {
  const { onClose, open, selectedMolFile } = props;
  const [molfile, setMolfile] = useState(null);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(selectedMolFile);

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
    footer: {
      display: 'flex',
      alignItems: 'flex-end',
      justifyContent: 'flex-end',
      margin: 5,
    },
  };

  return (
    <Modal open={open} onClose={handleClose}>
      <StructureEditor
        molfile={molfile}
        initialMolfile={molfile}
        svgMenu={true}
        fragment={false}
        onChange={cb}
      />
      <div style={styles.footer}>
        <button type="button" css={modalButtonStyle} onClick={handleClose}>
          Close
        </button>
        <button type="button" css={modalButtonStyle} onClick={handleSave}>
          Save
        </button>
      </div>
    </Modal>
  );
};

export default MoleculeStructureEditorModal;
