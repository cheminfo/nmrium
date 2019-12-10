import React, { useState, useCallback, useRef, useContext } from 'react';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { MolfileSvgRenderer } from 'react-ocl';
import { FaPlus, FaPaste, FaRegTrashAlt } from 'react-icons/fa';
import { MF } from 'react-mf';
import Slider from 'react-animated-slider-2';

import 'react-animated-slider-2/build/horizontal.css';
import { useDispatch } from '../context/DispatchContext';
import { DELETE_MOLECULE, ADD_MOLECULE } from '../reducer/Actions';
import { ChartContext } from '../context/ChartContext';
import ToolTip from '../elements/ToolTip/ToolTip';

import MoleculeStructureEditorModal from './MoleculeStructureEditorModal';

const panelContainerStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const toolbarStyle = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240, 240, 240);

  button svg {
    fill: #4e4e4e;
  }

  button {
    width: 40px !important;
    padding: 5px 0px !important;
    min-width: 10px !important;
    background-color: transparent;
    border: none;
  }

  p {
    margin: 0;
    text-align: right;
    width: 100%;
    line-height: 22px;
    padding: 0px 10px;
  }
`;

const moleculeContainerStyle = css`
  .slider {
    height: 180px;
    padding: 0px;
  }
  .slider p {
    width: 100%;
    margin: 0 auto;
    display: block;
    position: relative;
  }

  .slider svg polygon {
    fill: gray !important;
  }
`;

const MoleculePanel = () => {
  const refContainer = useRef();

  const [open, setOpen] = React.useState(false);
  const [currentMolfile, setCurrentMolfile] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const dispatch = useDispatch();

  const { molecules } = useContext(ChartContext);

  const handleClose = useCallback(
    (e) => {
      setOpen(false);
      if (e === 'new') {
        setCurrentIndex(molecules.length);
      }
    },
    [molecules.length],
  );

  const handleOpen = useCallback((event, key, molfile) => {
    if (molfile) {
      setCurrentMolfile({ molfile, key });
    } else {
      setCurrentMolfile(null);
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
    <div css={panelContainerStyle}>
      <div css={toolbarStyle}>
        <ToolTip title="Paste Molecule" popupPlacement="left">
          <button className="bar-button" type="button" onClick={handlePast}>
            <FaPaste />
          </button>
        </ToolTip>
        <ToolTip title="Add Molecule" popupPlacement="left">
          <button className="bar-button" type="button" onClick={handleOpen}>
            <FaPlus />
          </button>
        </ToolTip>
        <ToolTip title="Delete Molecule" popupPlacement="left">
          <button className="bar-button" type="button" onClick={handleDelete}>
            <FaRegTrashAlt />
          </button>
        </ToolTip>
        <p>
          {molecules &&
            molecules.length > 0 &&
            `${+(currentIndex + 1)} / ${molecules.length}`}{' '}
        </p>
      </div>
      <div css={moleculeContainerStyle} ref={refContainer}>
        <Slider
          onSlideChange={(event) => setCurrentIndex(event.slideIndex)}
          slideIndex={currentIndex}
        >
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
          selectedMolecule={currentMolfile}
        />
      </div>
    </div>
  );
};

export default MoleculePanel;
