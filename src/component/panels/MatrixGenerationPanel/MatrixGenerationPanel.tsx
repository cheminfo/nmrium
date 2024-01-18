/** @jsxImportSource @emotion/react */
import { SvgNmrExportAsMatrix, SvgNmrMultipleAnalysis } from 'cheminfo-font';
import { Formik, FormikProps } from 'formik';
import { useRef } from 'react';
import * as yup from 'yup';

import { getMatrixFilters, MatrixFilter } from '../../../data/matrixGeneration';
import { MatrixOptions } from '../../../data/types/data1d/MatrixOptions';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import StyledButton from '../../elements/Button';
import Button from '../../elements/ButtonToolTip';
import { GroupPane, GroupPaneStyle } from '../../elements/GroupPane';
import { InputStyle } from '../../elements/Input';
import Label, { LabelStyle } from '../../elements/Label';
import SaveButton from '../../elements/SaveButton';
import ToggleButton from '../../elements/ToggleButton';
import FormikInput from '../../elements/formik/FormikInput';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useToolsFunctions from '../../hooks/useToolsFunctions';
import { options } from '../../toolbar/ToolTypes';
import { exportAsMatrix } from '../../utility/export';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import { ExclusionsZonesTable } from './ExclusionsZonesTable';
import { FiltersOptions } from './FiltersOptions';

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
  input: { padding: '0.2em 0.1em', width: '100%' },
};

export const DEFAULT_MATRIX_FILTERS: MatrixFilter[] = getMatrixFilters();

const DEFAULT_MATRIX_OPTIONS: Omit<MatrixOptions, 'range'> = {
  filters: [],
  exclusionsZones: [],
  numberOfPoints: 1024,
};

function getMatrixOptions(
  options: Partial<MatrixOptions>,
  range: { from: number; to: number },
): MatrixOptions {
  return { ...DEFAULT_MATRIX_OPTIONS, range, ...options };
}

export const GroupPanelStyle: GroupPaneStyle = {
  container: { padding: '10px' },
  header: { color: 'black', fontWeight: 'bolder' },
};

function MatrixGenerationPanel() {
  const dispatch = useDispatch();
  const preferences = usePreferences();
  const {
    view: {
      spectra: { activeTab },
    },
    xDomain,
    data,
  } = useChartData();

  const formRef = useRef<FormikProps<any>>(null);
  const nucleusMatrixOptions = usePanelPreferences(
    'matrixGeneration',
    activeTab,
  );
  const spectraPreferences = usePanelPreferences('spectra', activeTab);

  const matrixOptions = getMatrixOptions(nucleusMatrixOptions, {
    from: xDomain[0],
    to: xDomain[1],
  });

  function handleExportAsMatrix() {
    exportAsMatrix(data, spectraPreferences?.columns || [], 'Spectra Matrix');
  }

  function handleSave(options) {
    dispatch({ type: 'APPLY_SIGNAL_PROCESSING_FILTER', payload: { options } });
  }

  function handleOnChange(options) {
    preferences.dispatch({
      type: 'SET_MATRIX_GENERATION_OPTIONS',
      payload: { options, nucleus: activeTab },
    });
  }

  function handleAddFilter() {
    const filters = matrixOptions.filters.slice();
    filters.push(DEFAULT_MATRIX_FILTERS[0]);
    handleOnChange({ ...matrixOptions, filters });
  }

  if (xDomain[0] === undefined || xDomain[1] === undefined) {
    return null;
  }

  return (
    <div css={tablePanelStyle}>
      {
        <DefaultPanelHeader
          canDelete={false}
          renderRightButtons={() => (
            <SaveButton
              onClick={() => formRef.current?.submitForm()}
              popupTitle="Signal processing"
            />
          )}
        >
          <Button
            popupTitle="Export spectra as a matrix"
            onClick={handleExportAsMatrix}
            style={{ fontSize: '12px', padding: '5px' }}
          >
            <SvgNmrExportAsMatrix />
          </Button>
        </DefaultPanelHeader>
      }

      <div className="inner-container">
        <PreferencesContainer style={{ backgroundColor: 'white' }}>
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
                  <ExclusionZonesGroupHeader text={text} />
                )}
              >
                <ExclusionsZonesTable />
              </GroupPane>
              <GroupPane text="More options" style={GroupPanelStyle}>
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
function ExclusionZonesGroupHeader({ text }) {
  const {
    toolOptions: { selectedTool },
  } = useChartData();
  const { handleChangeOption } = useToolsFunctions();

  return (
    <div
      className="section-header"
      style={{ display: 'flex', padding: '5px 0px' }}
    >
      <p style={{ flex: 1, ...GroupPanelStyle.header }}>{text}</p>
      <ToggleButton
        key={selectedTool}
        defaultValue={
          selectedTool === options.matrixGenerationExclusionZones.id
        }
        popupTitle="Select exclusions zones"
        popupPlacement="left"
        onClick={() =>
          handleChangeOption(options.matrixGenerationExclusionZones.id)
        }
      >
        <SvgNmrMultipleAnalysis
          style={{
            pointerEvents: 'none',
            fontSize: '12px',
          }}
        />
      </ToggleButton>
    </div>
  );
}

export default MatrixGenerationPanel;
