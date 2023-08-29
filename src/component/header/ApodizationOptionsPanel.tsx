import { Formik } from 'formik';
import { Filters, Filter, ApodizationOptions } from 'nmr-processing';
import { useRef, memo } from 'react';
import * as Yup from 'yup';

import { defaultApodizationOptions } from '../../data/constants/DefaultApodizationOptions';
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
  input: { width: '60px', textAlign: 'center' },
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
  const previousPreviewRef = useRef<boolean>(initialValues.livePreview);

  function handleApplyFilter(
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) {
    const { livePreview, ...options } = values;
    switch (triggerSource) {
      case 'onChange': {
        if (livePreview || previousPreviewRef.current !== livePreview) {
          dispatch({
            type: 'CALCULATE_APODIZATION_FILTER',
            payload: { livePreview, options },
          });
        }
        break;
      }

      case 'apply': {
        dispatch({
          type: 'APPLY_APODIZATION_FILTER',
          payload: { options },
        });
        break;
      }
      default:
        break;
    }

    previousPreviewRef.current = livePreview;
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
        onSubmit={(values) => handleApplyFilter(values)}
        initialValues={formData}
        validationSchema={validationSchema}
      >
        {({ submitForm }) => (
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
                step={0.1}
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
                step={0.1}
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
                step={0.1}
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
            <ActionButtons onDone={submitForm} onCancel={handleCancelFilter} />
          </>
        )}
      </Formik>
    </HeaderContainer>
  );
}

const MemoizedApodizationPanel = memo(ApodizationOptionsInnerPanel);

export default function ApodizationOptionsPanel() {
  const filter = useFilter(Filters.apodization.id);
  return <MemoizedApodizationPanel filter={filter} />;
}
