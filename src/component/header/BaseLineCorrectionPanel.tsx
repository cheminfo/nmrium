import { Formik } from 'formik';
import { Filter, Filters, BaselineCorrectionOptions } from 'nmr-processing';
import { useState, memo, useRef } from 'react';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import { InputStyle } from '../elements/Input';
import Label from '../elements/Label';
import Select from '../elements/Select';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikInput from '../elements/formik/FormikInput';
import FormikOnChange from '../elements/formik/FormikOnChange';
import { useFilter } from '../hooks/useFilter';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

interface BaseLineCorrectionInnerPanelProps {
  filter: Filter | null;
}

const getAlgorithmsList = () => {
  return ['airPLS', 'Polynomial'].map((val) => ({
    label: val,
    value: val.toLowerCase(),
  }));
};

const inputStyle: InputStyle = {
  input: { width: '50px', textAlign: 'center' },
  inputWrapper: { height: '100%' },
};

const formData = (algorithm, filterValues: BaselineCorrectionOptions) => {
  switch (algorithm) {
    case 'airpls': {
      const validation = Yup.object().shape({
        maxIterations: Yup.number().integer().min(1).required(),
        tolerance: Yup.number().moreThan(0).required(),
      });
      return {
        validation,
        values: {
          algorithm,
          livePreview: true,
          maxIterations: 100,
          tolerance: 0.001,
          ...(filterValues?.algorithm === 'airpls' ? filterValues : {}),
        },
      };
    }
    case 'autoPolynomial':
    case 'polynomial': {
      const validation = Yup.object().shape({
        degree: Yup.number().integer().min(1).max(6).required(),
      });

      return {
        validation,
        values: {
          algorithm,
          livePreview: true,
          degree: 3,
          ...(filterValues?.algorithm === 'polynomial' ? filterValues : {}),
        },
      };
    }
    default:
      return {
        validation: {},
        values: { livePreview: true },
      };
  }
};

function BaseLineCorrectionInnerPanel(
  props: BaseLineCorrectionInnerPanelProps,
) {
  const dispatch = useDispatch();
  const previousPreviewRef = useRef<boolean>(true);
  const { algorithm: baseAlgorithm = 'polynomial' } =
    props?.filter?.value || {};

  const [algorithm, setAlgorithm] = useState(baseAlgorithm);

  const handleApplyFilter = (
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) => {
    const { livePreview, ...options } = values;
    switch (triggerSource) {
      case 'onChange': {
        if (livePreview || previousPreviewRef !== livePreview) {
          dispatch({
            type: 'CALCULATE_BASE_LINE_CORRECTION_FILTER',
            payload: {
              options,
              livePreview,
            },
          });
        }
        break;
      }

      case 'apply': {
        dispatch({
          type: 'APPLY_BASE_LINE_CORRECTION_FILTER',
          payload: {
            options,
          },
        });
        break;
      }
      default:
        break;
    }
    previousPreviewRef.current = livePreview;
  };

  const handleCancelFilter = () => {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  };

  function handleChangeAlgorithm(selectedAlgorithm) {
    setAlgorithm(selectedAlgorithm);
  }

  const form = formData(algorithm, props?.filter?.value || {});

  return (
    <HeaderContainer>
      <Label title="Algorithm: " style={headerLabelStyle}>
        <Select
          items={getAlgorithmsList()}
          value={algorithm}
          onChange={handleChangeAlgorithm}
        />
      </Label>

      <Formik
        onSubmit={(values) => handleApplyFilter(values)}
        initialValues={form.values}
        validationSchema={form.validation}
        enableReinitialize
      >
        {({ submitForm }) => (
          <>
            {algorithm && algorithm === 'airpls' && (
              <div style={{ display: 'flex' }}>
                <Label title="maxIterations:" style={headerLabelStyle}>
                  <FormikInput
                    type="number"
                    name="maxIterations"
                    debounceTime={250}
                    style={inputStyle}
                  />
                </Label>
                <Label title="tolerance:" style={headerLabelStyle}>
                  <FormikInput
                    type="number"
                    name="tolerance"
                    debounceTime={250}
                    style={inputStyle}
                  />
                </Label>
              </div>
            )}

            {algorithm &&
              ['autoPolynomial', 'polynomial'].includes(algorithm) && (
                <Label
                  title="degree [ 1 - 6 ]:"
                  shortTitle="degree :"
                  style={headerLabelStyle}
                >
                  <FormikInput
                    type="number"
                    name="degree"
                    min={1}
                    max={6}
                    style={inputStyle}
                    debounceTime={250}
                  />
                </Label>
              )}

            <Label
              title="live preview "
              htmlFor="livePreview"
              style={headerLabelStyle}
            >
              <FormikCheckBox name="livePreview" />
            </Label>

            <FormikOnChange
              onChange={(values) => handleApplyFilter(values, 'onChange')}
              enableOnload
            />
            <ActionButtons onDone={submitForm} onCancel={handleCancelFilter} />
          </>
        )}
      </Formik>
    </HeaderContainer>
  );
}

const MemoizedBaseLineCorrectionPanel = memo(BaseLineCorrectionInnerPanel);

export default function BaseLineCorrectionPanel() {
  const filter = useFilter(Filters.baselineCorrection.id);
  return <MemoizedBaseLineCorrectionPanel filter={filter} />;
}
