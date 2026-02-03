import { Button, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { ACSExportOptions } from '@zakodium/nmrium-core';
import { rangesToACS } from 'nmr-processing';
import { useForm, useWatch } from 'react-hook-form';
import * as Yup from 'yup';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { usePreferences } from '../context/PreferencesContext.tsx';
import { CheckController } from '../elements/CheckController.tsx';
import { EmptyText } from '../elements/EmptyText.js';
import { Input2Controller } from '../elements/Input2Controller.tsx';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { Select2Controller } from '../elements/Select2Controller.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import { useActiveNucleusTab } from '../hooks/useActiveNucleusTab.ts';
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

type ExportFormatType = 'IMJA' | 'IMJ' | 'D';

type ExportSignalKind = ACSExportOptions['signalKind'];

const validationSchema = Yup.object().shape({
  signalKind: Yup.string()
    .oneOf(['all', 'signal'] as ExportSignalKind[])
    .required(),
  ascending: Yup.boolean().required(),
  format: Yup.string().required(),
  couplingFormat: Yup.string().required(),
  deltaFormat: Yup.string().required(),
});

const exportOptions: Array<SelectItem<ExportSignalKind>> = [
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

const defaultOptions = {
  signalKind: 'signal',
  ascending: true,
  format: 'IMJA',
  couplingFormat: '0.00',
  deltaFormat: '0.00',
};

function useACSSettings() {
  const nucleus = useActiveNucleusTab();
  const { current } = usePreferences();
  return current.acsExportSettings[nucleus] || defaultOptions;
}

function InnerPublicationStringModal(props: InnerPublicationStringModalProps) {
  const { onClose, onCopyClick } = props;
  const spectrum = useSpectrum();
  const { dispatch } = usePreferences();
  const currentACSOptions = useACSSettings();
  const { control } = useForm<ACSExportOptions>({
    defaultValues: currentACSOptions,
    resolver: yupResolver(validationSchema),
  });

  const options = useWatch({ control });

  if (!spectrum || !isSpectrum1D(spectrum)) return null;

  const {
    info,
    ranges: { values },
  } = spectrum;

  const { originFrequency: observedFrequency, nucleus } = info;

  const { signalKind, format, couplingFormat, ...otherOptions } = options;

  const ranges =
    signalKind === 'all'
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

  function onCopy() {
    onCopyClick(value);
  }

  function onSave() {
    dispatch({
      type: 'CHANGE_EXPORT_ACS_SETTINGS',
      payload: { options: options as ACSExportOptions, nucleus },
    });
    onClose();
  }

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
            name="signalKind"
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
            <>
              <CopyPreviewButton onClick={onCopy} icon="duplicate" />
              {/* eslint-disable-next-line react/no-danger */}
              <div dangerouslySetInnerHTML={{ __html: value }} />
            </>
          )}
        </Body>
      </StyledDialogBody>
      <DialogFooter
        actions={
          <Button onClick={onSave} intent="success">
            Apply and close
          </Button>
        }
      />
    </Dialog>
  );
}

const CopyPreviewButton = styled(Button)`
  float: right;
  margin-left: 5px;
  margin-bottom: 5px;
`;
