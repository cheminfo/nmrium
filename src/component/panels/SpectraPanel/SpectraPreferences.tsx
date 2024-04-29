import { Formik, FormikProps } from 'formik';
import { PanelsPreferences, Workspace } from 'nmr-load-save';
import {
  useImperativeHandle,
  useRef,
  memo,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';
import * as Yup from 'yup';

import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import { GroupPane, GroupPaneStyle } from '../../elements/GroupPane';
import { Scroller } from '../../elements/Scroller';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { convertPathArrayToString } from '../../utility/convertPathArrayToString';
import { getSpectraObjectPaths } from '../../utility/getSpectraObjectPaths';
import { NucleusGroup } from '../extra/preferences/NucleusGroup';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

import { SpectraColumnsManager } from './base/SpectraColumnsManager';

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
  const formRef = useRef<FormikProps<any>>(null);
  const {
    data,
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const preferences = usePreferences();
  const nuclei = useNucleus();

  const preferencesByNuclei = usePanelPreferencesByNuclei('spectra', nuclei);

  const { datalist, paths } = useMemo(
    () => getSpectraObjectPaths(data),
    [data],
  );

  function saveHandler(values) {
    preferences.dispatch({
      type: 'SET_PANELS_PREFERENCES',
      payload: { key: 'spectra', value: values },
    });
  }

  useImperativeHandle(
    ref,
    () => ({
      saveSetting: () => {
        if (!formRef.current) return;

        void formRef.current.submitForm();
        return formRef.current?.isValid;
      },
    }),
    [],
  );

  const handleAdd = useCallback((nucleus, index) => {
    if (!formRef.current) return;
    const data: PanelsPreferences['spectra'] = formRef.current.values;
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

    void formRef.current.setValues({
      ...data,
      nuclei: {
        ...data.nuclei,
        [nucleus]: {
          ...data[nucleus],
          columns,
        },
      },
    });
  }, []);

  const handleDelete = useCallback((nucleus, index) => {
    if (!formRef.current) return;

    const data: PanelsPreferences['spectra'] = formRef.current.values;
    const columns = data.nuclei[nucleus]?.columns.filter(
      (_, columnIndex) => columnIndex !== index,
    );
    void formRef.current.setValues({
      ...data,
      nuclei: {
        ...data.nuclei,
        [nucleus]: {
          ...data[nucleus],
          columns,
        },
      },
    });
  }, []);
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
  const mapValue = useCallback((value) => convertPathArrayToString(value), []);

  return (
    <PreferencesContainer>
      <Formik
        innerRef={formRef}
        onSubmit={saveHandler}
        initialValues={preferencesByNuclei}
        validationSchema={spectraPreferencesValidation}
      >
        <Scroller scrollTo={activeTab}>
          {nuclei?.map((n) => (
            <Scroller.Item key={n} elementKey={n}>
              <NucleusGroup nucleus={n}>
                <GroupPane text="General" style={groupPaneStyle}>
                  <SpectraColumnsManager
                    nucleus={n}
                    onAdd={handleAdd}
                    onDelete={handleDelete}
                    mapOnChangeValue={mapOnChangeValueHandler}
                    mapValue={mapValue}
                    datalist={datalist}
                  />
                </GroupPane>
              </NucleusGroup>
            </Scroller.Item>
          ))}
        </Scroller>
      </Formik>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(SpectraPreferences));
