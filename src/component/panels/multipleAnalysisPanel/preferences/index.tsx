import { Formik } from 'formik';
import {
  AnalysisColumnsTypes,
  MultipleSpectraAnalysisPreferences as MultipleSpectraAnalysisPreferencesInterface,
} from 'nmr-load-save';
import { forwardRef, useImperativeHandle, useRef } from 'react';
import * as Yup from 'yup';

import { SpectraAnalysisData } from '../../../../data/data1d/multipleSpectraAnalysis';
import { usePreferences } from '../../../context/PreferencesContext';
import { GroupPane } from '../../../elements/GroupPane';
import Label from '../../../elements/Label';
import FormikCheckBox from '../../../elements/formik/FormikCheckBox';
import { usePanelPreferences } from '../../../hooks/usePanelPreferences';
import { PreferencesContainer } from '../../extra/preferences/PreferencesContainer';

import { AnalysisTablePreferences } from './AnalysisTablePreferences';
import LegendsPreferences from './LegendsPreferences';
import MultipleAnalysisCodeEditor from './MultipleAnalysisCodeEditor';

function getMultipleSpectraAnalysisData(
  preferences: MultipleSpectraAnalysisPreferencesInterface,
) {
  return Object.keys(preferences.analysisOptions.columns).map((key) => ({
    ...preferences.analysisOptions.columns[key],
    tempKey: key,
  }));
}

const preferencesSchema = Yup.object({
  analysisOptions: Yup.object({
    columns: Yup.lazy((data) => {
      return Yup.array().of(columnSchema(data));
    }),
  }),
  legendsFields: Yup.array().of(
    Yup.object({
      jpath: Yup.array().of(Yup.string()).min(1),
    }),
  ),
});

interface MultipleSpectraAnalysisPreferencesProps {
  data: SpectraAnalysisData;
  activeTab: string;
  onAfterSave: (flag: boolean) => void;
}

// TODO: remove this hacky use of ref.
function MultipleSpectraAnalysisPreferences(
  { data, activeTab, onAfterSave }: MultipleSpectraAnalysisPreferencesProps,
  ref: any,
) {
  const refForm = useRef<any>();
  const panelPreferences = usePanelPreferences(
    'multipleSpectraAnalysis',
    activeTab,
  );

  const preferences = usePreferences();
  const columns = getMultipleSpectraAnalysisData(panelPreferences);

  useImperativeHandle(ref, () => ({
    saveSetting() {
      refForm.current.submitForm();
    },
  }));

  function submitHandler(values) {
    onAfterSave?.(true);
    preferences.dispatch({
      type: 'SET_SPECTRA_ANALYSIS_PREFERENCES',
      payload: { data: values, nucleus: activeTab },
    });
  }

  return (
    <PreferencesContainer style={{ backgroundColor: 'white' }}>
      <Formik
        innerRef={refForm}
        initialValues={{
          ...panelPreferences,
          analysisOptions: { ...panelPreferences?.analysisOptions, columns },
        }}
        enableReinitialize
        validationSchema={preferencesSchema}
        onSubmit={submitHandler}
      >
        <>
          <GroupPane
            text="Legends"
            style={{
              header: { color: 'black' },
              container: { padding: '5px' },
            }}
          >
            <LegendsPreferences />
          </GroupPane>
          <GroupPane
            text="General"
            style={{
              header: { color: 'black' },
              container: { padding: '5px' },
            }}
          >
            <Label title="Enable resort spectra" htmlFor="resortSpectra">
              <FormikCheckBox name="resortSpectra" />
            </Label>
          </GroupPane>
          <GroupPane
            text="Columns Settings "
            style={{
              header: { color: 'black' },
              container: { padding: '5px' },
            }}
          >
            <AnalysisTablePreferences />
          </GroupPane>
          <GroupPane
            text="Execute code "
            style={{
              header: { color: 'black' },
              container: { padding: '5px' },
            }}
          >
            <MultipleAnalysisCodeEditor data={data} />
          </GroupPane>
        </>
      </Formik>
    </PreferencesContainer>
  );
}

function columnSchema(columns) {
  return Yup.object().shape({
    tempKey: Yup.string()
      .required()
      .test('unique', 'must be unique column name', function check(columnName) {
        const colsFrequency: Record<string, number[]> = {};
        let index = 0;
        for (const column of columns) {
          if (column.tempKey === columnName) {
            if (colsFrequency[column.tempKey]) {
              colsFrequency[column.tempKey].push(index);
            } else {
              colsFrequency[column.tempKey] = [index];
            }
          }
          index++;
        }

        const errors: Yup.ValidationError[] = [];
        for (const key in colsFrequency) {
          const indexes = colsFrequency[key];
          if (indexes.length > 1) {
            errors.push(
              new Yup.ValidationError(
                `${key} nucleus must te be unique`,
                key,
                // eslint-disable-next-line no-invalid-this
                this.path,
              ),
            );
          }
        }
        return new Yup.ValidationError(errors);
      }),
    formula: Yup.string().test(
      'required',
      'Pease enter formula field',
      function checkRequired() {
        const errors: Yup.ValidationError[] = [];
        for (const column of columns) {
          if (
            column?.type === AnalysisColumnsTypes.FORMULA &&
            (!column.formula || column.formula === '')
          ) {
            errors.push(
              new Yup.ValidationError(
                `${column.tempKey} formula value is required`,
                column.formula,
                // eslint-disable-next-line no-invalid-this
                this.path,
              ),
            );
          }
        }
        return new Yup.ValidationError(errors);
      },
    ),
    index: Yup.string().required(),
  });
}

export default forwardRef(MultipleSpectraAnalysisPreferences);
