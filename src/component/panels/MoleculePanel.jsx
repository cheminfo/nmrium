/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import React, { useState, useCallback, useMemo, useEffect, memo } from 'react';
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

const MoleculePanel = memo(() => {
  const [refContainer, { width, height }] = useMeasure();
  const [open, setOpen] = React.useState(false);
  const [currentMolfile, setCurrentMolfile] = useState();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [onAtomHoverHighlights, setOnAtomHoverHighlights] = useState([]);
  const [onAtomHoverAction, setOnAtomHoverAction] = useState(null);

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

  const checkOnRangeLevel = useCallback((multiplicity) => {
    return multiplicity.split('').includes('m');
  }, []);

  const getPubIntegral = useCallback((range) => {
    return []
      .concat(
        range.diaID || [],
        range.signal
          ? range.signal.map((_signal) => _signal.diaID || []).flat()
          : [],
      )
      .filter((_diaID, i, _diaIDs) => _diaIDs.indexOf(_diaID) === i).length;
  }, []);

  const extractFromAtom = useCallback(
    (atom) => {
      return element && Object.keys(atom).length > 0
        ? element === atom.atomLabel // take always oclID if atom type is same as element of activeTab
          ? { oclIDs: [atom.oclID], nbAtoms: atom.nbAtoms }
          : element === 'H' // if we are in proton spectrum and use then the IDs of attached hydrogens of an atom
          ? { oclIDs: atom.hydrogenOCLIDs, nbAtoms: atom.nbHydrogens }
          : { oclIDs: [], nbAtoms: 0 }
        : { oclIDs: [], nbAtoms: 0 };
    },
    [element],
  );

  const getDiaIDsWithLevels = useCallback(
    (range) => {
      return range.signal
        ? range.signal
            .map((_signal, i) => {
              return range.diaID &&
                range.diaID.length > 0 &&
                checkOnRangeLevel(_signal.multiplicity)
                ? [{ level: 'range', diaID: range.diaID, signalIndex: i }]
                : _signal.diaID && _signal.diaID.length > 0
                ? [{ level: 'signal', diaID: _signal.diaID, signalIndex: i }]
                : [];
            })
            .flat()
        : [];
    },
    [checkOnRangeLevel],
  );

  const assignments = useMemo(() => {
    return rangesData.map((_range) => {
      return {
        rangeID: _range.id,
        diaIDs: getDiaIDsWithLevels(_range),
      };
    });
  }, [getDiaIDsWithLevels, rangesData]);

  const assignedDiaIDs = useMemo(() => {
    return assignments
      .map((_range) =>
        _range.diaIDs
          .map((_diaIDs) => (_diaIDs.diaID ? _diaIDs.diaID : []))
          .flat(),
      )
      .flat();
  }, [assignments]);

  const toggleAssignment = useCallback(
    (diaID, oclIDs) => {
      // 1. one atom can only be assigned to one range/signal
      // 2. check whether an atom is already assigned to a range to allow toggling the assignment
      if (
        assignedDiaIDs.some((_oclID) => oclIDs.includes(_oclID)) &&
        !diaID.some((_oclID) => oclIDs.includes(_oclID))
      ) {
        alert.info('Atom is already assigned to another signal!');
        return diaID;
      }
      const _diaID = diaID ? diaID.slice() : [];
      oclIDs.forEach((_oclID) => {
        if (_diaID.includes(_oclID)) {
          _diaID.splice(_diaID.indexOf(_oclID), 1);
        } else {
          _diaID.push(_oclID);
        }
      });

      return _diaID;
    },
    [alert, assignedDiaIDs],
  );

  const handleOnClickAtom = useCallback(
    (atom) => {
      if (
        highlightData.highlight.highlightedPermanently &&
        highlightData.highlight.highlightedPermanently.length > 0
      ) {
        const oclIDs = extractFromAtom(atom).oclIDs;

        if (oclIDs.length > 0) {
          // Detect range and signal index within permanent highlights (assignment mode)
          // via searching for the format "range.id" + "_" + "signalIndex".
          // Also, here, we expect that the permanent highlights contain only one signal,
          // if not the first is taken in this search.
          let range, split, signalIndex, id;
          let stop = false;
          for (let i = 0; i < rangesData.length; i++) {
            range = rangesData[i];
            for (
              let j = 0;
              j < highlightData.highlight.highlightedPermanently.length;
              j++
            ) {
              split = highlightData.highlight.highlightedPermanently[j].split(
                '_',
              );
              id = split[0];
              signalIndex = split[1];
              if (id === range.id && signalIndex !== undefined) {
                stop = true;
                break;
              }
            }
            if (stop) break;
          }

          if (
            range &&
            range.signal &&
            range.signal.length > 0 &&
            range.signal[signalIndex]
          ) {
            // determine the level of setting the diaID array (range vs. signal level) and save there
            const _range = { ...range };
            const signal = _range.signal[signalIndex];
            if (checkOnRangeLevel(signal.multiplicity)) {
              _range.diaID = toggleAssignment(_range.diaID, oclIDs);
            } else {
              _range.signal[signalIndex] = {
                ..._range.signal[signalIndex],
                diaID: toggleAssignment(
                  _range.signal[signalIndex].diaID || [],
                  oclIDs,
                ),
              };
            }
            _range.pubIntegral = getPubIntegral(_range);
            dispatch({ type: CHANGE_RANGE_DATA, data: _range });
          }
        } else {
          alert.info(
            'Not assigned! Different atom type or no attached hydrogens found!',
          );
        }
      }
    },
    [
      alert,
      checkOnRangeLevel,
      dispatch,
      extractFromAtom,
      getPubIntegral,
      highlightData.highlight.highlightedPermanently,
      rangesData,
      toggleAssignment,
    ],
  );

  const currentDiaIDsToHighlight = useMemo(() => {
    return highlightData.highlight.highlighted
      .map((_highlighted) => {
        let splitHighlight = _highlighted.split('_');
        if (splitHighlight.length !== 2) {
          return null;
        }
        return assignments
          .map((_range) => {
            if (_range.rangeID === splitHighlight[0]) {
              let _diaID = _range.diaIDs.find(
                (diaID) =>
                  `${_range.rangeID}_${diaID.signalIndex}` === _highlighted,
              );
              return _diaID ? _diaID.diaID : null;
            }
            return null;
          })
          .flat();
      })
      .flat()
      .filter((_highlighted) => _highlighted !== null);
  }, [assignments, highlightData.highlight.highlighted]);

  useEffect(() => {
    if (onAtomHoverAction) {
      if (onAtomHoverAction === 'show') {
        highlightData.dispatch({
          type: 'SHOW',
          payload: onAtomHoverHighlights,
        });
      } else if (onAtomHoverAction === 'hide') {
        highlightData.dispatch({
          type: 'HIDE',
          payload: onAtomHoverHighlights,
        });
        setOnAtomHoverHighlights([]);
      }
      setOnAtomHoverAction(null);
    }
  }, [onAtomHoverAction, onAtomHoverHighlights, highlightData]);

  const handleOnAtomHover = useCallback(
    (atom) => {
      const oclIDs = extractFromAtom(atom).oclIDs;
      // on enter the atom
      if (oclIDs.length > 0) {
        const filtered = assignments.find((_range) =>
          _range.diaIDs.some((_diaIDs) =>
            oclIDs.some((_oclID) => _diaIDs.diaID.includes(_oclID)),
          ),
        );
        const highlights = filtered
          ? [filtered.rangeID]
          : onAtomHoverHighlights.slice();

        if (highlights.length > 0) {
          if (filtered) {
            // The following is done to add a distinguishable highlight id
            // that a RangesTableRow knows to highlight the assigned atom
            // count label for a signal while hovering over an atom.
            const filteredSignal = filtered.diaIDs.find((_diaIDs) =>
              _diaIDs.diaID.some((_diaID) => oclIDs.includes(_diaID)),
            );
            highlights.push(
              `${filtered.rangeID}_${filteredSignal.signalIndex}`,
            );
          }
          setOnAtomHoverHighlights(highlights);
          setOnAtomHoverAction('show');
        }
      } else {
        // on leave the atom
        setOnAtomHoverAction('hide');
      }
    },
    [onAtomHoverHighlights, assignments, extractFromAtom],
  );

  const handleOnUnlinkAll = useCallback(() => {
    rangesData.forEach((range) => {
      const _range = {
        ...range,
        diaID: [],
        pubIntegral: 0,
        signal: range.signal.map((signal) => {
          return { ...signal, diaID: [] };
        }),
      };
      dispatch({ type: CHANGE_RANGE_DATA, data: _range });
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
                      currentDiaIDsToHighlight &&
                      currentDiaIDsToHighlight.length > 0
                        ? 'red'
                        : '#FFD700'
                    }
                    atomHighlightOpacity={0.35}
                    highlights={
                      currentDiaIDsToHighlight &&
                      currentDiaIDsToHighlight.length > 0
                        ? currentDiaIDsToHighlight
                        : assignedDiaIDs
                    }
                    setHoverAtom={handleOnAtomHover}
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
});

export default MoleculePanel;
