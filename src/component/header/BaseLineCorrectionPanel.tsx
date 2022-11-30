import { Formik, FormikProps } from 'formik';
import { useRef, useState, useEffect, memo } from 'react';
import * as Yup from 'yup';

import * as Filters from '../../data/Filters';
import { Filter } from '../../data/FiltersManager';
import { BaselineCorrectionOptions } from '../../data/data1d/filter1d/baselineCorrection';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import Select from '../elements/Select';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikInput from '../elements/formik/FormikInput';
import FormikOnChange from '../elements/formik/FormikOnChange';
import { useFilter } from '../hooks/useFilter';
import {
  RESET_SELECTED_TOOL,
  APPLY_BASE_LINE_CORRECTION_FILTER,
  CALCULATE_BASE_LINE_CORRECTION_FILTER,
  DISABLE_FILTER_LIVE_PREVIEW,
} from '../reducer/types/Types';
import { options } from '../toolbar/ToolTypes';

import { HeaderContainer } from './HeaderContainer';

interface BaseLineCorrectionInnerPanelProps {
  filter: Filter | null;
}

const labelStyle = {
  label: {
    fontWeight: 'normal',
    fontSize: '12px',
  },
  wrapper: {
    paddingRight: '5px',
  },
};

const getAlgorithmsList = () => {
  return ['airPLS', 'Polynomial'].map((val) => ({
    label: val,
    value: val.toLowerCase(),
  }));
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
  const formRef = useRef<FormikProps<any>>(null);

  const [algorithm, setAlgorithm] = useState('polynomial');

  const handleApplyFilter = (
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) => {
    let options = {};
    switch (algorithm) {
      case 'airpls':
        options = {
          algorithm,
          ...values,
        };
        break;
      case 'polynomial':
        options = {
          algorithm,
          ...values,
        };
        break;
      default:
        break;
    }

    dispatch({
      type:
        triggerSource === 'onChange'
          ? CALCULATE_BASE_LINE_CORRECTION_FILTER
          : APPLY_BASE_LINE_CORRECTION_FILTER,
      options,
    });
  };

  const handleCancelFilter = () => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  };

  useEffect(() => {
    if (props.filter) {
      const { algorithm } = props.filter.value;
      setAlgorithm(algorithm);
    }
  }, [props?.filter]);

  const disableLivePreviewHandler = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    //disable filter Live preview
    if (!event.target.checked) {
      dispatch({
        type: DISABLE_FILTER_LIVE_PREVIEW,
        payload: { selectedTool: options.baselineCorrection.id },
      });
    }
  };

  const form = formData(algorithm, props?.filter?.value || {});

  return (
    <HeaderContainer>
      <Label title="Algorithm: " style={labelStyle}>
        <Select
          items={getAlgorithmsList()}
          value={algorithm}
          onChange={(val) => setAlgorithm(val)}
        />
      </Label>

      <Formik
        innerRef={formRef}
        onSubmit={(values) => handleApplyFilter(values)}
        key={JSON.stringify(form.values)}
        initialValues={form.values}
        validationSchema={form.validation}
      >
        <>

          {algorithm && algorithm === 'airpls' && (
            <div style={{ display: 'flex' }}>
              <Label title="maxIterations:" style={labelStyle}>
                <FormikInput
                  type="number"
                  name="maxIterations"
                  debounceTime={250}
                />
              </Label>
              <Label title="tolerance:" style={labelStyle}>
                <FormikInput type="number" name="tolerance" debounceTime={250} />
              </Label>
            </div>
          )}

          {algorithm && ['autoPolynomial', 'polynomial'].includes(algorithm) && (
            <Label title="degree [ 1 - 6 ]:" style={labelStyle}>
              <FormikInput
                type="number"
                name="degree"
                min={1}
                max={6}
                style={{ inputWrapper: { height: '100%' } }}
                debounceTime={250}
              />
            </Label>
          )}

          <Label title="live preview " htmlFor="livePreview" style={labelStyle}>
            <FormikCheckBox
              name="livePreview"
              onChange={disableLivePreviewHandler}
            />
          </Label>

          <FormikOnChange
            onChange={(values) => handleApplyFilter(values, 'onChange')}
          />
        </>
      </Formik>

      <ActionButtons
        onDone={() => formRef.current?.submitForm()}
        onCancel={handleCancelFilter}
      />
    </HeaderContainer>
  );
}

const MemoizedBaseLineCorrectionPanel = memo(BaseLineCorrectionInnerPanel);

export default function BaseLineCorrectionPanel() {
  const filter = useFilter(Filters.baselineCorrection.id);
  return <MemoizedBaseLineCorrectionPanel filter={filter} />;
}
