import { CSSProperties, useEffect, useRef, memo } from 'react';
import * as Yup from 'yup';

import * as Filters from '../../data/Filters';
import { Filter } from '../../data/FiltersManager';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import FormikCheckBox from '../elements/formik/FormikCheckBox';
import FormikForm from '../elements/formik/FormikForm';
import FormikInput from '../elements/formik/FormikInput';
import FormikOnChange from '../elements/formik/FormikOnChange';
import { useFilter } from '../hooks/useFilter';
import {
  APPLY_APODIZATION_FILTER,
  CALCULATE_APODIZATION_FILTER,
  RESET_SELECTED_TOOL,
} from '../reducer/types/Types';

const styles: Record<'container' | 'input' | 'label', CSSProperties> = {
  container: {
    padding: '5px',
    height: '100%',
    display: 'flex',
  },

  input: {
    height: '100%',
    width: '80px',
    borderRadius: '5px',
    border: '0.55px solid #c7c7c7',
    margin: '0px 5px 0px 5px',
    textAlign: 'center',
  },

  label: {
    lineHeight: 2,
    userSelect: 'none',
  },
};

const labelStyle = {
  label: {
    fontWeight: 'normal',
    fontSize: '12px',
  },
  wrapper: {
    paddingRight: '5px',
  },
};

const inputStyle = {
  input: { height: '24px' },
};

const validationSchema = Yup.object().shape({
  lineBroadening: Yup.number().required(),
  gaussBroadening: Yup.number().required(),
  lineBroadeningCenter: Yup.number().required().min(0).max(1),
});

const initialValues = {
  lineBroadening: 1,
  gaussBroadening: 0,
  lineBroadeningCenter: 0,
  livePreview: true,
};

interface ApodizationOptionsInnerPanelProps {
  filter: Filter | null;
}

function ApodizationOptionsInnerPanel(
  props: ApodizationOptionsInnerPanelProps,
) {
  const dispatch = useDispatch();
  const formRef = useRef<any>();
  const handleApplyFilter = (
    values,
    triggerSource: 'apply' | 'onChange' = 'apply',
  ) => {
    const { livePreview, ...filterOptions } = values;
    if (livePreview && triggerSource === 'onChange') {
      dispatch({
        type: CALCULATE_APODIZATION_FILTER,
        payload: filterOptions,
      });
    } else if (triggerSource === 'apply') {
      dispatch({
        type: APPLY_APODIZATION_FILTER,
        payload: filterOptions,
      });
    }
  };

  const handleCancelFilter = () => {
    dispatch({
      type: RESET_SELECTED_TOOL,
    });
  };

  useEffect(() => {
    if (props.filter) {
      formRef.current.setValues({ ...props.filter.value, livePreview: true });
    }
  }, [props?.filter]);

  return (
    <div style={styles.container}>
      <FormikForm
        ref={formRef}
        onSubmit={(values) => handleApplyFilter(values)}
        initialValues={initialValues}
        validationSchema={validationSchema}
      >
        <Label title="Line broadening : " style={labelStyle}>
          <FormikInput
            type="number"
            name="lineBroadening"
            min={0}
            max={1}
            style={inputStyle}
            debounceTime={250}
          />
        </Label>
        <Label title="Gauss broadening :" style={labelStyle}>
          <FormikInput
            type="number"
            name="gaussBroadening"
            min={0}
            max={1}
            style={inputStyle}
            debounceTime={250}
          />
        </Label>
        <Label title="lineBroadeningCenter [0 - 1] : " style={labelStyle}>
          <FormikInput
            type="number"
            name="lineBroadeningCenter"
            min={0}
            max={1}
            style={inputStyle}
            debounceTime={250}
          />
        </Label>
        <Label title="live preview " style={{ label: { padding: '0 5px' } }}>
          <FormikCheckBox name="livePreview" />
        </Label>

        <FormikOnChange
          onChange={(values) => handleApplyFilter(values, 'onChange')}
          enableValidation
        />
      </FormikForm>

      <ActionButtons
        onDone={() => formRef.current.submitForm()}
        onCancel={handleCancelFilter}
      />
    </div>
  );
}

const MemoziedApodizationPanel = memo(ApodizationOptionsInnerPanel);

export default function ApodizationOptionsPanel() {
  const filter = useFilter(Filters.apodization.id);
  return <MemoziedApodizationPanel filter={filter} />;
}
