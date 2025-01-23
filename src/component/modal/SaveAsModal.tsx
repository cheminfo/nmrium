import {
  Checkbox,
  Dialog,
  DialogFooter,
  Radio,
  RadioGroup,
} from '@blueprintjs/core';
import { Controller, useForm } from 'react-hook-form';

import { DataExportOptions } from '../../data/SpectraManager.js';
import { useChartData } from '../context/ChartContext.js';
import ActionButtons from '../elements/ActionButtons.js';
import { Input2Controller } from '../elements/Input2Controller.js';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';
import { useExport } from '../hooks/useExport.js';

const INITIAL_VALUE = {
  name: '',
  compressed: false,
  pretty: false,
  include: {
    dataType: DataExportOptions.ROW_DATA,
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
  const { source, data } = useChartData();
  const { saveHandler } = useExport();

  const fileName = data[0]?.info?.name;

  function submitHandler(values) {
    saveHandler(values);
    onCloseDialog?.();
  }

  const { handleSubmit, control, register } = useForm({
    defaultValues: { ...INITIAL_VALUE, name: fileName },
  });
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
        <Label style={labelStyle} title="Compressed">
          <Checkbox style={{ margin: 0 }} {...register(`compressed`)} />
        </Label>
        <Label style={labelStyle} title="Pretty format">
          <Checkbox style={{ margin: 0 }} {...register(`pretty`)} />
        </Label>
        <Label style={labelStyle} title="Include view">
          <Checkbox style={{ margin: 0 }} {...register(`include.view`)} />
        </Label>
        <Label style={labelStyle} title="Include settings">
          <Checkbox style={{ margin: 0 }} {...register(`include.settings`)} />
        </Label>
        <Label style={labelStyle} title="Include data">
          <Controller
            name="include.dataType"
            control={control}
            render={({ field }) => {
              const { value, onChange, ...otherFieldProps } = field;
              return (
                <RadioGroup
                  inline
                  onChange={onChange}
                  selectedValue={value}
                  {...otherFieldProps}
                >
                  <Radio label="Raw data" value={DataExportOptions.ROW_DATA} />
                  <Radio
                    label="Data source"
                    value={DataExportOptions.DATA_SOURCE}
                    disabled={!source}
                  />
                  <Radio label="No data" value={DataExportOptions.NO_DATA} />
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
