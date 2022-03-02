import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  CSSProperties,
  memo,
  forwardRef,
} from 'react';
import { MF } from 'react-mf';

import { usePreferences } from '../../context/PreferencesContext';
import FormikColorInput from '../../elements/formik/FormikColorInput';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import FormikNumberInput from '../../elements/formik/FormikNumberInput';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { SET_PANELS_PREFERENCES } from '../../reducer/preferencesReducer';
import { getValue as getValueByKeyPath } from '../../utility/LocalStorage';
import { integralDefaultValues } from '../extra/preferences/defaultValues';

const styles: Record<
  | 'container'
  | 'groupContainer'
  | 'row'
  | 'header'
  | 'inputLabel'
  | 'input'
  | 'inputLabel',
  CSSProperties
> = {
  container: {
    padding: 10,
    backgroundColor: '#f1f1f1',
    height: '100%',
    overflowY: 'auto',
  },
  groupContainer: {
    padding: '5px',
    borderRadius: '5px',
    margin: '10px 0px',
    backgroundColor: 'white',
  },
  row: {
    display: 'flex',
    margin: '5px 0px',
  },
  header: {
    borderBottom: '1px solid #e8e8e8',
    paddingBottom: '5px',
    fontWeight: 'bold',
    color: '#4a4a4a',
  },
  inputLabel: {
    flex: 2,
    fontSize: '11px',
    fontWeight: 'bold',
    color: '#232323',
  },
  input: {
    width: '30%',
    textAlign: 'center',
  },
};

const formatFields = [
  {
    id: 1,
    label: 'Absolute :',
    checkController: 'showAbsolute',
    formatController: 'absoluteFormat',
  },
  {
    id: 2,
    label: 'Relative :',
    checkController: 'showRelative',
    formatController: 'relativeFormat',
  },
];

interface IntegralsPreferencesInnerProps {
  nucleus: Array<string>;
  preferences: any;
  innerRef: any;
}

function IntegralsPreferencesInner({
  nucleus,
  preferences,
  innerRef,
}: IntegralsPreferencesInnerProps) {
  const alert = useAlert();

  const formRef = useRef<any>();

  const updateValues = useCallback(() => {
    if (nucleus) {
      const { color, strokeWidth, ...restProps } = integralDefaultValues;

      const integralPreferences = getValueByKeyPath(
        preferences,
        `formatting.panels.integrals`,
      );

      let defaultValues = nucleus.reduce((acc, nucleusLabel) => {
        acc[nucleusLabel] = restProps;
        return acc;
      }, {});
      defaultValues = Object.assign(defaultValues, { color, strokeWidth });

      formRef.current.setValues(
        integralPreferences ? integralPreferences : defaultValues,
      );
    }
  }, [nucleus, preferences]);

  useEffect(() => {
    updateValues();
  }, [updateValues]);

  const saveHandler = useCallback(
    (values) => {
      preferences.dispatch({
        type: SET_PANELS_PREFERENCES,
        payload: { key: 'integrals', value: values },
      });
      alert.success('Integrals preferences saved successfully');
    },
    [alert, preferences],
  );

  useImperativeHandle(innerRef, () => ({
    saveSetting: () => {
      formRef.current.submitForm();
    },
  }));

  return (
    <div style={styles.container}>
      <FormikForm onSubmit={saveHandler} ref={formRef}>
        <div style={styles.groupContainer}>
          <p style={styles.header}>General</p>
          <FormikColorInput name="color" />
          <FormikNumberInput
            name="strokeWidth"
            label="stroke width :"
            style={{
              label: { fontSize: '11px', fontWeight: 'bold', color: '#232323' },
              input: {
                width: '60%',
                textAlign: 'center',
                borderRadius: '5px',
              },
            }}
            min={1}
            max={9}
            pattern="[1-9]+"
          />
        </div>

        {nucleus?.map((nucleusLabel) => (
          <div key={nucleusLabel} style={styles.groupContainer}>
            <p style={styles.header}>
              <MF mf={nucleusLabel} />
            </p>
            {formatFields.map((field) => (
              <FormikColumnFormatField
                key={field.id}
                label={field.label}
                checkControllerName={`${nucleusLabel}.${field.checkController}`}
                formatControllerName={`${nucleusLabel}.${field.formatController}`}
              />
            ))}
          </div>
        ))}
      </FormikForm>
    </div>
  );
}

const MemoizedIntegralsPreferences = memo(IntegralsPreferencesInner);

// TODO: remove this hacky use of ref.
function IntegralsPreferences(props, ref) {
  const preferences = usePreferences();
  const nucleus = useNucleus();

  return (
    <MemoizedIntegralsPreferences
      innerRef={ref}
      {...{
        nucleus,
        preferences,
      }}
    />
  );
}

export default forwardRef(IntegralsPreferences);
