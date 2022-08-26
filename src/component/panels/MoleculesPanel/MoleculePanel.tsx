/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import OCL from 'openchemlib/full';
import {
  useState,
  useCallback,
  useEffect,
  memo,
  ReactElement,
  CSSProperties,
} from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import OCLnmr from 'react-ocl-nmr';

import {
  FloatingMolecules,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule';
import { Datum1D, Ranges } from '../../../data/types/data1d';
import { Datum2D, Zones } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import NextPrev from '../../elements/NextPrev';
import useSpectrum from '../../hooks/useSpectrum';
import { useMoleculeEditor } from '../../modal/MoleculeStructureEditorModal';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import { SET_MOLECULE } from '../../reducer/types/Types';

import MoleculeHeader from './MoleculeHeader';
import MoleculePanelHeader, {
  MoleculeHeaderActionsOptions,
} from './MoleculePanelHeader';
import useAtomAssignment from './useAtomAssignment';

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

interface MoleculePanelInnerProps extends MoleculePanelProps {
  zones: Zones;
  ranges: Ranges;
  molecules: Array<StateMoleculeExtended>;
  floatingMolecules: Array<FloatingMolecules>;
  activeTab: string;
  displayerMode: DISPLAYER_MODE;
}

function MoleculePanelInner({
  zones,
  ranges,
  molecules: moleculesProp,
  floatingMolecules,
  activeTab,
  displayerMode,
  onMoleculeChange,
  actionsOptions,
  children,
  emptyTextStyle,
}: MoleculePanelInnerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molecules, setMolecules] = useState<Array<StateMoleculeExtended>>([]);

  const dispatch = useDispatch();
  const openMoleculeEditor = useMoleculeEditor();

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
    (molecule, molfile) => {
      const { id, label } = molecule;
      dispatch({
        type: SET_MOLECULE,
        payload: { molfile, id, label },
      });
    },
    [dispatch],
  );

  const moleculeIndexHandler = useCallback((index) => {
    setCurrentIndex(index);
  }, []);

  return (
    <div css={styles.panel}>
      <MoleculePanelHeader
        currentIndex={currentIndex}
        floatingMolecules={floatingMolecules}
        molecules={molecules}
        onOpenMoleculeEditor={() => openMoleculeEditor()}
        onMoleculeIndexChange={moleculeIndexHandler}
        actionsOptions={actionsOptions}
      />
      <div css={styles.innerPanel}>
        <div css={styles.molecule}>
          <ResponsiveChart>
            {({ height, width }) => {
              return (
                <NextPrev
                  onChange={(slideIndex) => setCurrentIndex(slideIndex)}
                  defaultIndex={currentIndex}
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
                    ))
                  ) : (
                    <div
                      css={styles.slider}
                      style={{ height: '100%' }}
                      onClick={() => openMoleculeEditor()}
                    >
                      <span style={emptyTextStyle}>Click to draw molecule</span>
                    </div>
                  )}
                </NextPrev>
              );
            }}
          </ResponsiveChart>
        </div>
        {children}
      </div>
    </div>
  );
}

const MemoizedMoleculePanel = memo(MoleculePanelInner);
const emptyData = { ranges: {}, zones: {} };

interface MoleculePanelProps {
  onMoleculeChange?: (molecule: StateMoleculeExtended) => void;
  children?: ReactElement;
  actionsOptions?: MoleculeHeaderActionsOptions;
  emptyTextStyle?: CSSProperties;
}

export default function MoleculePanel({
  onMoleculeChange,
  children,
  actionsOptions,
  emptyTextStyle,
}: MoleculePanelProps) {
  const {
    molecules,
    view: { floatingMolecules },
    displayerMode,
    activeTab,
  } = useChartData();

  const data = useSpectrum(emptyData);
  const ranges: Ranges = (data as Datum1D)?.ranges || {};
  const zones: Zones = (data as Datum2D)?.zones || {};

  return (
    <MemoizedMoleculePanel
      {...{
        molecules,
        floatingMolecules,
        displayerMode,
        activeTab,
        ranges,
        zones,
        onMoleculeChange,
        actionsOptions,
        emptyTextStyle,
      }}
    >
      {children}
    </MemoizedMoleculePanel>
  );
}
