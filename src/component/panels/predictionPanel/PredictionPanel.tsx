import styled from '@emotion/styled';
import { Molecule } from 'openchemlib';
import { Fragment, useEffect, useRef, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import type { CanvasEditorOnChangeMolecule } from 'react-ocl';
import { CanvasMoleculeEditor } from 'react-ocl';
import { useAccordionControls } from 'react-science/ui';

import { predictSpectra } from '../../../data/PredictionManager.js';
import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useLogger } from '../../context/LoggerContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import Button from '../../elements/Button.js';
import { NextPrev } from '../../elements/NextPrev.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { useMoleculeEditor } from '../../modal/MoleculeStructureEditorModal.js';
import MoleculeHeader from '../MoleculesPanel/MoleculeHeader.js';
import MoleculePanelHeader from '../MoleculesPanel/MoleculePanelHeader.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import PredictionPreferences from './PredictionPreferences.js';
import PredictionSimpleOptions from './PredictionSimpleOptions.js';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  flex: 1;
  min-height: 0;
`;

const Overflow = styled.div<{ height: number }>`
  overflow: hidden auto;
  height: ${({ height }) => height}px;
`;

const StickyFooter = styled.div`
  flex-shrink: 0;
  padding: 5px;
  display: flex;
  justify-content: flex-end;
  background-color: #fff;
  border-top: 1px solid #ccc;
  z-index: 2;
`;
const Content = styled.div`
  flex: 1;
`;

export default function PredictionPanel() {
  const {
    molecules,
    view: { molecules: moleculesView, predictions },
  } = useChartData();
  const dispatch = useDispatch();
  const toaster = useToaster();
  const { logger } = useLogger();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [molfile, setMolfile] = useState<string | null>(null);
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<SettingsRef | null>(null);
  const { open: openAccordionPanel } = useAccordionControls();
  const predictionPreferences = usePanelPreferences('prediction');
  const { modal, openMoleculeEditor } = useMoleculeEditor(true);
  const refreshSlider = useRef<boolean>(false);

  const [initialMolfile] = useState(molfile ?? '');

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

  function changeHandler(event: CanvasEditorOnChangeMolecule) {
    const molfile = event.getMolfileV3();
    const molecule = Molecule.fromMolfile(molfile);
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

        const hideLoading = toaster.showLoading({
          message: `Predict ${predictedSpectra.join(',')} in progress`,
        });

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
          openAccordionPanel('spectraPanel');
        } catch (error: any) {
          toaster.show({ message: error.message, intent: 'danger' });
        } finally {
          hideLoading();
        }
      } else {
        toaster.show({ message: 'No Molecule selected', intent: 'danger' });
      }
    })();
  }

  function settingsPanelHandler() {
    setFlipStatus(!isFlipped);
  }

  async function saveSettingHandler() {
    const isSettingValid = await settingRef.current?.saveSetting();
    if (isSettingValid) {
      setFlipStatus(false);
    }
  }

  const isPredictedBefore = !!(
    molecules[currentIndex]?.id && predictions[molecules[currentIndex].id]
  );

  return (
    <TablePanel isFlipped={isFlipped}>
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

          <Container>
            <Content>
              <ResponsiveChart>
                {({ height, width }) => {
                  return (
                    <NextPrev
                      onChange={(slideIndex) => {
                        setCurrentIndex(slideIndex);
                        setMolfile(molecules[slideIndex].molfile);
                      }}
                      index={currentIndex}
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
                            <Fragment key={mol.id}>
                              <MoleculeHeader
                                currentMolecule={mol}
                                molecules={molecules}
                              />

                              {molIndex === currentIndex && (
                                <Overflow height={height}>
                                  <CanvasMoleculeEditor
                                    width={width}
                                    inputFormat="molfile"
                                    inputValue={mol.molfile}
                                    fragment={false}
                                    onChange={changeHandler}
                                    height={400}
                                  />
                                </Overflow>
                              )}
                            </Fragment>
                          ),
                        )
                      ) : (
                        <Overflow height={height}>
                          <CanvasMoleculeEditor
                            inputFormat="molfile"
                            inputValue={initialMolfile}
                            width={width}
                            fragment={false}
                            onChange={changeHandler}
                            height={400}
                          />
                        </Overflow>
                      )}
                    </NextPrev>
                  );
                }}
              </ResponsiveChart>
            </Content>

            <StickyFooter>
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
            </StickyFooter>
          </Container>
        </>
      )}
      {modal}
    </TablePanel>
  );
}
