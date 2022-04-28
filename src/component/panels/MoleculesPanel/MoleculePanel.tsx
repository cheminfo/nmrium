/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import OCL from 'openchemlib/full';
import { useState, useCallback, useEffect, memo, ReactElement } from 'react';
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

import MoleculePanelHeader, {
  MoleculeHeaderActionsOptions,
} from './MoleculePanelHeader';
import useAtomAssignment from './useAtomAssignment';

const styles: Record<
  'panel' | 'innerPanel' | 'molecule' | 'toolbar' | 'slider' | 'items',
  SerializedStyles
> = {
  panel: css({
    display: 'flex',
    overflow: 'auto',
    flexGrow: 1,
    width: '100%',
    height: '100%',
    flexDirection: 'column',
  }),
  innerPanel: css({
    display: 'flex',
    flex: '1',
    flexDirection: 'column',
    overflow: 'auto',
  }),
  molecule: css({
    display: 'flex',
    flex: '1',
  }),
  toolbar: css({
    display: 'flex',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
    padding: '0px 10px',
    justifyContent: 'end',
    height: 22,
  }),
  slider: css({
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    flexGrow: 1,
    minHeight: 0,
  }),
  items: css({
    display: 'flex',
    flexDirection: 'column',
    flex: '1 1 0%',
    height: '100%',
    minHeight: 0,
  }),
};

interface MoleculePanelInnerProps extends MoleculePanelProps {
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
  onMoleculeChange,
  actionsOptions,
  children,
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

  useEffect(() => {
    onMoleculeChange?.(molecules[currentIndex] || null);
  }, [currentIndex, molecules, onMoleculeChange]);

  const handleReplaceMolecule = useCallback(
    (key, molfile) => {
      dispatch({ type: SET_MOLECULE, molfile, key });
    },
    [dispatch],
  );

  const openMoleculeEditorHandler = useCallback(
    (molecule?: Molecule) => {
      modal.show(<MoleculeStructureEditorModal selectedMolecule={molecule} />, {
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
    <div css={styles.panel}>
      <MoleculePanelHeader
        currentIndex={currentIndex}
        molecules={molecules}
        onOpenMoleculeEditor={() => openMoleculeEditorHandler()}
        onMoleculeIndexChange={moleculeIndexHandler}
        actionsOptions={actionsOptions}
      />
      <div css={styles.innerPanel}>
        <div css={styles.molecule}>
          <NextPrev
            onChange={(slideIndex) => setCurrentIndex(slideIndex)}
            defaultIndex={currentIndex}
          >
            {molecules && molecules.length > 0 ? (
              molecules.map((mol: Molecule, index) => (
                <div key={mol.key} css={styles.items}>
                  <span css={styles.toolbar}>
                    <MF mf={mol.mf} /> - {mol.mw?.toFixed(2)}
                  </span>
                  <div
                    css={styles.slider}
                    className="mol-svg-container"
                    onDoubleClick={() => openMoleculeEditorHandler(mol)}
                    style={{
                      backgroundColor:
                        (index + 1) % 2 !== 0 ? '#fafafa' : 'white',
                    }}
                  >
                    <ResponsiveChart>
                      {({ height, width }) => {
                        return (
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
                        );
                      }}
                    </ResponsiveChart>
                  </div>
                </div>
              ))
            ) : (
              <div
                css={styles.slider}
                style={{ height: '100%' }}
                onClick={() => openMoleculeEditorHandler()}
              >
                <span>Click to draw molecule</span>
              </div>
            )}
          </NextPrev>
        </div>
        {children}
      </div>
    </div>
  );
}

const MemoizedMoleculePanel = memo(MoleculePanelInner);
const emptyData = { ranges: {}, zones: {} };

interface MoleculePanelProps {
  onMoleculeChange?: (molecule: Molecule) => void;
  children?: ReactElement;
  actionsOptions?: MoleculeHeaderActionsOptions;
}

export default function MoleculePanel({
  onMoleculeChange,
  children,
  actionsOptions,
}: MoleculePanelProps) {
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
        onMoleculeChange,
        actionsOptions,
      }}
    >
      {children}
    </MemoizedMoleculePanel>
  );
}
