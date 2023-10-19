import { Formik } from 'formik';
import { PanelsPreferences } from 'nmr-load-save';
import {
  useImperativeHandle,
  useRef,
  memo,
  forwardRef,
  useCallback,
  useMemo,
} from 'react';

import { useChartData } from '../../context/ChartContext';
import { usePreferences } from '../../context/PreferencesContext';
import { Scroller } from '../../elements/Scroller';
import useNucleus from '../../hooks/useNucleus';
import { usePanelPreferencesByNuclei } from '../../hooks/usePanelPreferences';
import { convertPathArrayToString } from '../../utility/convertPathArrayToString';
import { getSpectraObjectPaths } from '../../utility/getSpectraObjectPaths';
import { NucleusGroup } from '../extra/preferences/NucleusGroup';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

import { SpectraColumnsManager } from './base/SpectraColumnsManager';

function SpectraPreferences(props, ref: any) {
  const formRef = useRef<any>(null);
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
        formRef.current.submitForm();
      },
    }),
    [],
  );

  const handleAdd = useCallback((nucleus, index) => {
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

    formRef.current.setValues({
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
    const data: PanelsPreferences['spectra'] = formRef.current.values;
    const columns = data.nuclei[nucleus]?.columns.filter(
      (_, columnIndex) => columnIndex !== index,
    );
    formRef.current.setValues({
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
    (key) => paths?.[key] || key,
    [paths],
  );
  const mapValue = useCallback((value) => convertPathArrayToString(value), []);

  return (
    <PreferencesContainer>
      <Formik
        innerRef={formRef}
        onSubmit={saveHandler}
        initialValues={preferencesByNuclei}
      >
        <Scroller scrollTo={activeTab}>
          {nuclei?.map((n) => (
            <Scroller.Item key={n} elementKey={n}>
              <NucleusGroup nucleus={n}>
                <SpectraColumnsManager
                  nucleus={n}
                  onAdd={handleAdd}
                  onDelete={handleDelete}
                  mapOnChangeValue={mapOnChangeValueHandler}
                  mapValue={mapValue}
                  datalist={datalist}
                />
              </NucleusGroup>
            </Scroller.Item>
          ))}
        </Scroller>
      </Formik>
    </PreferencesContainer>
  );
}

export default memo(forwardRef(SpectraPreferences));
