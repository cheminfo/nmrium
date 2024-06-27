import { Checkbox } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import {
  Filters,
  Filter,
  ApodizationOptions as BaseApodizationOptions,
} from 'nmr-processing';
import { useRef, memo } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { defaultApodizationOptions } from '../../data/constants/DefaultApodizationOptions';
import { useDispatch } from '../context/DispatchContext';
import ActionButtons from '../elements/ActionButtons';
import Label from '../elements/Label';
import { NumberInput2Controller } from '../elements/NumberInput2Controller';
import { useFilter } from '../hooks/useFilter';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

const validationSchema = Yup.object().shape({
  lineBroadening: Yup.number().required(),
  gaussBroadening: Yup.number().required(),
  lineBroadeningCenter: Yup.number().required().min(0).max(1),
  livePreview: Yup.boolean().required(),
});

type ApodizationOptions = BaseApodizationOptions & { livePreview: boolean };

const initialValues: ApodizationOptions = {
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

  const {
    handleSubmit,
    register,
    control,
    formState: { isValid },
  } = useForm<ApodizationOptions>({
    defaultValues: formData,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  function submitHandler() {
    void handleSubmit((values) => handleApplyFilter(values, 'onChange'))();
  }

  const { onChange: onLivePreviewChange, ...otherLivePreviewOptions } =
    register('livePreview');

  return (
    <HeaderContainer>
      <Label title="Line broadening:" shortTitle="LB:" style={headerLabelStyle}>
        <NumberInput2Controller
          control={control}
          name="lineBroadening"
          debounceTime={250}
          min={0}
          max={1}
          stepSize={0.1}
          style={{ width: '60px' }}
          onValueChange={() => {
            submitHandler();
          }}
        />
      </Label>
      <Label
        title="Gauss broadening:"
        shortTitle="GB:"
        style={headerLabelStyle}
      >
        <NumberInput2Controller
          control={control}
          name="gaussBroadening"
          debounceTime={250}
          min={0}
          max={1}
          stepSize={0.1}
          style={{ width: '60px' }}
          onValueChange={() => {
            submitHandler();
          }}
        />
      </Label>
      <Label
        title="Line broadening center [0 - 1]:"
        shortTitle="LB center:"
        style={headerLabelStyle}
      >
        <NumberInput2Controller
          control={control}
          name="lineBroadeningCenter"
          debounceTime={250}
          min={0}
          max={1}
          stepSize={0.1}
          style={{ width: '60px' }}
          onValueChange={() => {
            submitHandler();
          }}
        />
      </Label>
      <Label title="Live preview" style={{ label: { padding: '0 5px' } }}>
        <Checkbox
          {...otherLivePreviewOptions}
          onChange={(event) => {
            void onLivePreviewChange(event);
            submitHandler();
          }}
          style={{ margin: 0 }}
        />
      </Label>

      <ActionButtons
        disabledDone={!isValid}
        onDone={() => handleSubmit((values) => handleApplyFilter(values))()}
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
