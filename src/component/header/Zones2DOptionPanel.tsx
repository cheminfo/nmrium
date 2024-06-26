import { Button } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import has from 'lodash/has';
import { Controller, useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Label from '../elements/Label';
import { NumberInput2 } from '../elements/NumberInput2';

import { headerLabelStyle } from './Header';
import { HeaderContainer } from './HeaderContainer';

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

  function handleZonesPicking(values) {
    dispatch({
      type: 'AUTO_ZONES_DETECTION',
      payload: values,
    });
  }

  function handleChangeNoiseFactory(values) {
    dispatch({ type: 'CHANGE_ZONES_NOISE_FACTOR', payload: values });
  }

  const {
    handleSubmit,
    formState: { errors, isValid },
    control,
  } = useForm<ZoneDetectionOptions>({
    defaultValues: initialValues,
    resolver: yupResolver(validationSchema),
    mode: 'onChange',
  });

  return (
    <HeaderContainer>
      <Label title="Noise factor:" style={headerLabelStyle}>
        <Controller
          control={control}
          name="zonesNoiseFactor"
          render={({ field }) => {
            return (
              <NumberInput2
                {...field}
                min={0}
                stepSize={1}
                intent={has(errors, 'zonesNoiseFactor') ? 'danger' : 'none'}
                style={{ width: '50px' }}
                debounceTime={250}
                onValueChange={(valueAsNumber, valueAsString) => {
                  field.onChange(valueAsString);
                }}
              />
            );
          }}
        />
      </Label>
      <Label title="Min/max ratio:" style={headerLabelStyle}>
        <Controller
          control={control}
          name="zonesMinMaxRatio"
          render={({ field }) => {
            return (
              <NumberInput2
                {...field}
                min={0}
                stepSize={0.01}
                majorStepSize={0.01}
                minorStepSize={0.01}
                intent={has(errors, 'zonesMinMaxRatio') ? 'danger' : 'none'}
                style={{ width: '50px' }}
                debounceTime={250}
                onValueChange={(valueAsNumber, valueAsString) => {
                  field.onChange(valueAsString);
                  void handleSubmit(handleChangeNoiseFactory)();
                }}
              />
            );
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
    </HeaderContainer>
  );
}

export default Zones2DOptionPanel;
