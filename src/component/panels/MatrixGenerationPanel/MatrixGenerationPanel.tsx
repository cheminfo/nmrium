/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { SvgNmrExportAsMatrix, SvgNmrMultipleAnalysis } from 'cheminfo-font';
import { Formik, FormikProps } from 'formik';
import { Filters } from 'nmr-processing';
import { useRef } from 'react';
import { IoAnalytics } from 'react-icons/io5';
import { TbBrandGoogleAnalytics } from 'react-icons/tb';
import { Button, Toolbar, TooltipHelpContent } from 'react-science/ui';
import * as yup from 'yup';

import { getMatrixFilters, MatrixFilter } from '../../../data/matrixGeneration';
import { MatrixOptions } from '../../../data/types/data1d/MatrixOptions';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import StyledButton from '../../elements/Button';
import { GroupPane, GroupPaneStyle } from '../../elements/GroupPane';
import { InputStyle } from '../../elements/Input';
import Label, { LabelStyle } from '../../elements/Label';
import FormikInput from '../../elements/formik/FormikInput';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import { useToggleSpectraVisibility } from '../../hooks/useToggleSpectraVisibility';
import useToolsFunctions from '../../hooks/useToolsFunctions';
import { getMatrixGenerationDefaultOptions } from '../../reducer/preferences/panelsPreferencesDefaultValues';
import { options } from '../../toolbar/ToolTypes';
import { booleanToString } from '../../utility/booleanToString';
import { exportAsMatrix } from '../../utility/export';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import { ExclusionsZonesTable } from './ExclusionsZonesTable';
import { FiltersOptions } from './FiltersOptions';

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
const inputStyle: InputStyle = {
  input: { padding: '0.4em 0.1em', width: '100%' },
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
    data,
  } = useChartData();
  const { getToggleVisibilityButtons } = useToggleSpectraVisibility();
  const formRef = useRef<FormikProps<any>>(null);
  const nucleusMatrixOptions = usePanelPreferences(
    'matrixGeneration',
    activeTab,
  );
  const spectraPreferences = usePanelPreferences('spectra', activeTab);

  const matrixOptions = getMatrixOptions(nucleusMatrixOptions.matrixOptions, {
    from: originDomain.xDomain[0],
    to: originDomain.xDomain[1],
  });
  function handleExportAsMatrix() {
    exportAsMatrix(data, spectraPreferences?.columns || [], 'Spectra Matrix');
  }
  function handleToggleStocsy() {
    dispatchPreferences({
      type: 'TOGGLE_MATRIX_GENERATION_VIEW_PROPERTY',
      payload: { key: 'showStocsy', nucleus: activeTab },
    });
  }
  function handleToggleBoxplot() {
    dispatchPreferences({
      type: 'TOGGLE_MATRIX_GENERATION_VIEW_PROPERTY',
      payload: { key: 'showBoxPlot', nucleus: activeTab },
    });
  }

  function handleSave(options) {
    dispatch({ type: 'APPLY_SIGNAL_PROCESSING_FILTER', payload: { options } });
  }

  function handleOnChange(options) {
    dispatchPreferences({
      type: 'SET_MATRIX_GENERATION_OPTIONS',
      payload: { options, nucleus: activeTab },
    });
  }

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

  const signalProcessingFilterData = useHasSignalProcessingFilter();

  const { showStocsy, showBoxPlot } =
    nucleusMatrixOptions || DEFAULT_MATRIX_OPTIONS;

  return (
    <div css={tablePanelStyle}>
      <DefaultPanelHeader
        leftButtons={[
          {
            disabled: !signalProcessingFilterData,
            icon: <SvgNmrExportAsMatrix />,
            tooltip: (
              <TooltipHelpContent
                title="Export spectra as a matrix"
                description="Export the matrix as a tab-delimited file. The first row contains meta information labels followed by the chemical shifts. Next rows contains the meta information and the intensities of the spectra."
              />
            ),
            onClick: handleExportAsMatrix,
          },
          ...getToggleVisibilityButtons(),
          {
            disabled: !signalProcessingFilterData,
            icon: <IoAnalytics />,
            tooltip: (
              <TooltipHelpContent
                title={`${booleanToString(!showStocsy)} STOCSY`}
                subTitles={[
                  { title: 'Vertical zoom', shortcuts: ['⌥', 'Scroll wheel'] },
                  { title: 'STOCSY pivot', shortcuts: ['⇧', 'click'] },
                ]}
                description="Statistical Total Correlation Spectroscopy (STOCSY) is a method to identify correlations between signals."
                link="https://doi.org/10.1021/ac048630x"
              />
            ),
            onClick: handleToggleStocsy,
            active: showStocsy,
          },
          {
            disabled: !signalProcessingFilterData,
            icon: <TbBrandGoogleAnalytics />,
            tooltip: (
              <TooltipHelpContent
                title={`${booleanToString(!showBoxPlot)} box plot`}
                subTitles={[
                  { title: 'Vertical zoom', shortcuts: ['⌥', 'Scroll wheel'] },
                ]}
                description="Display box plot like information. Light grey for min/max, dark grey for 1st/3rd quartile, and black for median."
              />
            ),
            onClick: handleToggleBoxplot,
            active: showBoxPlot,
          },
        ]}
      />

      <div className="inner-container" style={{ position: 'relative' }}>
        <PreferencesContainer style={{ backgroundColor: 'white', padding: 0 }}>
          <Formik
            innerRef={formRef}
            onSubmit={handleSave}
            initialValues={matrixOptions}
            enableReinitialize
            validationSchema={schema}
          >
            <>
              <GroupPane
                text="Filters"
                style={GroupPanelStyle}
                renderHeader={(text) => (
                  <FiltersPanelGroupHeader
                    text={text}
                    onAdd={handleAddFilter}
                  />
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
                    <FormikInput
                      name="range.from"
                      type="number"
                      style={inputStyle}
                    />
                  </Label>
                  <Label
                    title="To"
                    style={{ container: { paddingLeft: '10px' } }}
                  >
                    <FormikInput
                      name="range.to"
                      type="number"
                      style={inputStyle}
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
                  <FormikInput
                    name="numberOfPoints"
                    type="number"
                    style={inputStyle}
                  />
                </Label>
              </GroupPane>

              <FormikOnChange onChange={handleOnChange} />
            </>
          </Formik>
          <StickyFooter>
            <Button
              intent="success"
              onClick={() => formRef.current?.submitForm()}
              tooltipProps={{ disabled: true, content: '' }}
              disabled={
                signalProcessingFilterData &&
                JSON.stringify(signalProcessingFilterData) ===
                  JSON.stringify(matrixOptions)
              }
            >
              {signalProcessingFilterData
                ? 'Update processing'
                : 'Apply processing'}
            </Button>
            {signalProcessingFilterData && (
              <div style={{ paddingLeft: '5px' }}>
                <Button
                  intent="danger"
                  onClick={handleRemoveProcessing}
                  tooltipProps={{ disabled: true, content: '' }}
                >
                  Remove processing
                </Button>
              </div>
            )}
          </StickyFooter>
        </PreferencesContainer>
      </div>
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
      <StyledButton.Done fill="outline" size="xSmall" onClick={onAdd}>
        Add Filter
      </StyledButton.Done>
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

  return (
    <Toolbar>
      <Toolbar.Item
        tooltip="Select exclusions zones"
        onClick={() =>
          handleChangeOption(options.matrixGenerationExclusionZones.id)
        }
        icon={<SvgNmrMultipleAnalysis />}
        active={selectedTool === options.matrixGenerationExclusionZones.id}
      />
    </Toolbar>
  );
}
