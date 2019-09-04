import React, { useRef, useEffect, useState, useCallback } from 'react';
import { MolfileSvgRenderer } from 'react-ocl';

// import StructureEditor from 'openchemlib';
import { StructureEditor } from 'react-ocl/full';
import { FaPlus, FaPaste,FaRegTrashAlt } from 'react-icons/fa';

import '../css/molecule.css';
import {
  Button,
  Tooltip,
  Dialog,
  DialogContent,
  DialogActions,
} from '@material-ui/core';

import Slider from 'react-animated-slider-2';
import 'react-animated-slider-2/build/horizontal.css';
import { useDispatch } from '../context/DispatchContext';
import { ADD_MOLECULE, SET_MOLECULE,DELETE_MOLECULE } from '../reducer/Actions';

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
  const { onClose, open, selectedMolFile } = props;
  const [molfile, setMolfile] = useState(selectedMolFile);
  const dispatch = useDispatch();

  useEffect(() => {
    console.log(selectedMolFile);
    if (selectedMolFile) {
      setMolfile(selectedMolFile.molfile);
    } else {
      setMolfile(initialMolfile);
    }
  }, [selectedMolFile]);

  const cb = useCallback(
    (newMolfile) => {
      console.log(newMolfile);
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

  return (
    <Dialog
      onClose={handleClose}
      aria-labelledby="simple-dialog-title"
      open={open}
      fullWidth={true}
      maxWidth="md"
    >
      <DialogContent dividers>
        <StructureEditor
          molfile={molfile}
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
        <Button onClick={handleSave} color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

const MoleculePanel = ({ molecules }) => {
  const [open, setOpen] = React.useState(false);
  const [currentMolFile, setCurrentMolFile] = useState();
  const [currentIndex,setCurrentIndex]=useState(0);
  const dispatch = useDispatch();

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback((event, key, molfile) => {
    console.log(key);
    if (molfile) {
      setCurrentMolFile({ molfile, key });
    } else {
      setCurrentMolFile(null);
    }
    setOpen(true);
  }, []);

  const handlePast = useCallback((event) => {
    navigator.clipboard.readText().then((molfile) => {
      dispatch({ type: ADD_MOLECULE, molfile });
    });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
      if(molecules[currentIndex] && molecules[currentIndex].key){
         setCurrentIndex(0);
      dispatch({ type: DELETE_MOLECULE, key:molecules[currentIndex].key });
      }
  }, [dispatch,molecules,currentIndex]);



  

  useEffect(() => {
    console.log(molecules);
  }, [molecules]);

  return (
    <div className="molecule-container">
      <div className="molecule-toolbar">
        <Tooltip title="Past Molecule" placement="left-start">
          <Button onClick={handlePast}>
            <FaPaste />
          </Button>
        </Tooltip>
        <Tooltip title="Add Molecule" placement="left-start">
          <Button onClick={handleOpen}>
            <FaPlus />
          </Button>
        </Tooltip>
        <Tooltip title="Delete Molecule" placement="left-start">
          <Button onClick={handleDelete}>
            <FaRegTrashAlt />
          </Button>
        </Tooltip>
        <span> {molecules  && molecules.length >0 && `( `+(currentIndex + 1)+ ` )`} </span>
      </div>
      <div className="molecule-body">
        <Slider onSlideChange={event => setCurrentIndex(event.slideIndex)}>
          {molecules  &&
            molecules.map((mol, index) => (
              <div
                key={mol.mf + index}
                onDoubleClick={(event) =>
                  handleOpen(event, mol.key, mol.molfile)
                }
              >
                {/* <p>( {index + 1} )</p> */}
                <div>
                <MolfileSvgRenderer molfile={mol.molfile} />
                </div>
                <p>{mol.mf} - {mol.mw.toFixed(2)}</p>
              </div>
            ))}
        </Slider>

        {molecules != null && molecules && console.log(molecules)}

        <StructureEditorModal
          open={open}
          onClose={handleClose}
          selectedMolFile={currentMolFile}
        />
      </div>
    </div>
  );
};

export default MoleculePanel;
