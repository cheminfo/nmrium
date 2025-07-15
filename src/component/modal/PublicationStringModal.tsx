/* eslint-disable react/no-danger */
import { Button, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { rangesToACS } from 'nmr-processing';
import { useState } from 'react';
import { FaCopy } from 'react-icons/fa';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { useChartData } from '../context/ChartContext.js';
import { EmptyText } from '../elements/EmptyText.js';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { Select2 } from '../elements/Select2.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import useSpectrum from '../hooks/useSpectrum.js';

const Body = styled.div`
  padding: 5px;
  width: 100%;
  min-height: 180px;
  border: 1px solid #e9e9e9;
`;

const labelStyle: LabelStyle = {
  label: {
    color: '#232323',
    width: '100px',
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

type ExportType = 'all' | 'signal';
type ExportFormatType = 'IMJA' | 'IMJ';

const exportOptions: Array<SelectItem<ExportType>> = [
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
    label: 'Intensity, Multiplicity, Couplings, Assignment',
    value: 'IMJA',
  },
  {
    label: 'Intensity, Multiplicity, Couplings',
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
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const { deltaPPM, coupling } = usePanelPreferences('ranges', activeTab);
  const spectrum = useSpectrum();

  const [exportType, setExportType] = useState<ExportType>('signal');
  const [exportFormat, setExportFormat] = useState<ExportFormatType>('IMJA');

  if (!spectrum || !isSpectrum1D(spectrum)) return null;

  function handleChangeExportOptions(item) {
    setExportType(item.value);
  }

  function handleChangeExportFormat(item) {
    setExportFormat(item.value);
  }

  const {
    info,
    ranges: { values },
  } = spectrum;

  const { originFrequency: observedFrequency, nucleus } = info;

  const ranges =
    exportType === 'all'
      ? values
      : values.filter((range) =>
          range.signals?.some((signal) => signal.kind === 'signal'),
        );

  const value = rangesToACS(ranges, {
    nucleus,
    deltaFormat: deltaPPM.format,
    couplingFormat: coupling.format,
    observedFrequency,
    format: exportFormat,
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
          <Select2
            defaultSelectedItem={exportOptions[1]}
            onItemSelect={handleChangeExportOptions}
            items={exportOptions}
          />
        </Label>
        <Label title="Export format" style={labelStyle}>
          <Select2
            defaultSelectedItem={exportFormats[0]}
            onItemSelect={handleChangeExportFormat}
            items={exportFormats}
          />
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
