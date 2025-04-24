/** @jsxImportSource @emotion/react */
import type { SerializedStyles } from '@emotion/react';
import { css } from '@emotion/react';
import type { Ranges, Zones } from 'nmr-processing';
import type { Spectrum1D, Spectrum2D } from 'nmrium-core';
import OCL from 'openchemlib/full';
import { memo, useEffect, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import OCLnmr from 'react-ocl-nmr';

import type {
  MoleculesView,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { NextPrev } from '../../elements/NextPrev.js';
import { useHighlightColor } from '../../hooks/useHighlightColor.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { useMoleculeEditor } from '../../modal/MoleculeStructureEditorModal.js';
import type { DisplayerMode } from '../../reducer/Reducer.js';

import MoleculeHeader from './MoleculeHeader.js';
import MoleculePanelHeader from './MoleculePanelHeader.js';
import useAtomAssignment from './useAtomAssignment.js';

const styles: Record<
  'panel' | 'innerPanel' | 'molecule' | 'slider' | 'items',
  SerializedStyles
> = {
  panel: css({
    display: 'flex',
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  }),
  innerPanel: css({
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
  }),
  molecule: css({
    flex: 1,
    minHeight: '100px',
  }),
  slider: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flex: 1,
  }),
  items: css({
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  }),
};

interface MoleculePanelInnerProps {
  zones: Zones;
  ranges: Ranges;
  molecules: StateMoleculeExtended[];
  moleculesView: MoleculesView;
  activeTab: string;
  displayerMode: DisplayerMode;
}

function MoleculePanelInner(props: MoleculePanelInnerProps) {
  const {
    zones,
    ranges,
    molecules: moleculesProp,
    moleculesView,
    activeTab,
    displayerMode,
  } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molecules, setMolecules] = useState<StateMoleculeExtended[]>([]);

  const dispatch = useDispatch();
  const { modal, openMoleculeEditor } = useMoleculeEditor();
  const highlightColor = useHighlightColor();

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

  function handleReplaceMolecule(molecule, molfile) {
    const { id, label } = molecule;
    dispatch({
      type: 'SET_MOLECULE',
      payload: { molfile, id, label },
    });
  }

  function moleculeIndexHandler(index) {
    setCurrentIndex(index);
  }

  const lastIndex = molecules?.length > 0 ? molecules.length - 1 : 0;
  const activeIndex = Math.min(currentIndex, lastIndex);

  return (
    <div css={styles.panel}>
      <MoleculePanelHeader
        currentIndex={activeIndex}
        moleculesView={moleculesView}
        molecules={molecules}
        onOpenMoleculeEditor={() => openMoleculeEditor()}
        onMoleculeIndexChange={moleculeIndexHandler}
      />

      <div css={styles.innerPanel}>
        <div css={styles.molecule}>
          <ResponsiveChart>
            {({ height, width }) => {
              return (
                <NextPrev
                  onChange={(slideIndex) => setCurrentIndex(slideIndex)}
                  index={currentIndex}
                >
                  {molecules && molecules.length > 0 ? (
                    molecules.map((mol: StateMoleculeExtended, index) => (
                      <div key={mol.id} css={styles.items}>
                        <MoleculeHeader
                          currentMolecule={mol}
                          molecules={molecules}
                        />

                        <div
                          css={styles.slider}
                          className="mol-svg-container"
                          onDoubleClick={() => openMoleculeEditor(mol)}
                          style={{
                            backgroundColor:
                              (index + 1) % 2 !== 0 ? '#fafafa' : 'white',
                          }}
                        >
                          <OCLnmr
                            OCL={OCL}
                            id={`molSVG${index}`}
                            width={width}
                            height={height - 60}
                            molfile={mol.molfile || ''}
                            setMolfile={(molfile) =>
                              handleReplaceMolecule(mol, molfile)
                            }
                            setSelectedAtom={handleOnClickAtom}
                            atomHighlightColor={
                              currentDiaIDsToHighlight &&
                              currentDiaIDsToHighlight.length > 0
                                ? '#ff000080'
                                : highlightColor
                            }
                            atomHighlightOpacity={1}
                            highlights={
                              currentDiaIDsToHighlight &&
                              currentDiaIDsToHighlight.length > 0
                                ? currentDiaIDsToHighlight
                                : assignedDiaIDsMerged
                            }
                            setHoverAtom={handleOnAtomHover}
                            showAtomNumber={
                              moleculesView?.[mol.id]?.showAtomNumber || false
                            }
                          />
                        </div>
                      </div>
                    ))
                  ) : (
                    <div
                      css={styles.slider}
                      style={{ height: '100%' }}
                      onClick={() => openMoleculeEditor()}
                    >
                      <span>Click to draw molecule</span>
                    </div>
                  )}
                </NextPrev>
              );
            }}
          </ResponsiveChart>
        </div>
      </div>
      {modal}
    </div>
  );
}

const MemoizedMoleculePanel = memo(MoleculePanelInner);
const emptyData = { ranges: {}, zones: {} };

export default function MoleculePanel() {
  const {
    molecules,
    view: {
      molecules: moleculesView,
      spectra: { activeTab },
    },
    displayerMode,
  } = useChartData();

  const data = useSpectrum(emptyData);
  const ranges: Ranges = (data as Spectrum1D)?.ranges || {};
  const zones: Zones = (data as Spectrum2D)?.zones || {};

  return (
    <MemoizedMoleculePanel
      {...{
        molecules,
        moleculesView,
        displayerMode,
        activeTab,
        ranges,
        zones,
      }}
    />
  );
}
