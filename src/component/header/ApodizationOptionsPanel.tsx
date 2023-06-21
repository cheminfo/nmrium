import { Formik, FormikProps } from 'formik';
import { useRef, memo } from 'react';
import * as Yup from 'yup';

import * as Filters from '../../data/Filters';
import { Filter } from '../../data/FiltersManager';
import {
  ApodizationOptions,
  defaultApodizationOptions,
} from '../../data/data1d/filter1d/apodization';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import { InputStyle } from '../elements/Input';
import Label from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikInput from '../elements/formik/FormikInput';
import FormikOnChange from '../elements/formik/FormikOnChange';
import { useFilter } from '../hooks/useFilter';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const inputStyle: InputStyle = {
  input: { width: '60px' },
  inputWrapper: { height: '100%' },
};

const validationSchema = Yup.object().shape({
  lineBroadening: Yup.number().required(),
  gaussBroadening: Yup.number().required(),
  lineBroadeningCenter: Yup.number().required().min(0).max(1),
});

const initialValues: ApodizationOptions & { livePreview: boolean } = {
  ...defaultApodizationOptions,
  livePreview: true,
};

interface ApodizationOptionsInnerPanelProps {
  filter: Filter | null;
}

function ApodizationOptionsInnerPanel(
  props: ApodizationOptionsInnerPanelProps,
) {
  const dispatch = useDispatch();
  const formRef = useRef<FormikProps<any>>(null);

  function handleApplyFilter(
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) {
    const { livePreview, ...filterOptions } = values;
    if (livePreview && triggerSource === 'onChange') {
      dispatch({
        type: 'CALCULATE_APODIZATION_FILTER',
        payload: filterOptions,
      });
    } else if (triggerSource === 'apply') {
      dispatch({
        type: 'APPLY_APODIZATION_FILTER',
        payload: filterOptions,
      });
    }
  }

  function handleCancelFilter() {
    dispatch({
      type: 'RESET_SELECTED_TOOL',
    });
  }

  let formData = initialValues;
  if (props.filter) {
    formData = { ...initialValues, ...props.filter.value, livePreview: true };
  }

  return (
    <HeaderContainer>
      <Formik
        innerRef={formRef}
        onSubmit={(values) => handleApplyFilter(values)}
        initialValues={formData}
        validationSchema={validationSchema}
      >
        <>
          <Label
            title="Line broadening : "
            shortTitle="LB :"
            style={headerLabelStyle}
          >
            <FormikInput
              type="number"
              name="lineBroadening"
              min={0}
              max={1}
              style={inputStyle}
              debounceTime={250}
            />
          </Label>
          <Label
            title="Gauss broadening :"
            shortTitle="GB :"
            style={headerLabelStyle}
          >
            <FormikInput
              type="number"
              name="gaussBroadening"
              min={0}
              max={1}
              style={inputStyle}
              debounceTime={250}
            />
          </Label>
          <Label
            title="lineBroadeningCenter [0 - 1] : "
            shortTitle="LB Center :"
            style={headerLabelStyle}
          >
            <FormikInput
              type="number"
              name="lineBroadeningCenter"
              min={0}
              max={1}
              style={inputStyle}
              debounceTime={250}
            />
          </Label>
          <Label
            title="Live preview "
            htmlFor="livePreview"
            style={{ label: { padding: '0 5px' } }}
          >
            <FormikCheckBox name="livePreview" />
          </Label>

          <FormikOnChange
            onChange={(values) => handleApplyFilter(values, 'onChange')}
            enableOnload
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

const MemoizedApodizationPanel = memo(ApodizationOptionsInnerPanel);

export default function ApodizationOptionsPanel() {
  const filter = useFilter(Filters.apodization.id);
  return <MemoizedApodizationPanel filter={filter} />;
}
