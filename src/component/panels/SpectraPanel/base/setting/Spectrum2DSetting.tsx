/** @jsxImportSource @emotion/react */
import { RangeSlider } from '@blueprintjs/core';
import { css } from '@emotion/react';
import debounce from 'lodash/debounce.js';
import { useMemo } from 'react';
import {
  Controller,
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { ColorPicker } from 'react-science/ui';

import { COLORS } from '../../../../../data/utilities/generateColor.js';
import { NumberInput2 } from '../../../../elements/NumberInput2.js';
import { useFormValidateField } from '../../../../elements/useFormValidateField.js';
import { colorToHexWithAlpha } from '../../../../utility/colorToHexWithAlpha.js';

import Spectrum2DHistogram from './Spectrum2DHistogram.js';

interface Spectrum2DSettingProps {
  data: any;
  onSubmit: (values: any) => void;
}

const style = (color: string) => css`
  display: inline-block;

  .track-1 {
    background-color: ${color} !important;
  }
`;

function Spectrum2DSetting({
  data: SpectrumData,
  onSubmit,
}: Spectrum2DSettingProps) {
  const { positiveColor, negativeColor } = SpectrumData.display;
  const methods = useForm({ defaultValues: SpectrumData.display });

  return (
    <FormProvider {...methods}>
      <div>
        <div css={style(positiveColor)}>
          <span style={{ padding: '0 10px' }}>Positive</span>
          <Settings sign="positive" onSubmit={onSubmit} />
        </div>
        <div css={style(negativeColor)}>
          <span style={{ padding: '0 10px' }}>Negative</span>
          <Settings sign="negative" onSubmit={onSubmit} />
        </div>
        <Spectrum2DHistogram data={SpectrumData.data} />
      </div>
    </FormProvider>
  );
}

interface SettingsProps {
  sign: 'positive' | 'negative';
  onSubmit: (values: any) => void;
}

function Settings(props: SettingsProps) {
  const { sign, onSubmit } = props;
  const { control, handleSubmit } = useFormContext();
  const isValid = useFormValidateField();
  const progressColor = useWatch({ name: `${sign}Color` });

  const debounceOnSubmit = useMemo(
    () =>
      debounce((onSubmit) => {
        void handleSubmit(onSubmit)();
      }, 250),
    [handleSubmit],
  );

  return (
    <>
      <Controller
        name={`${sign}Color`}
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
      <div style={{ padding: '5px' }}>
        <span className="label">contour Levels [ min - max ]</span>
        <Controller
          name={`contourOptions.${sign}.contourLevels`}
          control={control}
          render={({ field }) => {
            const { value, onChange } = field;

            return (
              <RangeSlider
                min={0}
                max={100}
                stepSize={1}
                labelStepSize={10}
                onChange={(e) => {
                  onChange(e);
                  debounceOnSubmit(onSubmit);
                }}
                value={value}
                showTrackFill
                css={css`
                  width: 90%;

                  [class*='slider-progress']:nth-child(2) {
                    background-color: ${progressColor};
                  }
                `}
              />
            );
          }}
        />
        <span className="label">number of Layers </span>
        <Controller
          control={control}
          name={`contourOptions.${sign}.numberOfLayers`}
          rules={{ required: true }}
          render={({ field }) => {
            return (
              <NumberInput2
                {...field}
                onValueChange={(valueAsNumber) => {
                  field.onChange(valueAsNumber);
                  void handleSubmit(onSubmit)();
                }}
                intent={!isValid(field.name) ? 'danger' : 'none'}
                style={{ width: 60 }}
                min={0}
                debounceTime={250}
              />
            );
          }}
        />
      </div>
    </>
  );
}

export default Spectrum2DSetting;
