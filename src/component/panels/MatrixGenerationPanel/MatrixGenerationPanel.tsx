/** @jsxImportSource @emotion/react */
import { SvgNmrAddFilter, SvgNmrExportAsMatrix } from 'cheminfo-font';
import { Formik, FormikProps } from 'formik';
import { useCallback, useState, useRef, useEffect } from 'react';
import * as yup from 'yup';

import {
  MatrixFilters,
  getDefaultMatrixFilters,
} from '../../../data/getDefaultMatrixFilters';
import { MatrixOptions } from '../../../data/types/view-state/MatrixViewState';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import StyledButton from '../../elements/Button';
import Button from '../../elements/ButtonToolTip';
import { GroupPane, GroupPaneStyle } from '../../elements/GroupPane';
import { InputStyle } from '../../elements/Input';
import Label, { LabelStyle } from '../../elements/Label';
import SaveButton from '../../elements/SaveButton';
import FormikInput from '../../elements/formik/FormikInput';
import { positions, useModal } from '../../elements/popup/Modal';
import ExportAsMatrixModal from '../../modal/ExportAsMatrixModal';
import MultipleSpectraFiltersModal from '../../modal/MultipleSpectraFiltersModal';
import {
  APPLY_SIGNAL_PROCESSING_FILTER,
  RESET_SELECTED_TOOL,
} from '../../reducer/types/Types';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import { ExclusionsZonesTable } from './ExclusionsZonesTable';
import { FiltersTable } from './FiltersTable';

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

export const DEFAULT_MATRIX_FILTERS: MatrixFilters = getDefaultMatrixFilters();

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

const GroupPanelStyle: GroupPaneStyle = {
  container: { padding: '10px' },
  header: { color: 'black', fontWeight: 'bolder' },
};

function MatrixGenerationPanel() {
  const modal = useModal();
  const dispatch = useDispatch();
  const {
    view: {
      matrixGeneration,
      spectra: { activeTab },
    },
    xDomain,
  } = useChartData();

  const formRef = useRef<FormikProps<any>>(null);

  const [matrixOptions, setMatrixGeneration] = useState(
    getMatrixOptions(matrixGeneration[activeTab], {
      from: xDomain[0],
      to: xDomain[1],
    }),
  );

  useEffect(() => {
    setMatrixGeneration(matrixGeneration[activeTab]);
  }, [activeTab, matrixGeneration, setMatrixGeneration]);

  const openFiltersModal = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<MultipleSpectraFiltersModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 550,
      height: 250,
    });
  }, [modal, dispatch]);

  const openExportAsMatrixModal = useCallback(() => {
    dispatch({ type: RESET_SELECTED_TOOL });
    modal.show(<ExportAsMatrixModal />, {
      isBackgroundBlur: false,
      position: positions.TOP_CENTER,
      width: 500,
    });
  }, [modal, dispatch]);

  function handleSave(options) {
    dispatch({ type: APPLY_SIGNAL_PROCESSING_FILTER, payload: { options } });
  }

  function handleAddFilter() {
    setMatrixGeneration((prevMatrixOptions) => {
      const filters = prevMatrixOptions.filters.slice();
      filters.push(DEFAULT_MATRIX_FILTERS[0]);
      return { ...prevMatrixOptions, filters };
    });
  }

  if (!xDomain[0] || !xDomain[1] || !matrixOptions) {
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
              popupTitle="Signal Processing"
            />
          )}
        >
          <Button popupTitle="Add Filter" onClick={openFiltersModal}>
            <SvgNmrAddFilter style={{ fontSize: '18px' }} />
          </Button>
          <Button
            popupTitle="Export spectra as a Matrix"
            onClick={openExportAsMatrixModal}
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
                <FiltersTable />
              </GroupPane>
              <GroupPane text="Exclusions zones" style={GroupPanelStyle}>
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

export default MatrixGenerationPanel;
