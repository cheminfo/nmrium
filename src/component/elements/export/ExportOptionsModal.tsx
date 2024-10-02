/** @jsxImportSource @emotion/react */
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Tag,
} from '@blueprintjs/core';
import { css } from '@emotion/react';
import { UniversalExportSettings } from 'nmr-load-save';
import { useForm } from 'react-hook-form';

import ActionButtons from '../ActionButtons';
import { CheckController } from '../CheckController';
import Label, { LabelStyle } from '../Label';
import { NumberInput2Controller } from '../NumberInput2Controller';
import { Select2Controller } from '../Select2Controller';

import { BaseExportProps, INITIAL_EXPORT_OPTIONS } from './ExportContent';
import { units } from './units';
import { useExportConfigurer } from './useExportConfigurer';

interface InnerExportOptionsModalProps extends BaseExportProps {
  onCloseDialog: () => void;
}
interface ExportOptionsModalProps extends InnerExportOptionsModalProps {
  isOpen: boolean;
}

export function ExportOptionsModal(props: ExportOptionsModalProps) {
  const { isOpen, ...otherProps } = props;

  if (!isOpen) return;

  return <InnerExportOptionsModal {...otherProps} />;
}

const labelStyle: LabelStyle = {
  label: {
    color: '#232323',
    width: '80px',
  },
  wrapper: {
    display: 'flex',
    justifyContent: 'flex-start',
  },
  container: { margin: '5px 0' },
};

function InnerExportOptionsModal(props: InnerExportOptionsModalProps) {
  const { onCloseDialog, onExportOptionsChange, defaultExportOptions } = props;
  const defaultValues = { ...INITIAL_EXPORT_OPTIONS, ...defaultExportOptions };
  function submitHandler(values) {
    onExportOptionsChange(values);
  }

  const methods = useForm<UniversalExportSettings>({
    defaultValues,
  });
  const { handleSubmit, control, watch, setValue } = methods;

  const { unit, width, height, dpi, useDefaultSettings } = watch();

  const {
    widthInPixel,
    heightInPixel,
    isAspectRatioEnabled,
    changeDPI,
    enableAspectRatio,
    changeSize,
    changeUnit,
  } = useExportConfigurer({
    unit,
    width,
    height,
    dpi,
    useDefaultSettings,
  });

  return (
    <Dialog
      isOpen
      title="Export options"
      onClose={onCloseDialog}
      style={{ width: 600 }}
    >
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <Label style={labelStyle} title="Description:">
          <Tag>{`${widthInPixel} px x ${heightInPixel} px @ ${unit}DPI`}</Tag>
        </Label>
        <Label style={labelStyle} title="Size">
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <NumberInput2Controller
              name="width"
              control={control}
              style={{ width: 100 }}
              rightElement={<Tag>{unit}</Tag>}
              controllerProps={{ rules: { required: true } }}
              transformValue={(value) => {
                const newHeight = changeSize(value, 'height', 'width');
                setValue('height', newHeight);
                return value;
              }}
              debounceTime={250}
              placeholder="width"
            />
            <div style={{ padding: '0px 5px' }}>
              <Button
                icon="link"
                minimal
                active={isAspectRatioEnabled}
                onClick={() => {
                  enableAspectRatio((prevFlag) => !prevFlag);
                }}
              />
            </div>
            <NumberInput2Controller
              name="height"
              control={control}
              style={{ width: 100 }}
              rightElement={<Tag>{unit}</Tag>}
              controllerProps={{ rules: { required: true } }}
              transformValue={(value) => {
                const newWidth = changeSize(value, 'width', 'height');
                setValue('width', newWidth);
                return value;
              }}
              debounceTime={250}
              placeholder="height"
            />
          </div>
        </Label>
        <Label style={labelStyle} title="Units">
          <Select2Controller
            control={control}
            name="unit"
            itemTextKey="name"
            itemValueKey="unit"
            items={units}
            onItemSelect={({ unit }) => {
              const newSize = changeUnit({ unit });
              setValue('width', newSize.width);
              setValue('height', newSize.height);
            }}
          />
        </Label>
        <Label style={labelStyle} title="DPI">
          <NumberInput2Controller
            name="dpi"
            control={control}
            style={{ width: 100 }}
            controllerProps={{ rules: { required: true } }}
            transformValue={(value) => {
              if (unit === 'px') {
                const convertedValue = changeDPI(value);
                setValue('width', convertedValue.width);
                setValue('height', convertedValue.height);
              }

              return value;
            }}
            debounceTime={250}
            placeholder="DPI"
          />
        </Label>
      </DialogBody>
      <DialogFooter>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'baseline',
          }}
        >
          <CheckController
            control={control}
            name="useDefaultSettings"
            style={{ fontSize: '12px' }}
            label="Don't show options dialog next time and use those settings"
          />

          <ActionButtons
            style={{ flexDirection: 'row-reverse', margin: 0 }}
            onDone={() => {
              void handleSubmit(submitHandler)();
            }}
            doneLabel="Save"
            onCancel={() => onCloseDialog?.()}
          />
        </div>
      </DialogFooter>
    </Dialog>
  );
}
