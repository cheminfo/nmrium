/** @jsxImportSource @emotion/react */
import {
  Button,
  Dialog,
  DialogBody,
  DialogFooter,
  Radio,
  RadioGroup,
  SegmentedControl,
  Tag,
} from '@blueprintjs/core';
import { css } from '@emotion/react';
import { yupResolver } from '@hookform/resolvers/yup';
import type {
  AdvanceExportSettings,
  BasicExportSettings,
  ExportSettings,
} from 'nmr-load-save';
import { useEffect, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import ActionButtons from '../ActionButtons.js';
import { CheckController } from '../CheckController.js';
import type { LabelStyle } from '../Label.js';
import Label from '../Label.js';
import { NumberInput2Controller } from '../NumberInput2Controller.js';
import { Select2Controller } from '../Select2Controller.js';
import type { SizeItem } from '../print/pageSize.js';
import { getSizesList } from '../print/pageSize.js';

import type { BaseExportProps } from './ExportContent.js';
import { units } from './units.js';
import { useExportConfigurer } from './useExportConfigurer.js';
import { exportOptionValidationSchema } from './utilities/exportOptionValidationSchema.js';
import {
  getExportDefaultOptions,
  getExportDefaultOptionsByMode,
} from './utilities/getExportOptions.js';
import type { Mode } from './utilities/getModes.js';
import { MODES } from './utilities/getModes.js';

interface InnerExportOptionsModalProps extends BaseExportProps {
  onCloseDialog: () => void;
  confirmButtonText?: string;
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
  const {
    onCloseDialog,
    onExportOptionsChange,
    confirmButtonText,
    defaultExportOptions,
  } = props;
  const defaultValues = getExportDefaultOptions(defaultExportOptions);

  const [mode, setMode] = useState<Mode>(defaultValues.mode);

  const methods = useForm<ExportSettings>({
    defaultValues,
    resolver: yupResolver(exportOptionValidationSchema) as any,
  });
  const {
    handleSubmit,
    control,
    watch,
    setValue,
    formState: { isValid, errors },
    reset,
    setFocus,
  } = methods;

  const watchSettings = watch();
  const {
    unit,
    dpi = 0,
    layout,
  } = watchSettings as AdvanceExportSettings & BasicExportSettings;
  const {
    widthInPixel,
    heightInPixel,
    isAspectRatioEnabled,
    changeDPI,
    enableAspectRatio,
    changeSize,
    changeUnit,
  } = useExportConfigurer(watchSettings);

  let sizesList: SizeItem[] = [];

  if (layout) {
    sizesList = getSizesList(layout);
  }

  function handleChangeMode(mode) {
    const options = defaultValues;
    setMode(mode);
    if (options.mode === mode) {
      reset(defaultValues);
    } else {
      reset(getExportDefaultOptionsByMode(mode));
    }
  }

  useEffect(() => {
    const handleRenderComplete = () => {
      setTimeout(() => {
        if (mode === 'advance') {
          setFocus('width');
        } else {
          setFocus('dpi');
        }
      }, 0);
    };

    const handleKeyDown = (event) => {
      if (event.key === 'Enter') {
        void handleSubmit(onExportOptionsChange)();
      }
    };

    globalThis.addEventListener('keydown', handleKeyDown);

    const animationFrameId = requestAnimationFrame(handleRenderComplete);

    return () => {
      cancelAnimationFrame(animationFrameId);
      globalThis.removeEventListener('keydown', handleKeyDown);
    };
  }, [handleSubmit, mode, onExportOptionsChange, setFocus]);

  return (
    <Dialog
      isOpen
      title="Export options"
      onClose={onCloseDialog}
      style={{ width: 600 }}
      canEscapeKeyClose
      autoFocus
    >
      <DialogBody
        css={css`
          background-color: white;
        `}
      >
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            marginBottom: '15px',
          }}
        >
          <SegmentedControl
            defaultValue="list"
            inline
            options={MODES}
            value={mode}
            onValueChange={handleChangeMode}
          />
        </div>

        <Label style={labelStyle} title="Description:">
          <Tag
            intent={
              !isValid && Object.keys(errors).length > 0 ? 'danger' : 'none'
            }
          >{`${widthInPixel} px x ${heightInPixel} px @ ${dpi}DPI`}</Tag>
        </Label>
        {mode === 'basic' && (
          <>
            <Label style={labelStyle} title="Size">
              <Select2Controller
                control={control}
                name="size"
                items={sizesList}
              />
            </Label>
            <Label style={labelStyle} title="Layout">
              <Controller
                name="layout"
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
                      <Radio label="Portrait" value="portrait" />
                      <Radio label="Landscape" value="landscape" />
                    </RadioGroup>
                  );
                }}
              />
            </Label>
          </>
        )}
        {mode === 'advance' && (
          <>
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
          </>
        )}
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
              void handleSubmit(onExportOptionsChange)();
            }}
            doneLabel={confirmButtonText}
            onCancel={() => onCloseDialog?.()}
          />
        </div>
      </DialogFooter>
    </Dialog>
  );
}
