import styled from '@emotion/styled';
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
import { InputStyle } from '../../elements/Input';
import Label from '../../elements/Label';
import { Scroller } from '../../elements/Scroller';
import FormikInput from '../../elements/formik/FormikInput';
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

const inputStyle: InputStyle = {
  input: { padding: '5px' },
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
  (obj: Workspace['formatting']['panels']['spectra']) =>
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
                <AxisPreferences nucleus={n} />
              </NucleusGroup>
            </Scroller.Item>
          ))}
        </Scroller>
      </Formik>
    </PreferencesContainer>
  );
}

interface AxisPreferencesProps {
  nucleus: string;
}

const Container = styled.div`
  display: flex;
`;

function AxisPreferences(props: AxisPreferencesProps) {
  const { nucleus } = props;

  if (nucleus.split(',').length === 1) {
    return (
      <GroupPane text="X axis" style={groupPaneStyle}>
        <AxisFields nucleus={nucleus} axis="x" />
      </GroupPane>
    );
  }

  return (
    <>
      <GroupPane text="X axis " style={groupPaneStyle}>
        <AxisFields nucleus={nucleus} axis="x" />
      </GroupPane>
      <GroupPane text="Y axis " style={groupPaneStyle}>
        <AxisFields nucleus={nucleus} axis="y" />
      </GroupPane>
    </>
  );
}

interface AxisFieldsProps extends AxisPreferencesProps {
  axis: 'x' | 'y';
}

function AxisFields(props: AxisFieldsProps) {
  const { nucleus, axis } = props;

  return (
    <Container>
      <Label title="From:">
        <FormikInput
          type="number"
          style={inputStyle}
          name={`nuclei.${nucleus}.axisDomain.${axis}.from`}
        />
      </Label>
      <Label title="To:" style={{ label: { paddingLeft: '5px' } }}>
        <FormikInput
          type="number"
          style={inputStyle}
          name={`nuclei.${nucleus}.axisDomain.${axis}.to`}
        />
      </Label>
    </Container>
  );
}

export default memo(forwardRef(SpectraPreferences));
