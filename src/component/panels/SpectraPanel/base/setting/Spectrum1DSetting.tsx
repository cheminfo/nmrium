import { Controller, useForm } from 'react-hook-form';
import { ColorPicker } from 'react-science/ui';

import { COLORS } from '../../../../../data/utilities/generateColor.js';
import { colorToHexWithAlpha } from '../../../../utility/colorToHexWithAlpha.js';

import Spectrum1DHistogram from './Spectrum1DHistogram.js';

interface Spectrum1DSettingProps {
  data: any;
  onSubmit: (values: any) => void;
}

function Spectrum1DSetting({
  data: SpectrumData,
  onSubmit,
}: Spectrum1DSettingProps) {
  const { control, handleSubmit } = useForm({
    defaultValues: SpectrumData.display,
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
      <div style={{ display: 'block', position: 'relative' }}>
        <Controller
          name="color"
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
                style={{ boxShadow: 'none' }}
              />
            );
          }}
        />
      </div>
      <Spectrum1DHistogram color="red" data={SpectrumData.data} />
    </div>
  );
}

export default Spectrum1DSetting;
