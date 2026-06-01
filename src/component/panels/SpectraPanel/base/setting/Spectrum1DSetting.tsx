import { Controller, FormProvider, useForm } from 'react-hook-form';
import { ColorPicker } from 'react-science/ui';

import { COLORS } from '../../../../../data/utilities/generateColor.js';
import { colorToHexWithAlpha } from '../../../../utility/colorToHexWithAlpha.js';

import { ApplyToAllSelected } from './ApplyToAllSelected.tsx';
import Spectrum1DHistogram from './Spectrum1DHistogram.js';

interface Spectrum1DSettingProps {
  data: any;
  onSubmit: (values: any) => void;
}

export function Spectrum1DSetting({ data, onSubmit }: Spectrum1DSettingProps) {
  const { display, data: spectrumData } = data;
  const methods = useForm({
    defaultValues: { display, applyToAll: false },
  });
  const { control, handleSubmit } = methods;

  return (
    <FormProvider {...methods}>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <ApplyToAllSelected />

        <div
          style={{ display: 'block', position: 'relative', margin: '0 auto' }}
        >
          <Controller
            name="display.color"
            control={control}
            render={({ field }) => {
              const { value, onChange } = field;
              return (
                <ColorPicker
                  onChangeComplete={(color) => {
                    onChange(colorToHexWithAlpha(color));
                    void handleSubmit(onSubmit)();
                  }}
                  color={{ hex: value || '#000' }}
                  presetColors={COLORS}
                  style={{ boxShadow: 'none', width: 250 }}
                />
              );
            }}
          />
        </div>
        <Spectrum1DHistogram color="red" data={spectrumData} />
      </div>
    </FormProvider>
  );
}
