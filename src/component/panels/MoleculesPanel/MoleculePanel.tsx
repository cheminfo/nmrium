/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import OCL from 'openchemlib/full';
import { useState, useCallback, useEffect, memo } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { MF } from 'react-mf';
import OCLnmr from 'react-ocl-nmr';

import { Molecule } from '../../../data/molecules/Molecule';
import { Datum1D, Ranges } from '../../../data/types/data1d';
import { Datum2D, Zones } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import NextPrev from '../../elements/NextPrev';
import { positions, useModal } from '../../elements/popup/Modal';
import useSpectrum from '../../hooks/useSpectrum';
import MoleculeStructureEditorModal from '../../modal/MoleculeStructureEditorModal';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import { SET_MOLECULE } from '../../reducer/types/Types';

import MoleculePanelHeader from './MoleculePanelHeader';
import useAtomAssignment from './useAtomAssignment';

const styles = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  width: 100%;
  height: 100%;

  .mol-svg-container {
    max-height: 100%;
    flex: 1;
  }

  .molecule-container {
    flex-direction: column;
    display: flex;
    flex: 1 1 0%;

    max-height: 100%;

    .slider {
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      height: 100%;
      padding: 0px;
      .mol-svg-container {
        width: 100%;
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
        text-align: center;
      }

      svg polygon {
        fill: gray !important;
      }
    }
  }
`;

const toolbarStyle = css`
  display: flex;
  flex-direction: row;
  border-bottom: 0.55px solid rgb(240, 240, 240);
  padding: 0px 5px;

  p {
    margin: 0;
    text-align: right;
    width: 100%;
    line-height: 22px;
    padding: 0px 10px;
  }
`;

interface MoleculePanelInnerProps {
  zones: Zones;
  ranges: Ranges;
  molecules: Array<Molecule>;
  activeTab: string;
  displayerMode: DISPLAYER_MODE;
}

function MoleculePanelInner({
  zones,
  ranges,
  molecules: moleculesProp,
  activeTab,
  displayerMode,
}: MoleculePanelInnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molecules, setMolecules] = useState<any>([]);

  const dispatch = useDispatch();
  const modal = useModal();

  const {
    currentDiaIDsToHighlight,
    handleOnAtomHover,
    handleOnClickAtom,
    assignedDiaIDsMerged,
  } = useAtomAssignment({ zones, ranges, activeTab, displayerMode });

  useEffect(() => {
    if (moleculesProp) {
      setMolecules((prevMolecules) => {
        if (moleculesProp.length > prevMolecules.length) {
          setCurrentIndex(molecules.length);
        }
        return moleculesProp;
      });
    }
  }, [molecules.length, moleculesProp]);

  const handleReplaceMolecule = useCallback(
    (key, molfile) => {
      dispatch({ type: SET_MOLECULE, molfile, key });
    },
    [dispatch],
  );

  const openMoleculeEditorHandler = useCallback(
    (moleclue = null) => {
      modal.show(<MoleculeStructureEditorModal selectedMolecule={moleclue} />, {
        position: positions.TOP_CENTER,
        width: 700,
        height: 500,
      });
    },
    [modal],
  );

  const moleculeIndexHandler = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div css={styles}>
      <div className="molecule-container">
        <MoleculePanelHeader
          currentIndex={currentIndex}
          molecules={molecules}
          onOpenMoleculeEditor={() => openMoleculeEditorHandler()}
          onMoleculeIndexChange={moleculeIndexHandler}
        />
        <ResponsiveChart>
          {({ height, width }) => {
            return (
              <NextPrev
                onChange={(slideIndex) => setCurrentIndex(slideIndex)}
                defaultIndex={currentIndex}
              >
                {molecules && molecules.length > 0 ? (
                  molecules.map((mol: Molecule, index) => (
                    <>
                      <div css={toolbarStyle}>
                        <p>
                          <MF mf={mol.mf} /> - {mol.mw?.toFixed(2)}
                        </p>
                      </div>
                      <div
                        className="slider"
                        key={mol.key}
                        onDoubleClick={() => openMoleculeEditorHandler(mol)}
                        style={{
                          backgroundColor:
                            (index + 1) % 2 !== 0 ? '#fafafa' : 'white',
                        }}
                      >
                        <div className="mol-svg-container">
                          <OCLnmr
                            OCL={OCL}
                            id={`molSVG${index}`}
                            width={width}
                            height={height}
                            molfile={mol.molfile || ''}
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
                                : assignedDiaIDsMerged
                            }
                            setHoverAtom={handleOnAtomHover}
                          />
                        </div>
                      </div>
                    </>
                  ))
                ) : (
                  <div
                    style={{ width: '100%', height: '100%' }}
                    onClick={() => openMoleculeEditorHandler()}
                  />
                )}
              </NextPrev>
            );
          }}
        </ResponsiveChart>
      </div>
    </div>
  );
}

const MemoizedMoleculePanel = memo(MoleculePanelInner);
const emptyData = { ranges: {}, zones: {} };

export default function MoleculePanel() {
  const { molecules, displayerMode, activeTab } = useChartData();

  const data = useSpectrum(emptyData);
  const ranges: Ranges = (data as Datum1D)?.ranges || {};
  const zones: Zones = (data as Datum2D)?.zones || {};

  return (
    <MemoizedMoleculePanel
      {...{
        molecules,
        displayerMode,
        activeTab,
        ranges,
        zones,
      }}
    />
  );
}
