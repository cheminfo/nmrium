import { Button, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { RangesToACSOptions } from 'nmr-processing';
import { rangesToACS } from 'nmr-processing';
import { useForm, useWatch } from 'react-hook-form';
import { FaCopy } from 'react-icons/fa';
import * as Yup from 'yup';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { CheckController } from '../elements/CheckController.tsx';
import { EmptyText } from '../elements/EmptyText.js';
import { Input2Controller } from '../elements/Input2Controller.tsx';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { Select2Controller } from '../elements/Select2Controller.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import useSpectrum from '../hooks/useSpectrum.js';

const Body = styled.div`
  border: 1px solid #e9e9e9;
  min-height: 180px;
  padding: 5px;
  width: 100%;
`;

const labelStyle: LabelStyle = {
  label: {
    color: '#232323',
    width: '150px',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  container: { padding: '5px 0' },
};

interface SelectItem<T> {
  label: string;
  value: T;
}

type ExportScope = 'all' | 'signal';
type ExportFormatType = 'IMJA' | 'IMJ' | 'D';

interface ExportACSOptions
  extends Required<
    Pick<
      RangesToACSOptions,
      'ascending' | 'format' | 'couplingFormat' | 'deltaFormat'
    >
  > {
  scope: ExportScope;
}

const defaultOptions: ExportACSOptions = {
  scope: 'signal',
  ascending: true,
  format: 'IMJA',
  couplingFormat: '0.00',
  deltaFormat: '0.00',
};

const validationSchema = Yup.object().shape({
  scope: Yup.string()
    .oneOf(['all', 'signal'] as ExportScope[])
    .required(),
  ascending: Yup.boolean().required(),
  format: Yup.string().required(),
  couplingFormat: Yup.string().required(),
  deltaFormat: Yup.string().required(),
});

const exportOptions: Array<SelectItem<ExportScope>> = [
  {
    label: 'Export all',
    value: 'all',
  },
  {
    label: 'Export only signals',
    value: 'signal',
  },
];
const exportFormats: Array<SelectItem<ExportFormatType>> = [
  {
    label: 'Delta',
    value: 'D',
  },
  {
    label: 'Delta, Intensity, Multiplicity, Couplings, Assignment',
    value: 'IMJA',
  },
  {
    label: 'Delta, Intensity, Multiplicity, Couplings',
    value: 'IMJ',
  },
];

interface InnerPublicationStringModalProps {
  onClose: () => void;
  onCopyClick: (text: string) => void;
}

interface PublicationStringModalProps extends InnerPublicationStringModalProps {
  isOpen: boolean;
}

export function PublicationStringModal(props: PublicationStringModalProps) {
  const { isOpen, ...otherProps } = props;

  if (!isOpen) return;

  return <InnerPublicationStringModal {...otherProps} />;
}

function InnerPublicationStringModal(props: InnerPublicationStringModalProps) {
  const { onClose, onCopyClick } = props;
  const spectrum = useSpectrum();

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { control, handleSubmit } = useForm<ExportACSOptions>({
    defaultValues: defaultOptions,
    resolver: yupResolver(validationSchema),
  });

  const options = useWatch({ control });

  if (!spectrum || !isSpectrum1D(spectrum)) return null;

  const {
    info,
    ranges: { values },
  } = spectrum;

  const { originFrequency: observedFrequency, nucleus } = info;

  const { scope, format, couplingFormat, ...otherOptions } = options;

  const ranges =
    scope === 'all'
      ? values
      : values.filter((range) =>
          range.signals?.some((signal) => signal.kind === 'signal'),
        );

  const value = rangesToACS(ranges, {
    nucleus,
    observedFrequency,
    ...otherOptions,
    ...(format !== 'D' ? { format, couplingFormat } : { format: '' }),
  });

  return (
    <Dialog
      isOpen
      title="Publication string"
      onClose={onClose}
      style={{ minWidth: 600 }}
    >
      <StyledDialogBody>
        <Label title="Export filter" style={labelStyle}>
          <Select2Controller
            control={control}
            name="scope"
            items={exportOptions}
          />
        </Label>
        <Label title="Export format" style={labelStyle}>
          <Select2Controller
            control={control}
            name="format"
            items={exportFormats}
          />
        </Label>
        <Label title="Ascending order" style={labelStyle}>
          <CheckController control={control} name="ascending" />
        </Label>
        <Label title="Delta format" style={labelStyle}>
          <Input2Controller name={`deltaFormat`} control={control} />
        </Label>
        <Label title="Couplings format" style={labelStyle}>
          <Input2Controller name={`couplingFormat`} control={control} />
        </Label>

        <Body>
          {!value ? (
            <EmptyText text="No publication string" />
          ) : (
            <div dangerouslySetInnerHTML={{ __html: value }} />
          )}
        </Body>
      </StyledDialogBody>
      <DialogFooter>
        <Button
          onClick={() => onCopyClick(value)}
          intent="success"
          icon={<FaCopy />}
        />
      </DialogFooter>
    </Dialog>
  );
}
