import { Button } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext.js';
import Label from '../elements/Label.js';
import { NumberInput2Controller } from '../elements/NumberInput2Controller.js';

import { headerLabelStyle } from './Header.js';
import { HeaderWrapper } from './HeaderWrapper.js';

const validationSchema = Yup.object().shape({
  zonesNoiseFactor: Yup.number().integer().min(0).required(),
  zonesMinMaxRatio: Yup.number().min(0).required(),
});

interface ZoneDetectionOptions {
  zonesNoiseFactor: number;
  zonesMinMaxRatio: number;
}

const initialValues: ZoneDetectionOptions = {
  zonesNoiseFactor: 1,
  zonesMinMaxRatio: 0.03,
};

function Zones2DOptionPanel() {
  const dispatch = useDispatch();

  function handleZonesPicking(values: any) {
    dispatch({
      type: 'AUTO_ZONES_DETECTION',
      payload: values,
    });
  }

  function handleChangeNoiseFactory(values: any) {
    dispatch({ type: 'CHANGE_ZONES_NOISE_FACTOR', payload: values });
  }

  const {
    handleSubmit,
    formState: { isValid },
    control,
  } = useForm<ZoneDetectionOptions>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  return (
    <HeaderWrapper>
      <Label title="Noise factor:" style={headerLabelStyle}>
        <NumberInput2Controller
          control={control}
          name="zonesNoiseFactor"
          min={0}
          stepSize={1}
          debounceTime={250}
          style={{ width: '50px' }}
        />
      </Label>
      <Label title="Min/max ratio:" style={headerLabelStyle}>
        <NumberInput2Controller
          control={control}
          name="zonesMinMaxRatio"
          min={0}
          stepSize={0.01}
          majorStepSize={0.01}
          minorStepSize={0.01}
          debounceTime={250}
          style={{ width: '50px' }}
          onValueChange={() => {
            void handleSubmit(handleChangeNoiseFactory)();
          }}
        />
      </Label>
      <Button
        intent="success"
        onClick={() => handleSubmit(handleZonesPicking)()}
        style={{ margin: '0 10px' }}
        disabled={!isValid}
      >
        Auto Zones Picking
      </Button>
    </HeaderWrapper>
  );
}

export default Zones2DOptionPanel;
