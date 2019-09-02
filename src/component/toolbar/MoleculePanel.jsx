import React, { useRef, useEffect, useState, useCallback } from 'react';
import { SmilesSvgRenderer } from 'react-ocl';

// import StructureEditor from 'openchemlib';
import { StructureEditor } from 'react-ocl/full';
import { FaPlus, FaPaste } from 'react-icons/fa';

import '../css/molecule.css';
import {
  Button,
  Tooltip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@material-ui/core';
// import { SVGRenderer } from 'openchemlib/types';

const initialMolfile = `
Actelion Java MolfileCreator 1.0
  6  5  0  0  0  0  0  0  0  0999 V2000
    3.4641   -0.5000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    2.5981   -0.0000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.7321   -0.5000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
    1.7321   -1.5000   -0.0000 O   0  0  0  0  0  0  0  0  0  0  0  0
    0.8660   -0.0000   -0.0000 N   0  0  0  0  0  0  0  0  0  0  0  0
    0.0000   -0.5000   -0.0000 C   0  0  0  0  0  0  0  0  0  0  0  0
  2  1  1  0  0  0  0
  3  2  1  0  0  0  0
  4  3  2  0  0  0  0
  5  3  1  0  0  0  0
  6  5  1  0  0  0  0
M  END
`;

export const StructureEditorModal = (props) => {
  const { onClose, selectedValue, open } = props;
  const [molfile, setMolfile] = useState(initialMolfile);

  const cb = useCallback(
    (newMolfile) => {
      setMolfile(newMolfile);
    },
    [setMolfile],
  );

  const handleClose = useCallback(() => {
    onClose(selectedValue);
  }, [selectedValue, onClose]);

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogContent dividers>
        {console.log(open)}
        {/* <DialogTitle id="simple-dialog-title">Set backup account</DialogTitle> */}
        <StructureEditor
          initialMolfile={molfile}
          svgMenu={true}
          fragment={false}
          onChange={cb}
        />
      </DialogContent>

      <DialogActions>
        <Button onClick={handleClose} color="primary">
          Close
        </Button>
        <Button onClick={handleClose} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MoleculePanel = () => {
  const [open, setOpen] = React.useState(false);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback(() => {
    console.log('ssss');
    setOpen(true);
  }, []);

  return (
    <div className="molecule-container">
      <div className="molecule-toolbar">
        <Tooltip title="Past Molecule" placement="left-start">
          <Button>
            <FaPaste />
          </Button>
        </Tooltip>
        <Tooltip title="Add Molecule" placement="left-start">
          <Button onClick={handleOpen}>
            <FaPlus />
          </Button>
        </Tooltip>
      </div>
      <div className="molecule-body">
        <SmilesSvgRenderer smiles="COCCOOOCO" />
        <StructureEditorModal open={open} onClose={handleClose} />
      </div>
    </div>
  );
};

export default MoleculePanel;
