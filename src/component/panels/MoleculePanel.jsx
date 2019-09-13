/* eslint-disable react/button-has-type */
import React, { useState, useCallback, useRef, useContext } from 'react';
import { MolfileSvgRenderer } from 'react-ocl';
import { FaPlus, FaPaste, FaRegTrashAlt } from 'react-icons/fa';
import { MF } from 'react-mf';

import '../css/molecule.css';
import { Button, Tooltip } from '@material-ui/core';
import Slider from 'react-animated-slider-2';

import 'react-animated-slider-2/build/horizontal.css';
import { useDispatch } from '../context/DispatchContext';
import { DELETE_MOLECULE, ADD_MOLECULE } from '../reducer/Actions';
import { ChartContext } from '../context/ChartContext';

import MoleculeStructureEditorModal from './MoleculeStructureEditorModal';

const MoleculePanel = () => {
  const refContainer = useRef();

  const [open, setOpen] = React.useState(false);
  const [currentMolFile, setCurrentMolFile] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  const { molecules } = useContext(ChartContext);

  const handleClose = useCallback(() => {
    setOpen(false);
  }, []);

  const handleOpen = useCallback((event, key, molfile) => {
    if (molfile) {
      setCurrentMolFile({ molfile, key });
    } else {
      setCurrentMolFile(null);
    }
    setOpen(true);
  }, []);

  const handlePast = useCallback(() => {
    navigator.clipboard.readText().then((molfile) => {
      dispatch({ type: ADD_MOLECULE, molfile });
    });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (molecules[currentIndex] && molecules[currentIndex].key) {
      setCurrentIndex(0);
      dispatch({ type: DELETE_MOLECULE, key: molecules[currentIndex].key });
    }
  }, [dispatch, molecules, currentIndex]);

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
        <p className="molecule-pager-number">
          {' '}
          {molecules &&
            molecules.length > 0 &&
            `${+(currentIndex + 1)} / ${molecules.length}`}{' '}
        </p>
      </div>
      <div className="molecule-body" ref={refContainer}>
        <Slider onSlideChange={(event) => setCurrentIndex(event.slideIndex)}>
          {molecules &&
            molecules.map((mol) => (
              <div
                key={mol.key}
                onDoubleClick={(event) =>
                  handleOpen(event, mol.key, mol.molfile)
                }
              >
                <div>
                  <MolfileSvgRenderer
                    width={
                      refContainer && refContainer.current.clientWidth - 70
                    }
                    molfile={mol.molfile}
                  />
                </div>
                <p>
                  <MF mf={mol.mf} /> - {mol.mw.toFixed(2)}
                </p>
              </div>
            ))}
        </Slider>

        <MoleculeStructureEditorModal
          open={open}
          onClose={handleClose}
          selectedMolFile={currentMolFile}
        />
      </div>
    </div>
  );
};

export default MoleculePanel;
