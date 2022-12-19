/** @jsxImportSource @emotion/react */
import { SvgNmrAddFilter, SvgNmrExportAsMatrix } from 'cheminfo-font';
import { Formik } from 'formik';
import { useCallback } from 'react';
import * as yup from 'yup';

import {
  MatrixFilters,
  getDefaultMatrixFilters,
} from '../../../data/getDefaultMatrixFilters';
import { MatrixOptions } from '../../../data/types/view-state/MatrixViewState';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/ButtonToolTip';
import { GroupPane, GroupPaneStyle } from '../../elements/GroupPane';
import { InputStyle } from '../../elements/Input';
import Label, { LabelStyle } from '../../elements/Label';
import FormikInput from '../../elements/formik/FormikInput';
import FormikOnChange from '../../elements/formik/FormikOnChange';
import { positions, useModal } from '../../elements/popup/Modal';
import ExportAsMatrixModal from '../../modal/ExportAsMatrixModal';
import MultipleSpectraFiltersModal from '../../modal/MultipleSpectraFiltersModal';
import { RESET_SELECTED_TOOL } from '../../reducer/types/Types';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import { ExclusionsZonesTable } from './ExclusionsZonesTable';
import { FiltersTable } from './FiltersTable';

const schema = yup.object().shape({
  filters: yup.array().min(1),
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
  filters: [DEFAULT_MATRIX_FILTERS[0]],
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

  const matrixOptions = getMatrixOptions(matrixGeneration[activeTab], {
    from: xDomain[0],
    to: xDomain[1],
  });

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

  // eslint-disable-next-line unicorn/consistent-function-scoping
  function handleSave(values) {
    // eslint-disable-next-line no-console
    console.log(values);
  }

  const handleDataChange = useCallback((data) => {
    // eslint-disable-next-line no-console
    console.log(data);
  }, []);

  if (!xDomain[0] || !xDomain[1]) {
    return null;
  }

  return (
    <div css={tablePanelStyle}>
      {
        <DefaultPanelHeader canDelete={false}>
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
            onSubmit={handleSave}
            initialValues={matrixOptions}
            enableReinitialize
            validationSchema={schema}
          >
            <>
              <GroupPane text="Filters" style={GroupPanelStyle}>
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
              <FormikOnChange debounceTime={250} onChange={handleDataChange} />
            </>
          </Formik>
        </PreferencesContainer>
      </div>
    </div>
  );
}

export default MatrixGenerationPanel;
