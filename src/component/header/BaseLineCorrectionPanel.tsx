import { useCallback, useRef, useState, CSSProperties, useMemo } from 'react';
import * as Yup from 'yup';

import { baselineAlgorithms } from '../../data/data1d/filter1d/baselineCorrection';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import Select from '../elements/Select';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import {
  RESET_SELECTED_TOOL,
  APPLY_BASE_LINE_CORRECTION_FILTER,
} from '../reducer/types/Types';


const styles: Record<'container' | 'label', CSSProperties> = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
};

function BaseLineCorrectionPanel() {
  const dispatch = useDispatch();
  const formRef = useRef<any>();
  const algorithmRef = useRef<any>();

  const [algorithm, setAlgorithm] = useState('polynomial');

  const handleApplyFilter = useCallback(
    (values) => {
      let options = {};
      switch (algorithm) {
        case 'airpls':
          options = {
            algorithm: algorithmRef.current.value,
            ...values,
          };
          break;
        case 'polynomial':
          options = {
            algorithm: algorithmRef.current.value,
            ...values,
          };
          break;
        default:
          break;
      }
      dispatch({
        type: APPLY_BASE_LINE_CORRECTION_FILTER,
        options,
      });
    },
    [algorithm, dispatch],
  );

  const handleCancelFilter = useCallback(() => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  }, [dispatch]);

  const getAlgorithmsList = useCallback(() => {
    return Object.keys(baselineAlgorithms).map((val) => {
      return { key: val, label: baselineAlgorithms[val], value: val };
    });
  }, []);

  const changeAlgorithmHandler = useCallback((val) => {
    setAlgorithm(val);
  }, []);

  const formData = useMemo(() => {
    switch (algorithm) {
      case 'airpls': {
        const validation = Yup.object().shape({
          maxIterations: Yup.number().integer().min(1).required(),
          tolerance: Yup.number().moreThan(0).required(),
        });
        return {
          validation,
          initialValue: { maxIterations: 100, tolerance: 0.001 },
        };
      }
      case 'autoPolynomial':
      case 'polynomial': {
        const validation = Yup.object().shape({
          degree: Yup.number().integer().min(1).max(6).required(),
        });

        return { validation, initialValue: { degree: 3 } };
      }
      default:
        return { validation: {}, initialValue: {} };
    }
  }, [algorithm]);

  return (
    <div style={styles.container}>
      <span style={styles.label}>Algorithm: </span>
      <Select
        ref={algorithmRef}
        data={getAlgorithmsList()}
        style={{ marginLeft: 10, marginRight: 10 }}
        onChange={changeAlgorithmHandler}
        defaultValue="polynomial"
      />

      <FormikForm
        ref={formRef}
        onSubmit={handleApplyFilter}
        key={JSON.stringify(formData.initialValue)}
        initialValues={formData.initialValue}
        validationSchema={formData.validation}
      >
        {algorithm && algorithm === 'airpls' && (
          <div style={{ display: 'flex' }}>
            <Label title="maxIterations:">
              <FormikInput type="number" name="maxIterations" />
            </Label>
            <Label title="tolerance:" style={{ label: { padding: '0 5px' } }}>
              <FormikInput type="number" name="tolerance" />
            </Label>
          </div>
        )}

        {algorithm && ['autoPolynomial', 'polynomial'].includes(algorithm) && (
          <Label title="degree [ 1 - 6 ]:">
            <FormikInput
              type="number"
              name="degree"
              min={1}
              max={6}
              style={{ inputWrapper: { height: '100%' } }}
            />
          </Label>
        )}
      </FormikForm>

      <ActionButtons
        onDone={() => formRef.current.submitForm()}
        onCancel={handleCancelFilter}
      />
    </div>
  );
}

export default BaseLineCorrectionPanel;
