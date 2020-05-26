/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useCallback, useMemo } from 'react';
import { useAlert } from 'react-alert';
import Slider from 'react-animated-slider-2';
import {
  FaPlus,
  FaPaste,
  FaRegTrashAlt,
  FaFileExport,
  FaDownload,
  FaFileImage,
  FaCopy,
} from 'react-icons/fa';
import { MF } from 'react-mf';
import OCLnmr from 'react-ocl-nmr';
import 'react-animated-slider-2/build/horizontal.css';
import { useMeasure } from 'react-use';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import MenuButton from '../elements/MenuButton';
import ToolTip from '../elements/ToolTip/ToolTip';
import { useHighlightData } from '../highlight';
import MoleculeStructureEditorModal from '../modal/MoleculeStructureEditorModal';
import {
  ADD_MOLECULE,
  DELETE_MOLECULE,
  SET_MOLECULE,
  CHANGE_RANGE_DATA,
} from '../reducer/types/Types';
import {
  copyTextToClipboard,
  copyPNGToClipboard,
  exportAsSVG,
} from '../utility/Export';

const panelContainerStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;
`;

const toolbarStyle = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240, 240, 240);
  padding: 0px 5px;

  button svg {
    fill: #4e4e4e;
  }

  .bar-button {
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
  width: 100%;
  height: 100%;

  .slider {
    width: inherit;
    height: inherit;
    padding: 0px;

    .mol-svg-container {
      height: calc(100% - 25px);
      div {
        width: 100%;
        height: 100%;
      }
    }

    p {
      width: 100%;
      margin: 0 auto;
      display: block;
      position: relative;
    }

    svg polygon {
      fill: gray !important;
    }
  }
`;

const menuButton = css`
  background-color: transparent;
  border: none;
  border-bottom: 0.55px solid whitesmoke;
  height: 35px;
  outline: outline;
  display: flex;
  justify-content: flex-start;

  :focus {
    outline: none !important;
  }
  span {
    font-size: 10px;
    padding: 0px 10px;
  }
`;

const MoleculePanel = () => {
  const [refContainer, { width, height }] = useMeasure();
  const [open, setOpen] = React.useState(false);
  const [currentMolfile, setCurrentMolfile] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [currentAtomOnHover, setCurrentAtomOnHover] = useState(null);

  const dispatch = useDispatch();
  const alert = useAlert();

  const {
    data: spectrumData,
    activeSpectrum,
    molecules,
    activeTab,
  } = useChartData();

  const highlightData = useHighlightData();

  const rangesData = useMemo(() => {
    const _data =
      activeSpectrum && spectrumData
        ? spectrumData[activeSpectrum.index]
        : null;

    if (_data && _data.ranges && _data.ranges.values) {
      return _data.ranges.values;
    }
    return [];
  }, [activeSpectrum, spectrumData]);

  const element = useMemo(() => activeTab && activeTab.replace(/[0-9]/g, ''), [
    activeTab,
  ]);

  const getOclIDs = useCallback(
    (atom) => {
      return element && Object.keys(atom).length > 0
        ? element === atom.atomLabel // take always oclID if atom type is same as element of activeTab
          ? [atom.oclID]
          : element === 'H' // if we are in proton spectrum and use then the IDs of attached hydrogens of an atom
          ? atom.hydrogenOCLIDs
          : []
        : [];
    },
    [element],
  );

  const diaIDs = useMemo(() => {
    return rangesData.map((_range) => {
      return {
        rangeID: _range.id,
        diaID: [].concat(
          _range.diaID ? _range.diaID.flat() : [],
          _range.signal
            ? _range.signal.map((_signal) => _signal.diaID).flat()
            : [],
        ),
      };
    });
  }, [rangesData]);

  const assignedAtomHighlights = useMemo(() => {
    return diaIDs.map((diaID) => diaID.diaID).flat();
  }, [diaIDs]);

  const toggleAssignment = useCallback(
    (diaID, oclIDs) => {
      // 1. one atom can only be assigned to one range
      // 2. check whether an atom is already assigned to a range to allow toggling the assignment
      if (
        assignedAtomHighlights.some((_oclID) => oclIDs.includes(_oclID)) &&
        !diaID.some((_oclID) => oclIDs.includes(_oclID))
      ) {
        alert.info('Atom is already assigned to another range!');
        return diaID;
      }
      oclIDs.forEach((_oclID) => {
        if (diaID.includes(_oclID)) {
          diaID.splice(diaID.indexOf(_oclID), 1);
        } else {
          diaID.push(_oclID);
        }
      });

      return diaID;
    },
    [alert, assignedAtomHighlights],
  );

  const handleOnClickAtom = useCallback(
    (atom) => {
      if (
        highlightData.highlight.highlightedPermanently &&
        highlightData.highlight.highlightedPermanently.length > 0
      ) {
        const range = rangesData.find((_range) =>
          highlightData.highlight.highlightedPermanently.includes(_range.id),
        );
        const _oclIDs = getOclIDs(atom);

        if (_oclIDs.length > 0) {
          // determine the level of setting the diaID array (range vs. signal level) and save there
          let _range = { ...range };
          if (range.signal && range.signal.length > 0) {
            range.signal.forEach((signal, i) => {
              if (signal.multiplicity === 'm') {
                toggleAssignment(_range.diaID, _oclIDs);
              } else {
                _range.signal[i] = {
                  ..._range.signal[i],
                  diaID: toggleAssignment(_range.signal[i].diaID, _oclIDs),
                };
              }
            });
          }

          dispatch({ type: CHANGE_RANGE_DATA, data: _range });
        } else {
          alert.info(
            'Not assigned! Different atom type or no attached hydrogens found!',
          );
        }
      }
    },
    [
      alert,
      dispatch,
      getOclIDs,
      highlightData.highlight.highlightedPermanently,
      rangesData,
      toggleAssignment,
    ],
  );

  const currentRangeOnHover = useMemo(() => {
    return diaIDs.find((_range) =>
      _range.diaID.some((id) =>
        highlightData.highlight.highlighted.includes(id),
      ),
    );
  }, [diaIDs, highlightData.highlight.highlighted]);

  const handleOnHoverAtom = useCallback(
    (atom) => {
      const _oclIDs = getOclIDs(atom);
      const filtered =
        Object.keys(atom).length > 0
          ? diaIDs.find((_range) =>
              _range.diaID.some((id) => _oclIDs.includes(id)),
            )
          : null;
      const rangeID = filtered
        ? filtered.rangeID
        : currentAtomOnHover
        ? currentAtomOnHover.rangeID
        : null;

      if (rangeID) {
        if (Object.keys(atom).length > 0) {
          highlightData.dispatch({
            type: 'SHOW',
            payload: [rangeID],
          });
          setCurrentAtomOnHover({ ...atom, rangeID: rangeID });
        } else {
          highlightData.dispatch({
            type: 'HIDE',
            payload: [rangeID],
          });
          setCurrentAtomOnHover(null);
        }
      }
    },
    [currentAtomOnHover, diaIDs, getOclIDs, highlightData],
  );

  const handleOnUnlinkAll = useCallback(() => {
    rangesData.forEach((range) => {
      const _range = {
        ...range,
        diaID: [],
        signal: range.signal.map((signal) => {
          return { ...signal, diaID: [] };
        }),
      };
      dispatch({ type: 'CHANGE_RANGE_DATA', data: _range });
    });
  }, [dispatch, rangesData]);

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

  const handlePaste = useCallback(() => {
    navigator.clipboard.readText().then((molfile) => {
      dispatch({ type: ADD_MOLECULE, molfile });
    });
  }, [dispatch]);

  const handleDelete = useCallback(() => {
    if (molecules[currentIndex] && molecules[currentIndex].key) {
      setCurrentIndex(0);
      dispatch({ type: DELETE_MOLECULE, key: molecules[currentIndex].key });

      handleOnUnlinkAll();
    }
  }, [molecules, currentIndex, dispatch, handleOnUnlinkAll]);

  const saveAsSVGHandler = useCallback(() => {
    exportAsSVG('molFile', `molSVG${currentIndex}`);
  }, [currentIndex]);

  const saveAsPNGHandler = useCallback(() => {
    copyPNGToClipboard(`molSVG${currentIndex}`);
    alert.success('MOL copied as PNG to clipboard');
  }, [alert, currentIndex]);

  const saveAsMolHandler = useCallback(() => {
    if (molecules[currentIndex]) {
      const flag = copyTextToClipboard(molecules[currentIndex].molfile);
      if (flag) {
        alert.success('MOLFile copied to clipboard');
      } else {
        alert.error('copied not completed');
      }
    }
  }, [alert, currentIndex, molecules]);

  const handleReplaceMolecule = useCallback(
    (key, molfile) => {
      dispatch({ type: SET_MOLECULE, molfile, key });
    },
    [dispatch],
  );

  return (
    <div css={panelContainerStyle}>
      <div css={toolbarStyle}>
        <MenuButton
          className="bar-button"
          component={<FaFileExport />}
          toolTip="Export As"
        >
          <button type="button" css={menuButton} onClick={saveAsMolHandler}>
            <FaCopy />
            <span>Copy as molfile</span>
          </button>
          <button type="button" css={menuButton} onClick={saveAsPNGHandler}>
            <FaFileImage />
            <span>Copy as PNG</span>
          </button>
          <button type="button" css={menuButton} onClick={saveAsSVGHandler}>
            <FaDownload />
            <span>Export as SVG</span>
          </button>
        </MenuButton>

        <ToolTip title="Paste molfile" popupPlacement="left">
          <button className="bar-button" type="button" onClick={handlePaste}>
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
      <div css={moleculeContainerStyle}>
        <Slider
          onSlideChange={(event) => setCurrentIndex(event.slideIndex)}
          slideIndex={currentIndex}
        >
          {molecules && molecules.length > 0 ? (
            molecules.map((mol, index) => (
              <div
                key={mol.key}
                onDoubleClick={(event) =>
                  handleOpen(event, mol.key, mol.molfile)
                }
              >
                <div className="mol-svg-container" ref={refContainer}>
                  <OCLnmr
                    id={`molSVG${index}`}
                    width={width > 0 ? width : 100}
                    height={height > 0 ? height : 100}
                    molfile={mol.molfile}
                    setMolfile={(molfile) =>
                      handleReplaceMolecule(mol.key, molfile)
                    }
                    setSelectedAtom={handleOnClickAtom}
                    atomHighlightColor={
                      highlightData.highlight &&
                      highlightData.highlight.highlighted &&
                      highlightData.highlight.highlighted.length > 0 &&
                      currentRangeOnHover &&
                      highlightData.highlight.highlighted.includes(
                        currentRangeOnHover.rangeID,
                      )
                        ? 'red'
                        : '#FFD700'
                    }
                    atomHighlightOpacity={0.35}
                    highlights={
                      currentRangeOnHover
                        ? currentRangeOnHover.diaID
                        : highlightData &&
                          highlightData.highlight &&
                          highlightData.highlight.highlighted
                        ? assignedAtomHighlights.concat(
                            highlightData.highlight.highlighted,
                          )
                        : assignedAtomHighlights
                    }
                    setHoverAtom={handleOnHoverAtom}
                  />
                </div>
                <p>
                  <MF mf={mol.mf} /> - {mol.mw.toFixed(2)}
                </p>
              </div>
            ))
          ) : (
            <div
              style={{ width: '100%', height: '100%' }}
              onClick={handleOpen}
            />
          )}
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
