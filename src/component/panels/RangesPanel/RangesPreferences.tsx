import {
  useEffect,
  useCallback,
  useImperativeHandle,
  useRef,
  memo,
  CSSProperties,
  forwardRef,
} from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import IsotopesViewer from '../../elements/IsotopesViewer';
import Label from '../../elements/Label';
import FormikColumnFormatField from '../../elements/formik/FormikColumnFormatField';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { useAlert } from '../../elements/popup/Alert';
import useNucleus from '../../hooks/useNucleus';
import { SET_PANELS_PREFERENCES } from '../../reducer/preferencesReducer';
import { getValue as getValueByKeyPath } from '../../utility/LocalStorage';
import { getRangeDefaultValues } from '../extra/preferences/defaultValues';

const styles: Record<
  | 'container'
  | 'groupContainer'
  | 'row'
  | 'header'
  | 'inputLabel'
  | 'inputWrapper',
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
  },

  inputWrapper: {
    width: '100px',
    flex: '4',
    borderRadius: '5px',
  },
};

const formatFields = [
  {
    id: 1,
    label: 'From :',
    checkController: 'showFrom',
    formatController: 'fromFormat',
  },
  {
    id: 2,
    label: 'To :',
    checkController: 'showTo',
    formatController: 'toFormat',
  },
  {
    id: 3,
    label: 'Absolute :',
    checkController: 'showAbsolute',
    formatController: 'absoluteFormat',
  },
  {
    id: 4,
    label: 'Relative :',
    checkController: 'showRelative',
    formatController: 'relativeFormat',
  },
];

interface RangesPreferencesInnerProps {
  nucleus: Array<string>;
  preferences: any;
  innerRef: any;
}

function RangesPreferencesInner({
  nucleus,
  preferences,
  innerRef,
}: RangesPreferencesInnerProps) {
  const alert = useAlert();
  const formRef = useRef<any>();

  const updateValues = useCallback(() => {
    if (nucleus) {
      const defaultValues = nucleus.reduce((acc, nucleusLabel) => {
        acc[nucleusLabel] = getRangeDefaultValues(nucleusLabel);
        return acc;
      }, {});
      const rangesPreferences = getValueByKeyPath(
        preferences,
        `formatting.panels.ranges`,
      );
      formRef.current.setValues(
        rangesPreferences ? rangesPreferences : defaultValues,
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
        payload: { key: 'ranges', value: values },
      });
      alert.success('ranges preferences saved successfully');
    },
    [alert, preferences],
  );

  useImperativeHandle(
    innerRef,
    () => ({
      saveSetting: () => {
        formRef.current.submitForm();
      },
    }),
    [],
  );

  return (
    <div style={styles.container}>
      <FormikForm onSubmit={saveHandler} ref={formRef}>
        {nucleus?.map((nucleusLabel) => (
          <div key={nucleusLabel} style={styles.groupContainer}>
            <IsotopesViewer style={styles.header} value={nucleusLabel} />
            {formatFields.map((field) => (
              <FormikColumnFormatField
                key={field.id}
                label={field.label}
                checkControllerName={`${nucleusLabel}.${field.checkController}`}
                formatControllerName={`${nucleusLabel}.${field.formatController}`}
              />
            ))}
            <Label
              title="J Graph tolerance (Hz) :"
              style={{ label: styles.inputLabel, wrapper: styles.inputWrapper }}
            >
              <FormikInput
                name={`${nucleusLabel}.jGraphTolerance`}
                type="number"
              />
            </Label>
          </div>
        ))}
      </FormikForm>
    </div>
  );
}

const MemoizedRangesPreferences = memo(RangesPreferencesInner);

// TODO: remove this hacky use of ref.
function RangesPreferences(prop, ref: any) {
  const nucleus = useNucleus();

  const preferences = usePreferences();
  return (
    <MemoizedRangesPreferences
      innerRef={ref}
      {...{
        preferences,
        nucleus,
      }}
    />
  );
}

export default forwardRef(RangesPreferences);
