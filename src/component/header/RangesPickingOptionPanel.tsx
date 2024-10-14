import { Checkbox, Button } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import { useToaster } from '../context/ToasterContext';
import Label from '../elements/Label';
import { NumberInput2Controller } from '../elements/NumberInput2Controller';
import {
  MIN_AREA_POINTS,
  useCheckPointsNumberInWindowArea,
} from '../hooks/useCheckPointsNumberInWindowArea';

import { headerLabelStyle } from './Header';
import { HeaderWrapper } from './HeaderWrapper';

interface AutoRangesOptions {
  minMaxRatio: number;
  lookNegative: boolean;
}

const validationSchema = Yup.object().shape({
  minMaxRatio: Yup.number().min(0).required(),
  lookNegative: Yup.boolean().required(),
});

const initialValues: AutoRangesOptions = {
  minMaxRatio: 0.05,
  lookNegative: false,
};

function RangesPickingOptionPanel() {
  const dispatch = useDispatch();
  const {
    handleSubmit,
    register,
    control,
    formState: { isValid },
  } = useForm<AutoRangesOptions>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });
  const pointsNumber = useCheckPointsNumberInWindowArea();
  const toaster = useToaster();

  function handleRangesPicking(values) {
    if (pointsNumber > MIN_AREA_POINTS) {
      dispatch({
        type: 'AUTO_RANGES_DETECTION',
        payload: values,
      });
    } else {
      toaster.show({
        message: `Auto range picking only available for area more than ${MIN_AREA_POINTS} points`,
        intent: 'danger',
      });
    }
  }

  return (
    <HeaderWrapper>
      <Label title="Detect negative" style={headerLabelStyle}>
        <Checkbox
          style={{ margin: 0 }}
          {...register(`lookNegative`)}
          defaultChecked={false}
        />
      </Label>
      <Label title="Min/max ratio:" style={headerLabelStyle}>
        <NumberInput2Controller
          control={control}
          name="minMaxRatio"
          min={0}
          stepSize={0.01}
          majorStepSize={0.01}
          minorStepSize={0.01}
          style={{ width: '70px' }}
        />
      </Label>

      <Button
        intent="success"
        onClick={() => handleSubmit(handleRangesPicking)()}
        style={{ margin: '0 10px' }}
        disabled={!isValid}
      >
        Auto ranges picking
      </Button>
    </HeaderWrapper>
  );
}

export default RangesPickingOptionPanel;
