/** @jsxImportSource @emotion/react */
import { css, SerializedStyles } from '@emotion/react';
import { Spectrum1D, Ranges, Spectrum2D, Zones } from 'nmr-load-save';
import OCL from 'openchemlib/full';
import {
  useState,
  useEffect,
  memo,
  ReactElement,
  CSSProperties,
  ReactNode,
} from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { StructureEditor } from 'react-ocl/full';
import OCLnmr from 'react-ocl-nmr';

import {
  MoleculesView,
  StateMoleculeExtended,
} from '../../../data/molecules/Molecule';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import NextPrev from '../../elements/NextPrev';
import useSpectrum from '../../hooks/useSpectrum';
import { useMoleculeEditor } from '../../modal/MoleculeStructureEditorModal';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';

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
  moleculesView: MoleculesView;
  activeTab: string;
  displayerMode: DISPLAYER_MODE;
}

function MoleculePanelInner(props: MoleculePanelInnerProps) {
  const {
    zones,
    ranges,
    molecules: moleculesProp,
    moleculesView,
    activeTab,
    displayerMode,
    onMoleculeChange,
    actionsOptions,
    children,
    emptyTextStyle,
    floatMoleculeOnSave = false,
    onClickPreferences,
    renderHeaderOptions,
  } = props;
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molecules, setMolecules] = useState<Array<StateMoleculeExtended>>([]);

  const dispatch = useDispatch();
  const openMoleculeEditor = useMoleculeEditor(floatMoleculeOnSave);

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

  function handleMoleculeStructureChange(molfile) {
    const molecule = molecules[currentIndex];
    onMoleculeChange?.({ ...molecule, molfile });
  }

  return (
    <div css={styles.panel}>
      <MoleculePanelHeader
        currentIndex={currentIndex}
        moleculesView={moleculesView}
        molecules={molecules}
        onOpenMoleculeEditor={() => openMoleculeEditor()}
        onMoleculeIndexChange={moleculeIndexHandler}
        actionsOptions={actionsOptions}
        onClickPreferences={onClickPreferences}
      >
        {renderHeaderOptions?.()}
      </MoleculePanelHeader>
      <div css={styles.innerPanel}>
        <div css={styles.molecule}>
          <ResponsiveChart>
            {({ height, width }) => {
              return (
                <NextPrev
                  onChange={(slideIndex) => setCurrentIndex(slideIndex)}
                  defaultIndex={currentIndex}
                  style={{
                    arrowContainer: {
                      ...(actionsOptions?.renderAs === 'StructureEditor' && {
                        top: '40px',
                        padding: '0 10px 0 55px',
                      }),
                    },
                  }}
                >
                  {molecules && molecules.length > 0 ? (
                    molecules.map((mol: StateMoleculeExtended, index) => (
                      <div key={mol.id} css={styles.items}>
                        <MoleculeHeader
                          currentMolecule={mol}
                          molecules={molecules}
                        />
                        {!actionsOptions ||
                        actionsOptions?.renderAs === 'OCLnmr' ? (
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
                              showAtomNumber={
                                moleculesView?.[mol.id]?.showAtomNumber || false
                              }
                            />
                          </div>
                        ) : (
                          <div css={styles.slider}>
                            <StructureEditor
                              width={width}
                              height={height}
                              initialMolfile={mol.molfile}
                              svgMenu
                              fragment={false}
                              onChange={handleMoleculeStructureChange}
                            />
                          </div>
                        )}
                      </div>
                    ))
                  ) : !actionsOptions ||
                    actionsOptions?.renderAs === 'OCLnmr' ? (
                    <div
                      css={styles.slider}
                      style={{ height: '100%' }}
                      onClick={() => openMoleculeEditor()}
                    >
                      <span style={emptyTextStyle}>Click to draw molecule</span>
                    </div>
                  ) : (
                    <StructureEditor
                      width={width}
                      height={height}
                      svgMenu
                      fragment={false}
                      onChange={handleMoleculeStructureChange}
                    />
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
  floatMoleculeOnSave?: boolean;
  onClickPreferences?: () => void;
  renderHeaderOptions?: () => ReactNode;
}

export default function MoleculePanel({
  onMoleculeChange,
  children,
  actionsOptions,
  emptyTextStyle,
  floatMoleculeOnSave = false,
  onClickPreferences,
  renderHeaderOptions,
}: MoleculePanelProps) {
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
        floatMoleculeOnSave,
        activeTab,
        ranges,
        zones,
        onMoleculeChange,
        actionsOptions,
        emptyTextStyle,
        onClickPreferences,
        renderHeaderOptions,
      }}
    >
      {children}
    </MemoizedMoleculePanel>
  );
}
