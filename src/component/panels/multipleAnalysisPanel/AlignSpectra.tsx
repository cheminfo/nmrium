/** @jsxImportSource @emotion/react */
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { xFindClosestIndex } from 'ml-spectra-processing';
import { Spectrum1D } from 'nmr-load-save';
import { useMemo } from 'react';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { REFERENCES } from '../../../data/constants/References';
import { CalibrateOptions } from '../../../data/data1d/Spectrum1D/getReferenceShift';
import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import ActionButtons from '../../elements/ActionButtons';
import Label, { LabelStyle } from '../../elements/Label';
import { NumberInput2Controller } from '../../elements/NumberInput2Controller';
import { Select2 } from '../../elements/Select2';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus';
import { useEvent } from '../../utility/Events';

const labelStyle: LabelStyle = {
  label: { flex: 4, fontWeight: '500' },
  wrapper: { flex: 8, display: 'flex', alignItems: 'center' },
  container: { padding: '5px 0' },
};

const baseList = [{ key: 1, value: 'manual', label: 'Manual' }];

interface AlignSpectraProps {
  nucleus: any;
  onClose: () => void;
}

const DEFAULT_OPTIONS: CalibrateOptions = {
  from: -1,
  to: 1,
  nbPeaks: 1,
  targetX: 0,
};

const schemaValidation = Yup.object({
  from: Yup.number().required(),
  to: Yup.number().required(),
  nbPeaks: Yup.number().required(),
  targetX: Yup.number().required(),
});

function checkSpectra(options: CalibrateOptions, spectra: Spectrum1D[]) {
  const { from, to } = options;
  for (const spectrum of spectra) {
    const {
      data: { x },
    } = spectrum;
    const min = x[0];
    const max = x.at(-1) as number;
    if (from < min || to > max) {
      throw new Error('Some spectra do not have data in the selected range');
    }
    if (Math.abs(xFindClosestIndex(x, from) - xFindClosestIndex(x, to)) < 10) {
      throw new Error(
        'The selected range is too small to provide accurate results',
      );
    }
  }
}

function checkOptions(options: CalibrateOptions) {
  const returnedOptions = { ...options };
  if (options.from > options.to) {
    returnedOptions.to = options.from;
    returnedOptions.from = options.to;
  }
  return returnedOptions;
}

function getList(nucleus) {
  if (!REFERENCES?.[nucleus]) {
    return [];
  }
  const list = Object.entries(REFERENCES[nucleus]).map((item) => ({
    value: item[0],
    label: item[0],
  }));

  return baseList.concat(list as any);
}

const Container = styled.div`
  max-height: 100%;
  padding: 10px 0 5px 20px;
  display: flex;
  flex-direction: column;
  flex: 1;

  .body {
    overflow: auto;
    padding: 10px 10px 25px 0;
  }

  .header {
    padding: 5px 0;
    font-size: 15px;
    font-weight: bold;
  }

  .footer {
    display: flex;
    padding-top: 5px;
  }
`;

function AlignSpectra({ onClose = () => null, nucleus }: AlignSpectraProps) {
  const spectra = useSpectraByActiveNucleus();
  const dispatch = useDispatch();
  const toaster = useToaster();
  const { handleSubmit, reset, control, getValues } = useForm<CalibrateOptions>(
    {
      defaultValues: DEFAULT_OPTIONS,
      resolver: yupResolver(schemaValidation),
    },
  );

  function submitHandler(inputOptions) {
    const options = checkOptions(inputOptions);
    reset(options);
    try {
      checkSpectra(options, spectra as Spectrum1D[]);

      dispatch({ type: 'ALIGN_SPECTRA', payload: options });
      onClose();
    } catch (error: unknown) {
      const message = (error as Error).message;

      toaster.show({ intent: 'danger', message });
    }
  }

  useEvent({
    onBrushEnd: (options) => {
      const {
        range: [from, to],
        shiftKey,
      } = options;
      if (shiftKey) {
        reset({ ...getValues(), from, to });
      }
    },
  });

  function optionChangeHandler({ value: key }) {
    const { delta: targetX = 0, ...otherOptions } =
      REFERENCES?.[nucleus]?.[key] || {};
    const value = {
      ...DEFAULT_OPTIONS,
      targetX,
      ...otherOptions,
    };
    reset(value);
  }
  const List = useMemo(() => getList(nucleus), [nucleus]);

  return (
    <Container>
      <div className="body" style={{ flex: 1 }}>
        <div className="header">
          <span>Spectra calibration</span>
        </div>
        <Label title="Options" style={labelStyle}>
          <Select2
            items={List}
            onItemSelect={optionChangeHandler}
            defaultSelectedItem={List[0]}
          />
        </Label>

        <Label title="Range" style={labelStyle}>
          <Label title="From">
            <NumberInput2Controller control={control} name="from" fill />
          </Label>
          <Label title="To" style={{ label: { padding: '0 10px' } }}>
            <NumberInput2Controller control={control} name="to" fill />
          </Label>
        </Label>

        <Label title="Number of peaks" style={labelStyle}>
          <NumberInput2Controller control={control} name="nbPeaks" fill />
        </Label>
        <Label title="Target PPM" style={labelStyle}>
          <NumberInput2Controller control={control} name="targetX" fill />
        </Label>
      </div>
      <div className="footer">
        <ActionButtons
          onDone={() => handleSubmit(submitHandler)()}
          onCancel={onClose}
        />
      </div>
    </Container>
  );
}

export default AlignSpectra;
