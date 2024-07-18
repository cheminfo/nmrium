/** @jsxImportSource @emotion/react */
import { Checkbox, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Spectrum } from 'nmr-load-save';
import { useForm } from 'react-hook-form';

import {
  DataExportStage,
  ExportAsJcampOptions,
  exportAsJcamp,
} from '../../data/SpectraManager';
import { useToaster } from '../context/ToasterContext';
import ActionButtons from '../elements/ActionButtons';
import Label, { LabelStyle } from '../elements/Label';
import { Select2Controller } from '../elements/Select2Controller';
import useSpectrum from '../hooks/useSpectrum';

const initValues: ExportAsJcampOptions = {
  onlyReal: true,
  dataExportStage: 'PROCESSED',
};

const labelStyle: LabelStyle = {
  wrapper: { display: 'flex', height: '100%', flex: 1 },
  container: { alignItems: 'flex-start' },
  label: { paddingTop: '5px', width: 80 },
};

const DATA_STAGES = Object.keys(DataExportStage).map((key) => ({
  label: key,
  value: DataExportStage[key],
}));

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

function InnerExportAsJcampModal(props: Required<InnerExportAsJCAMPProps>) {
  const { closeDialog, spectrum } = props;
  const { control, handleSubmit, register } = useForm<ExportAsJcampOptions>({
    defaultValues: initValues,
  });
  const toaster = useToaster();

  function submitHandler(options: ExportAsJcampOptions) {
    const hideLoading = toaster.showLoading({
      message: 'export as JCAMP-DX in progress',
    });
    try {
      exportAsJcamp(spectrum, options);
    } catch (error: any) {
      toaster.show({ message: error.message, intent: 'danger' });
    } finally {
      closeDialog?.();
      hideLoading();
    }
  }

  return (
    <Dialog
      isOpen
      style={{ width: 400 }}
      onClose={closeDialog}
      title="Export as JCAMP"
    >
      <DialogBody
        css={css`
          background-color: white;
          padding: 1.5em 3em;
        `}
      >
        <Label title="Data" style={labelStyle}>
          <Select2Controller
            control={control}
            name="dataExportStage"
            items={DATA_STAGES}
          />
        </Label>
        <Label title="Only real" style={labelStyle}>
          <Checkbox {...register('onlyReal')} />
        </Label>
      </DialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => void handleSubmit(submitHandler)()}
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
