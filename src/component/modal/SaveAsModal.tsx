import {
  Checkbox,
  Dialog,
  DialogFooter,
  Radio,
  RadioGroup,
} from '@blueprintjs/core';
import { useMemo } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { DataExportOptions } from '../../data/SpectraManager.js';
import { useChartData } from '../context/ChartContext.js';
import ActionButtons from '../elements/ActionButtons.js';
import { Input2Controller } from '../elements/Input2Controller.js';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import type { SaveOptions } from '../hooks/useExport.js';
import { useExport } from '../hooks/useExport.js';

const INITIAL_VALUE: SaveOptions = {
  name: '',
  include: {
    dataType: DataExportOptions.SELF_CONTAINED,
    view: false,
    settings: false,
  },
};

export const labelStyle: LabelStyle = {
  label: {
    flex: 4,
    color: '#232323',
  },
  wrapper: {
    flex: 8,
    display: 'flex',
    justifyContent: 'flex-start',
  },
  container: { padding: '5px 0' },
};

interface InnerSaveAsModalProps {
  onCloseDialog: () => void;
}
interface SaveAsModalProps extends InnerSaveAsModalProps {
  isOpen: boolean;
}

function SaveAsModal(props: SaveAsModalProps) {
  const { onCloseDialog, isOpen } = props;

  if (!isOpen) return;

  return <InnerSaveAsModal onCloseDialog={onCloseDialog} />;
}

function InnerSaveAsModal(props: InnerSaveAsModalProps) {
  const { onCloseDialog } = props;
  const { data, aggregator } = useChartData();
  const { saveHandler } = useExport();
  const fileName = data[0]?.info?.name;

  function submitHandler(values: SaveOptions) {
    saveHandler(values);
    onCloseDialog?.();
  }

  const { handleSubmit, control, register } = useForm({
    defaultValues: { ...INITIAL_VALUE, name: fileName },
  });

  const containsLinkedFiles = useMemo(() => {
    return aggregator.sources.some((s) => !s.baseURL?.startsWith('ium:'));
  }, [aggregator]);

  return (
    <Dialog
      isOpen
      title="Save as ... "
      onClose={onCloseDialog}
      style={{ width: 600 }}
    >
      <StyledDialogBody>
        <Label style={labelStyle} title="Name">
          <Input2Controller
            name="name"
            control={control}
            fill
            controllerProps={{ rules: { required: true } }}
          />
        </Label>
        <Label style={labelStyle} title="Include view">
          <Checkbox style={{ margin: 0 }} {...register(`include.view`)} />
        </Label>
        <Label style={labelStyle} title="Include workspace">
          <Checkbox style={{ margin: 0 }} {...register(`include.settings`)} />
        </Label>
        <Label style={labelStyle} title="Include data">
          <Controller
            name="include.dataType"
            control={control}
            render={({ field }) => {
              const { value, ref, ...otherFieldProps } = field;
              return (
                <RadioGroup inline selectedValue={value} {...otherFieldProps}>
                  <Radio
                    label="External data embed"
                    value={DataExportOptions.SELF_CONTAINED}
                  />
                  <Radio
                    label="External data linked"
                    disabled={!containsLinkedFiles}
                    value={DataExportOptions.SELF_CONTAINED_EXTERNAL_DATASOURCE}
                  />
                </RadioGroup>
              );
            }}
          />
        </Label>
      </StyledDialogBody>
      <DialogFooter>
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => {
            void handleSubmit(submitHandler)();
          }}
          doneLabel="Save"
          onCancel={() => onCloseDialog?.()}
        />
      </DialogFooter>
    </Dialog>
  );
}

export default SaveAsModal;
