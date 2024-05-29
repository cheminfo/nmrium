import { yupResolver } from '@hookform/resolvers/yup';
import { PanelsPreferences, Workspace } from 'nmr-load-save';
import {
  useImperativeHandle,
  memo,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import { GroupPane, GroupPaneStyle } from '../../elements/GroupPane';
import { Scroller } from '../../elements/Scroller';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { getSpectraObjectPaths } from '../../utility/getSpectraObjectPaths';
import { NucleusGroup } from '../extra/preferences/NucleusGroup';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

import { SpectraColumnsManager } from './base/SpectraColumnsManager';

function replaceNucleusKeys(
  data: PanelsPreferences['spectra'],
  searchValue: string,
  replaceValue: string,
) {
  const nuclei = {};

  for (const key in data.nuclei) {
    nuclei[key.replace(searchValue, replaceValue)] = data.nuclei[key];
  }
  return { ...data, nuclei };
}

const groupPaneStyle: GroupPaneStyle = {
  header: {
    color: 'black',
    fontSize: '12px',
    padding: '5px',
    backgroundColor: '#f8f8f8',
  },
  container: {
    paddingBottom: '10px',
  },
};

function validationColumns(obj) {
  const validationObject = {};
  for (const key of Object.keys(obj.nuclei)) {
    validationObject[key] = Yup.object({
      columns: Yup.array().of(
        Yup.object().shape(
          {
            jpath: Yup.array().when('jpath', {
              is: (jpath) => {
                return jpath !== undefined;
              },
              // eslint-disable-next-line unicorn/no-thenable
              then: () => Yup.array().of(Yup.string()).required().min(1),
            }),
          },
          [['jpath', 'jpath']],
        ),
      ),
    });
  }
  return validationObject;
}

const spectraPreferencesValidation: any = Yup.lazy(
  (obj: Workspace['panels']['spectra']) =>
    Yup.object().shape({
      nuclei: Yup.object().shape(validationColumns(obj)),
    }),
);

function SpectraPreferences(props, ref: any) {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const preferences = usePreferences();
  const nuclei = useNucleus();

  const preferencesByNuclei = usePanelPreferencesByNuclei('spectra', nuclei);
  const methods = useForm({
    defaultValues: replaceNucleusKeys(preferencesByNuclei, ',', '_'),
    resolver: yupResolver(spectraPreferencesValidation),
  });
  const {
    handleSubmit,
    getValues,
    reset,
    formState: { isValid },
  } = methods;
  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: 'SET_PANELS_PREFERENCES',
        payload: {
          key: 'spectra',
          value: replaceNucleusKeys(values, '_', ','),
        },
      });
      return true;
    },
    [preferences],
  );

  useImperativeHandle(
    ref,
    () => ({
      saveSetting: () => {
        void handleSubmit(saveHandler)();
        return isValid;
      },
    }),
    [handleSubmit, isValid, saveHandler],
  );

  const handleAdd = useCallback(
    (nucleus, index) => {
      const data: PanelsPreferences['spectra'] = getValues();
      let columns = data.nuclei[nucleus]?.columns || [];

      columns = [
        ...columns.slice(0, index),
        {
          jpath: [],
          label: '',
          visible: true,
        },
        ...columns.slice(index),
      ];

      reset({
        ...data,
        nuclei: {
          ...data.nuclei,
          [nucleus]: {
            ...data[nucleus],
            columns,
          },
        },
      });
    },
    [getValues, reset],
  );

  const handleDelete = useCallback(
    (nucleus, index) => {
      const data: PanelsPreferences['spectra'] = getValues();
      const columns = data.nuclei[nucleus]?.columns.filter(
        (_, columnIndex) => columnIndex !== index,
      );
      reset({
        ...data,
        nuclei: {
          ...data.nuclei,
          [nucleus]: {
            ...data[nucleus],
            columns,
          },
        },
      });
    },
    [getValues, reset],
  );
  const mapOnChangeValueHandler = useCallback(
    (key) => {
      const path = paths?.[key];
      if (path) {
        return path;
      }

      return key || ' ';
    },
    [paths],
  );
  return (
    <PreferencesContainer>
      <FormProvider {...methods}>
        <Scroller scrollTo={activeTab}>
          {nuclei?.map((n) => (
            <Scroller.Item key={n} elementKey={n}>
              <NucleusGroup nucleus={n}>
                <GroupPane text="General" style={groupPaneStyle}>
                  <SpectraColumnsManager
                    nucleus={n.replace(',', '_')}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    mapOnChangeValue={mapOnChangeValueHandler}
                    datalist={datalist}
                  />
                </GroupPane>
              </NucleusGroup>
            </Scroller.Item>
          ))}
        </Scroller>
      </FormProvider>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(SpectraPreferences));
