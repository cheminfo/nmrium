import { Controller, FormProvider, useForm } from 'react-hook-form';

import { COLORS } from '../../../../../data/utilities/generateColor.js';
import { CustomColorPicker } from '../../../../elements/custom-color-picker.tsx';

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
          style={{
            display: 'block',
            position: 'relative',
            margin: '0 auto 10px',
          }}
        >
          <Controller
            name="display.color"
            control={control}
            render={({ field }) => {
              const { value, onChange } = field;
              return (
                <CustomColorPicker
                  presetColors={COLORS}
                  color={{ hex: value || '#000' }}
                  onChange={(color) => {
                    onChange(color.hex);
                    void handleSubmit(onSubmit)();
                  }}
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
