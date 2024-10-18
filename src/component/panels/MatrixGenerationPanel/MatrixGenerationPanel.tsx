/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { SvgNmrMultipleAnalysis } from 'cheminfo-font';
import { Filters } from 'nmr-processing';
import { useCallback, useEffect, useRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { Button, Toolbar } from 'react-science/ui';
import * as yup from 'yup';

import type { MatrixFilter } from '../../../data/matrixGeneration.js';
import { getMatrixFilters } from '../../../data/matrixGeneration.js';
import type { MatrixOptions } from '../../../data/types/data1d/MatrixOptions.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import type { GroupPaneStyle } from '../../elements/GroupPane.js';
import { GroupPane } from '../../elements/GroupPane.js';
import type { LabelStyle } from '../../elements/Label.js';
import Label from '../../elements/Label.js';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import useToolsFunctions from '../../hooks/useToolsFunctions.js';
import { getMatrixGenerationDefaultOptions } from '../../reducer/preferences/panelsPreferencesDefaultValues.js';
import { options } from '../../toolbar/ToolTypes.js';
import { tablePanelStyle } from '../extra/BasicPanelStyle.js';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer.js';

import { ExclusionsZonesTable } from './ExclusionsZonesTable.js';
import { FiltersOptions } from './FiltersOptions.js';
import { MatrixGenerationPanelHeader } from './MatrixGenerationPanelHeader.js';

const { signalProcessing } = Filters;

const StickyFooter = styled.div({
  position: 'sticky',
  padding: '5px',
  bottom: 0,
  width: '100%',
  backgroundColor: 'white',
  display: 'flex',
  flexDirection: 'row',
});

const schema = yup.object().shape({
  range: yup.object({
    from: yup.number().required(),
    to: yup.number().required(),
  }),
  numberOfPoints: yup.number().required(),
});

const labelStyle: LabelStyle = {
  label: { width: '120px' },
  wrapper: { flex: 1, display: 'flex', flexDirection: 'row' },
};

export const DEFAULT_MATRIX_FILTERS: MatrixFilter[] = getMatrixFilters();

const DEFAULT_MATRIX_OPTIONS = getMatrixGenerationDefaultOptions();

function getMatrixOptions(
  options: Partial<MatrixOptions>,
  range: { from: number; to: number },
): MatrixOptions {
  return {
    ...DEFAULT_MATRIX_OPTIONS.matrixOptions,
    range,
    ...options,
  } as MatrixOptions;
}

export const GroupPanelStyle: GroupPaneStyle = {
  container: { padding: '10px' },
  header: { color: 'black', fontWeight: 'bolder' },
};

export function useHasSignalProcessingFilter() {
  const spectra = useSpectraByActiveNucleus();

  if (!spectra) return null;

  for (const spectrum of spectra) {
    for (const filter of spectrum.filters || []) {
      if (filter.name === signalProcessing.id) {
        return filter.value;
      }
    }
  }

  return null;
}

export function MatrixGenerationPanel() {
  const {
    originDomain: { xDomain },
  } = useChartData();

  if (xDomain[0] === undefined || xDomain[1] === undefined) {
    return null;
  }
  return <InnerMatrixGenerationPanel />;
}
function InnerMatrixGenerationPanel() {
  const dispatch = useDispatch();
  const { dispatch: dispatchPreferences } = usePreferences();
  const {
    view: {
      spectra: { activeTab },
    },
    xDomain,
    originDomain,
  } = useChartData();
  const nucleusMatrixOptions = usePanelPreferences(
    'matrixGeneration',
    activeTab,
  );

  const matrixOptions = getMatrixOptions(nucleusMatrixOptions.matrixOptions, {
    from: originDomain.xDomain[0],
    to: originDomain.xDomain[1],
  });

  function handleSave(options) {
    dispatch({ type: 'APPLY_SIGNAL_PROCESSING_FILTER', payload: { options } });
  }

  const handleOnChange = useCallback(
    (options) => {
      dispatchPreferences({
        type: 'SET_MATRIX_GENERATION_OPTIONS',
        payload: { options, nucleus: activeTab },
      });
    },
    [activeTab, dispatchPreferences],
  );

  function handleAddFilter() {
    const filters = matrixOptions.filters.slice();
    filters.push(DEFAULT_MATRIX_FILTERS[0]);
    handleOnChange({ ...matrixOptions, filters });
  }

  function handleRemoveProcessing() {
    dispatch({
      type: 'DELETE_SPECTRA_FILTER',
      payload: { filterName: signalProcessing.id },
    });
  }

  function handleUseCurrentRange() {
    handleOnChange({
      ...matrixOptions,
      range: { from: xDomain[0], to: xDomain[1] },
    });
  }

  const { showStocsy, showBoxPlot } =
    nucleusMatrixOptions || DEFAULT_MATRIX_OPTIONS;

  const methods = useForm({
    defaultValues: matrixOptions,
    resolver: yupResolver(schema),
  });
  const { handleSubmit, reset, control, watch } = methods;
  const isDirtyRef = useRef<boolean>(true);

  useEffect(() => {
    const { unsubscribe } = watch((options) => {
      if (isDirtyRef.current) {
        handleOnChange(options);
      }
      isDirtyRef.current = true;
    });
    return () => unsubscribe();
  }, [handleOnChange, watch]);

  useEffect(() => {
    isDirtyRef.current = false;
    reset(nucleusMatrixOptions.matrixOptions);
  }, [nucleusMatrixOptions.matrixOptions, reset]);

  return (
    <div css={tablePanelStyle}>
      <MatrixGenerationPanelHeader
        showStocsy={showStocsy}
        showBoxPlot={showBoxPlot}
      />
      <FormProvider {...methods}>
        <div className="inner-container" style={{ position: 'relative' }}>
          <PreferencesContainer
            style={{ backgroundColor: 'white', padding: 0 }}
          >
            <GroupPane
              text="Filters"
              style={GroupPanelStyle}
              renderHeader={(text) => (
                <FiltersPanelGroupHeader text={text} onAdd={handleAddFilter} />
              )}
            >
              <FiltersOptions />
            </GroupPane>

            <GroupPane
              style={GroupPanelStyle}
              text="Exclusions zones"
              renderHeader={(text) => (
                <CustomGroupHeader text={text}>
                  <ExclusionZonesGroupHeaderContent />
                </CustomGroupHeader>
              )}
            >
              <ExclusionsZonesTable />
            </GroupPane>
            <GroupPane
              text="More options"
              style={GroupPanelStyle}
              renderHeader={(text) => (
                <CustomGroupHeader text={text}>
                  <Toolbar>
                    <Toolbar.Item
                      tooltip={'Use current range'}
                      onClick={handleUseCurrentRange}
                      icon={<SvgNmrMultipleAnalysis />}
                    />
                  </Toolbar>
                </CustomGroupHeader>
              )}
            >
              <Label title="Range" style={labelStyle}>
                <Label title="From">
                  <NumberInput2Controller
                    control={control}
                    name="range.from"
                    fill
                  />
                </Label>
                <Label
                  title="To"
                  style={{ container: { paddingLeft: '10px' } }}
                >
                  <NumberInput2Controller
                    control={control}
                    name="range.to"
                    fill
                  />
                </Label>
              </Label>
              <Label
                title="Number of points"
                style={{
                  ...labelStyle,
                  wrapper: {},
                  container: { paddingTop: '10px' },
                }}
              >
                <NumberInput2Controller
                  control={control}
                  name="numberOfPoints"
                />
              </Label>
            </GroupPane>
            <FooterActionsButtons
              matrixOptions={matrixOptions}
              onClickApply={() => handleSubmit(handleSave)()}
              onClickRemove={handleRemoveProcessing}
            />
          </PreferencesContainer>
        </div>
      </FormProvider>
    </div>
  );
}

function FiltersPanelGroupHeader({ text, onAdd }) {
  return (
    <div
      className="section-header"
      style={{ display: 'flex', padding: '5px 0px' }}
    >
      <p style={{ flex: 1, ...GroupPanelStyle.header }}>{text}</p>
      <Button intent="success" outlined small onClick={onAdd}>
        Add Filter
      </Button>
    </div>
  );
}

function CustomGroupHeader({ text, children }) {
  return (
    <div
      className="section-header"
      style={{ display: 'flex', padding: '5px 0px' }}
    >
      <p style={{ flex: 1, ...GroupPanelStyle.header }}>{text}</p>
      {children}
    </div>
  );
}

function ExclusionZonesGroupHeaderContent() {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const { handleChangeOption } = useToolsFunctions();

  function handleToggleExclusionZoneTool() {
    if (selectedTool !== options.matrixGenerationExclusionZones.id) {
      handleChangeOption(options.matrixGenerationExclusionZones.id);
    } else {
      handleChangeOption(options.zoom.id);
    }
  }

  return (
    <Toolbar>
      <Toolbar.Item
        tooltip="Select exclusions zones"
        onClick={handleToggleExclusionZoneTool}
        icon={<SvgNmrMultipleAnalysis />}
        active={selectedTool === options.matrixGenerationExclusionZones.id}
      />
    </Toolbar>
  );
}

interface FooterActionsButtonsProps {
  onClickApply: () => void;
  onClickRemove: () => void;
  matrixOptions: MatrixOptions;
}

function FooterActionsButtons(props: FooterActionsButtonsProps) {
  const { matrixOptions, onClickApply, onClickRemove } = props;
  const signalProcessingFilterData = useHasSignalProcessingFilter();

  return (
    <StickyFooter>
      <Button
        intent="success"
        onClick={onClickApply}
        tooltipProps={{ disabled: true, content: '' }}
        disabled={
          signalProcessingFilterData &&
          JSON.stringify(signalProcessingFilterData) ===
            JSON.stringify(matrixOptions)
        }
      >
        {signalProcessingFilterData ? 'Update processing' : 'Apply processing'}
      </Button>
      {signalProcessingFilterData && (
        <div style={{ paddingLeft: '5px' }}>
          <Button
            intent="danger"
            onClick={onClickRemove}
            tooltipProps={{ disabled: true, content: '' }}
          >
            Remove processing
          </Button>
        </div>
      )}
    </StickyFooter>
  );
}
