/** @jsxImportSource @emotion/react */
import OCL from 'openchemlib/full';
import { CSSProperties, useEffect, useRef, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { StructureEditor } from 'react-ocl/full';
import { useAccordionContext } from 'react-science/ui';

import { predictSpectra } from '../../../data/PredictionManager';
import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useLogger } from '../../context/LoggerContext';
import Button from '../../elements/Button';
import NextPrev from '../../elements/NextPrev';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { useMoleculeEditor } from '../../modal/MoleculeStructureEditorModal';
import MoleculeHeader from '../MoleculesPanel/MoleculeHeader';
import MoleculePanelHeader from '../MoleculesPanel/MoleculePanelHeader';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import PreferencesHeader from '../header/PreferencesHeader';

import PredictionPreferences from './PredictionPreferences';
import PredictionSimpleOptions from './PredictionSimpleOptions';

const styles: Record<'flexColumnContainer' | 'slider', CSSProperties> = {
  flexColumnContainer: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  slider: {
    overflow: 'hidden auto',
  },
};

export default function PredictionPanel() {
  const {
    molecules,
    view: { molecules: moleculesView, predictions },
  } = useChartData();
  const dispatch = useDispatch();
  const alert = useAlert();
  const { logger } = useLogger();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molfile, setMolfile] = useState<string | null>(null);
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();
  const {
    item: spectraPanelState,
    utils: { toggle: openSpectraPanel },
  } = useAccordionContext('Spectra');
  const predictionPreferences = usePanelPreferences('prediction');
  const { modal, openMoleculeEditor } = useMoleculeEditor(true);
  const refreshSlider = useRef<boolean>(false);

  useEffect(() => {
    if (
      Array.isArray(molecules) &&
      molecules.length > 0 &&
      refreshSlider.current
    ) {
      const newIndex = molecules.length - 1;
      setCurrentIndex(newIndex);
      setMolfile(molecules[newIndex].molfile);
      refreshSlider.current = false;
    }
  }, [molecules]);

  function changeHandler(molfile, molecule: OCL.Molecule) {
    const atoms = molecule.getAllAtoms();
    if (atoms === 0) {
      setMolfile(null);
    } else {
      setMolfile(molfile);
    }
  }

  function predictHandler(action: 'add' | 'save') {
    refreshSlider.current = action === 'add';
    void (async () => {
      if (molfile) {
        const predictedSpectra: string[] = [];
        for (const [key, value] of Object.entries(
          predictionPreferences.spectra,
        )) {
          if (value) {
            predictedSpectra.push(key);
          }
        }

        const hideLoading = await alert.showLoading(
          `Predict ${predictedSpectra.join(',')} in progress`,
        );

        try {
          const data = await predictSpectra(
            molfile,
            predictionPreferences.spectra,
          );
          dispatch({
            type: 'PREDICT_SPECTRA',
            payload: {
              logger,
              predictedSpectra: data.spectra,
              options: predictionPreferences,
              molecule: { ...molecules[currentIndex], molfile },
              action,
            },
          });
          if (!spectraPanelState?.isOpen) {
            openSpectraPanel();
          }
        } catch (error: any) {
          alert.error(error.message);
        } finally {
          hideLoading();
        }
      } else {
        alert.error('No Molecule selected');
      }
    })();
  }

  function settingsPanelHandler() {
    setFlipStatus(!isFlipped);
  }

  function saveSettingHandler() {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }

  const isPredictedBefore = !!(
    molecules[currentIndex]?.id && predictions[molecules[currentIndex].id]
  );

  return (
    <div css={tablePanelStyle}>
      {isFlipped && (
        <>
          <PreferencesHeader
            onSave={saveSettingHandler}
            onClose={settingsPanelHandler}
          />
          <div className="inner-container">
            <PredictionPreferences ref={settingRef} />
          </div>
        </>
      )}
      {!isFlipped && (
        <>
          <MoleculePanelHeader
            currentIndex={currentIndex}
            moleculesView={moleculesView}
            molecules={molecules}
            renderSource="predictionPanel"
            onClickPreferences={settingsPanelHandler}
            onOpenMoleculeEditor={() => openMoleculeEditor()}
            onClickPastMolecule={() => {
              refreshSlider.current = true;
            }}
          >
            <PredictionSimpleOptions />
          </MoleculePanelHeader>

          <div style={styles.flexColumnContainer}>
            <div style={{ flex: 1 }}>
              <ResponsiveChart>
                {({ height, width }) => {
                  return (
                    <NextPrev
                      onChange={(slideIndex) => {
                        setCurrentIndex(slideIndex);
                        setMolfile(molecules[slideIndex].molfile);
                      }}
                      defaultIndex={currentIndex}
                      style={{
                        arrowContainer: {
                          top: '40px',
                          padding: '0 10px 0 55px',
                        },
                      }}
                    >
                      {molecules && molecules.length > 0 ? (
                        molecules.map(
                          (mol: StateMoleculeExtended, molIndex) => (
                            <div
                              key={mol.id}
                              style={styles.flexColumnContainer}
                            >
                              <MoleculeHeader
                                currentMolecule={mol}
                                molecules={molecules}
                              />
                              <div
                                style={{
                                  ...styles.slider,
                                  height: height - 31,
                                }}
                              >
                                {molIndex === currentIndex && (
                                  <StructureEditor
                                    width={width}
                                    initialMolfile={mol.molfile}
                                    svgMenu
                                    fragment={false}
                                    onChange={changeHandler}
                                  />
                                )}
                              </div>
                            </div>
                          ),
                        )
                      ) : (
                        <StructureEditor
                          initialMolfile={molfile || ''}
                          width={width}
                          height={height}
                          svgMenu
                          fragment={false}
                          onChange={changeHandler}
                        />
                      )}
                    </NextPrev>
                  );
                }}
              </ResponsiveChart>
            </div>
            <div style={{ display: 'flex', padding: '5px' }}>
              <Button.Done
                onClick={() => predictHandler('save')}
                disabled={!molfile}
              >
                {isPredictedBefore ? 'Replace prediction' : 'Predict spectra'}
              </Button.Done>
              {isPredictedBefore && (
                <Button.Action
                  style={{ marginLeft: '5px' }}
                  onClick={() => predictHandler('add')}
                >
                  Add prediction
                </Button.Action>
              )}
            </div>
          </div>
        </>
      )}
      {modal}
    </div>
  );
}
