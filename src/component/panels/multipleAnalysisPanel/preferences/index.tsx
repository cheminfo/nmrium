import { yupResolver } from '@hookform/resolvers/yup';
import type { MultipleSpectraAnalysisPreferences as MultipleSpectraAnalysisPreferencesInterface } from 'nmr-load-save';
import { ANALYSIS_COLUMN_TYPES } from 'nmr-load-save';
import { forwardRef } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';

import type { SpectraAnalysisData } from '../../../../data/data1d/multipleSpectraAnalysis.js';
import { usePreferences } from '../../../context/PreferencesContext.js';
import { CheckController } from '../../../elements/CheckController.js';
import { GroupPane } from '../../../elements/GroupPane.js';
import Label from '../../../elements/Label.js';
import useCheckExperimentalFeature from '../../../hooks/useCheckExperimentalFeature.js';
import { usePanelPreferences } from '../../../hooks/usePanelPreferences.js';
import { checkUniqueByKey } from '../../../utility/checkUniqueByKey.js';
import { PreferencesContainer } from '../../extra/preferences/PreferencesContainer.js';
import { useSettingImperativeHandle } from '../../extra/utilities/settingImperativeHandle.js';

import { AnalysisTablePreferences } from './AnalysisTablePreferences.js';
import LegendsPreferences from './LegendsPreferences.js';
import MultipleAnalysisCodeEditor from './MultipleAnalysisCodeEditor.js';

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
  legendsFields: Yup.array()
    .of(
      Yup.object({
        jpath: Yup.array().of(Yup.string()).min(1),
      }),
    )
    .required(),
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
            column?.type === ANALYSIS_COLUMN_TYPES.FORMULA &&
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
