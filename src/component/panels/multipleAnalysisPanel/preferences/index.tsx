import { yupResolver } from '@hookform/resolvers/yup';
import {
  AnalysisColumnsTypes,
  MultipleSpectraAnalysisPreferences as MultipleSpectraAnalysisPreferencesInterface,
} from 'nmr-load-save';
import { forwardRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { SpectraAnalysisData } from '../../../../data/data1d/multipleSpectraAnalysis';
import { usePreferences } from '../../../context/PreferencesContext';
import { CheckController } from '../../../elements/CheckController';
import { GroupPane } from '../../../elements/GroupPane';
import Label from '../../../elements/Label';
import useCheckExperimentalFeature from '../../../hooks/useCheckExperimentalFeature';
import { usePanelPreferences } from '../../../hooks/usePanelPreferences';
import { checkUniqueByKey } from '../../../utility/checkUniqueByKey';
import { PreferencesContainer } from '../../extra/preferences/PreferencesContainer';
import { useSettingImperativeHandle } from '../../extra/utilities/settingImperativeHandle';

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
      return Yup.array()
        .of(columnSchema(data))
        .test('Unique', 'must be unique column name', function check(nuclei) {
          // eslint-disable-next-line no-invalid-this
          return checkUniqueByKey(nuclei, 'tempKey', this);
        });
    }),
    resortSpectra: Yup.boolean(),
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

function MultipleSpectraAnalysisPreferences(
  { data, activeTab, onAfterSave }: MultipleSpectraAnalysisPreferencesProps,
  ref: any,
) {
  const panelPreferences = usePanelPreferences(
    'multipleSpectraAnalysis',
    activeTab,
  );

  const preferences = usePreferences();
  const columns = getMultipleSpectraAnalysisData(panelPreferences);
  const isExperimental = useCheckExperimentalFeature();

  function saveHandler(values) {
    onAfterSave?.(true);
    preferences.dispatch({
      type: 'SET_SPECTRA_ANALYSIS_PREFERENCES',
      payload: { data: values, nucleus: activeTab },
    });
  }

  const methods = useForm({
    defaultValues: {
      ...panelPreferences,
      analysisOptions: { ...panelPreferences?.analysisOptions, columns },
    },
    resolver: yupResolver(preferencesSchema),
  });

  const { handleSubmit, control } = methods;

  useSettingImperativeHandle(ref, handleSubmit, saveHandler);

  return (
    <FormProvider {...methods}>
      <PreferencesContainer style={{ backgroundColor: 'white' }}>
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
          <Label title="Sort spectra when sorting columns">
            <CheckController
              control={control}
              name="analysisOptions.resortSpectra"
            />
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
        {isExperimental && (
          <GroupPane
            text="Execute code "
            style={{
              header: { color: 'black' },
              container: { padding: '5px' },
            }}
          >
            <MultipleAnalysisCodeEditor data={data} />
          </GroupPane>
        )}
      </PreferencesContainer>
    </FormProvider>
  );
}

function columnSchema(columns) {
  return Yup.object().shape({
    tempKey: Yup.string().required(),
    formula: Yup.string().test(
      'required',
      'Please enter formula field',
      function checkRequired() {
        const errors: Yup.ValidationError[] = [];
        for (let index = 0; index < columns.length; index++) {
          const column = columns[index];
          if (
            column?.type === AnalysisColumnsTypes.FORMULA &&
            (!column.formula || column.formula === '')
          ) {
            errors.push(
              // eslint-disable-next-line no-invalid-this
              this.createError({
                message: `${column.tempKey} formula value is required`,
                // eslint-disable-next-line no-invalid-this
                path: `${this.path}[${index}].formula`,
              }),
            );
          }
        }

        if (errors.length > 0) {
          return new Yup.ValidationError(errors);
        }

        return true;
      },
    ),
    index: Yup.number().required(),
  });
}

export default forwardRef(MultipleSpectraAnalysisPreferences);
