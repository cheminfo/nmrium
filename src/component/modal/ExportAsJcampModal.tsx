import { Dialog, DialogFooter } from '@blueprintjs/core';
import type { Spectrum } from 'nmr-load-save';
import { useRef } from 'react';

import type { DataExportStage } from '../../data/SpectraManager.js';
import { exportAsJcamp } from '../../data/SpectraManager.js';
import { useToaster } from '../context/ToasterContext.js';
import ActionButtons from '../elements/ActionButtons.js';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { Select2 } from '../elements/Select2.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import useSpectrum from '../hooks/useSpectrum.js';

interface ExportDataTypeItem {
  label: string;
  value: DataExportStage;
}

const originalFidExportDataTypes: ExportDataTypeItem[] = [
  {
    label: 'Original FID',
    value: 'originalFid',
  },
];

const originalFtDataTypes: ExportDataTypeItem[] = [
  {
    label: 'Original FT real',
    value: 'originalFtReal',
  },
  {
    label: 'Original FT real and imaginary',
    value: 'originalFtRealImaginary',
  },
];
const processedDataTypes: ExportDataTypeItem[] = [
  {
    label: 'Processed real',
    value: 'processedReal',
  },
  {
    label: 'Processed real and imaginary',
    value: 'processedRealImaginary',
  },
];

const labelStyle: LabelStyle = {
  wrapper: { display: 'flex', height: '100%', flex: 1 },
  container: { alignItems: 'flex-start' },
  label: { paddingTop: '5px', width: 80 },
};
interface InnerExportAsJCAMPProps {
  closeDialog: () => void;
  spectrum?: Spectrum;
}
interface ExportAsJCAMPProps extends InnerExportAsJCAMPProps {
  exportActiveSpectrum?: boolean;
}

function ExportAsJcampModal(props: ExportAsJCAMPProps) {
  const { spectrum, exportActiveSpectrum = false } = props;
  const activeSpectrum = useSpectrum();

  if (!exportActiveSpectrum && !spectrum) {
    return null;
  }

  if (exportActiveSpectrum && !activeSpectrum) return null;

  const currentSpectrum = exportActiveSpectrum ? activeSpectrum : spectrum;

  if (!currentSpectrum) return null;

  return <InnerExportAsJcampModal spectrum={currentSpectrum} {...props} />;
}

function getExportDataTypes(spectrum: Spectrum) {
  const { originalInfo, filters } = spectrum;

  const menuItems: ExportDataTypeItem[] = [];
  if (originalInfo?.isFt) {
    menuItems.push(...originalFtDataTypes);
  }

  if (originalInfo?.isFid) {
    menuItems.push(...originalFidExportDataTypes);
  }

  if (filters?.length > 0) {
    menuItems.push(...processedDataTypes);
  }

  return menuItems;
}

function InnerExportAsJcampModal(props: Required<InnerExportAsJCAMPProps>) {
  const { closeDialog, spectrum } = props;
  const toaster = useToaster();
  const exportDataTypes = getExportDataTypes(spectrum);
  const exportDataAsRef = useRef<DataExportStage>(exportDataTypes[0].value);

  function submitHandler() {
    const hideLoading = toaster.showLoading({
      message: 'export as JCAMP-DX in progress',
    });
    try {
      exportAsJcamp(spectrum, exportDataAsRef.current);
    } catch (error: any) {
      toaster.show({ message: error.message, intent: 'danger' });
    } finally {
      closeDialog?.();
      hideLoading();
    }
  }

  function handleChangeExportDataType(data) {
    exportDataAsRef.current = data.value;
  }

  return (
    <Dialog
      isOpen
      style={{ width: 400 }}
      onClose={closeDialog}
      title="Export as JCAMP"
    >
      <StyledDialogBody padding="1.5em 3em">
        <Label title="Data" style={labelStyle}>
          <Select2
            defaultSelectedItem={exportDataTypes[0]}
            onItemSelect={handleChangeExportDataType}
            items={exportDataTypes}
          />
        </Label>
      </StyledDialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={submitHandler}
          doneLabel="export"
          onCancel={() => {
            closeDialog?.();
          }}
        />
      </DialogFooter>
    </Dialog>
  );
}

export default ExportAsJcampModal;
