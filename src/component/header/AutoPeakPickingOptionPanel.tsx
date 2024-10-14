import { Button } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import { useToaster } from '../context/ToasterContext';
import Label from '../elements/Label';
import { NumberInput2Controller } from '../elements/NumberInput2Controller';
import { Select2Controller } from '../elements/Select2Controller';
import {
  MIN_AREA_POINTS,
  useCheckPointsNumberInWindowArea,
} from '../hooks/useCheckPointsNumberInWindowArea';

import { headerLabelStyle } from './Header';
import { HeaderWrapper } from './HeaderWrapper';

type Direction = 'positive' | 'negative' | 'both';

const LookFor: Array<{ label: string; value: Direction }> = [
  {
    label: 'Positive',
    value: 'positive',
  },
  {
    label: 'Negative',
    value: 'negative',
  },
  {
    label: 'Both',
    value: 'both',
  },
];

interface AutoPeakPickingOptions {
  maxNumberOfPeaks: number;
  minMaxRatio: number;
  noiseFactor: number;
  direction: Direction;
}

const validationSchema = Yup.object().shape({
  maxNumberOfPeaks: Yup.number().min(0).required(),
  minMaxRatio: Yup.number().min(0).required(),
  noiseFactor: Yup.number().min(0).required(),
  direction: Yup.mixed<Direction>()
    .oneOf(['both', 'negative', 'positive'])
    .required(),
});

const INIT_VALUES: AutoPeakPickingOptions = {
  maxNumberOfPeaks: 50,
  minMaxRatio: 0.1,
  noiseFactor: 3,
  direction: 'positive',
};

export function AutoPeakPickingOptionPanel() {
  const dispatch = useDispatch();
  const pointsNumber = useCheckPointsNumberInWindowArea();
  const toaster = useToaster();
  const {
    handleSubmit,
    formState: { isValid },
    control,
  } = useForm<AutoPeakPickingOptions>({
    defaultValues: INIT_VALUES,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  function handlePeakPicking(values) {
    if (pointsNumber > MIN_AREA_POINTS) {
      dispatch({
        type: 'AUTO_PEAK_PICKING',
        payload: values,
      });
    } else {
      toaster.show({
        message: `Auto peak picking only available for area more than ${MIN_AREA_POINTS} points`,
        intent: 'danger',
      });
    }
  }

  return (
    <HeaderWrapper>
      <Label title="Direction:" shortTitle="" style={headerLabelStyle}>
        <Select2Controller control={control} name="direction" items={LookFor} />
      </Label>
      <Label
        title="Max number of peaks:"
        shortTitle="Max peaks:"
        style={headerLabelStyle}
      >
        <NumberInput2Controller
          control={control}
          name="maxNumberOfPeaks"
          min={0}
          stepSize={1}
          style={{ width: '60px' }}
        />
      </Label>
      <Label title="Noise factor:" shortTitle="Noise:" style={headerLabelStyle}>
        <NumberInput2Controller
          control={control}
          name="noiseFactor"
          min={0}
          stepSize={1}
          style={{ width: '60px' }}
        />
      </Label>
      <Label
        title="Min/max Ratio:"
        shortTitle="Ratio:"
        style={headerLabelStyle}
      >
        <NumberInput2Controller
          control={control}
          name="minMaxRatio"
          min={0}
          stepSize={0.01}
          majorStepSize={0.01}
          minorStepSize={0.01}
          style={{ width: '60px' }}
        />
      </Label>
      <Button
        intent="success"
        onClick={() => handleSubmit(handlePeakPicking)()}
        style={{ margin: '0 10px' }}
        disabled={!isValid}
      >
        Apply
      </Button>
    </HeaderWrapper>
  );
}
