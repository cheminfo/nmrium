import { Button, DialogFooter, SegmentedControl, Tag } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import type {
  AdvanceExportSettings,
  BasicExportSettings,
} from '@zakodium/nmrium-core';
import { useCallback, useState } from 'react';
import { Form, FormGroup, useForm } from 'react-science/ui';

import { StandardDialog } from '../StandardDialog.tsx';
import { StyledDialogBody } from '../StyledDialogBody.js';
import { getSizesList } from '../print/pageSize.js';

import type { BaseExportProps } from './ExportContent.js';
import { units } from './units.js';
import { useExportConfigurer } from './useExportConfigurer.js';
import { exportOptionValidationSchemaZod } from './utilities/exportOptionValidationSchema.js';
import {
  getExportDefaultOptions,
  getExportDefaultOptionsByMode,
} from './utilities/getExportOptions.js';
import type { Mode } from './utilities/getModes.js';
import { MODES } from './utilities/getModes.js';

interface InnerExportOptionsModalProps extends BaseExportProps {
  onCloseDialog: () => void;
  confirmButtonText: string;
}
interface ExportOptionsModalProps extends InnerExportOptionsModalProps {
  isOpen: boolean;
}

export function ExportOptionsModal(props: ExportOptionsModalProps) {
  const { isOpen, ...otherProps } = props;

  if (!isOpen) return;

  return <InnerExportOptionsModal {...otherProps} />;
}

function InnerExportOptionsModal(props: InnerExportOptionsModalProps) {
  const {
    onCloseDialog,
    defaultExportOptions,
    onExportOptionsChange,
    confirmButtonText,
  } = props;

  const defaultValues = getExportDefaultOptions(defaultExportOptions);
  const [mode, setMode] = useState<Mode>(defaultValues.mode);

  const form = useForm({
    defaultValues: getExportDefaultOptionsByMode(mode),
    validators: {
      onDynamic: exportOptionValidationSchemaZod as any,
    },
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => {
      const parsedValue = exportOptionValidationSchemaZod.parse(value);
      onExportOptionsChange(parsedValue);
    },
  });

  const { unit, layout } = useSelector(form.store, (state) => {
    const { unit, layout } = state.values as AdvanceExportSettings &
      BasicExportSettings;

    return {
      unit,
      layout,
    };
  });

  const { values, isValid, errors } = useSelector(
    form.store,
    ({ values, isValid, errors }) => {
      return {
        values,
        isValid,
        errors,
      };
    },
  );

  const {
    widthInPixel,
    heightInPixel,
    isAspectRatioEnabled,
    changeDPI,
    enableAspectRatio,
    changeSize,
    changeUnit,
  } = useExportConfigurer(values);

  const handleChangeMode = useCallback(
    (mode: Mode) => {
      const newOptions = getExportDefaultOptionsByMode(mode);
      form.reset(newOptions);
      setMode(mode);
    },
    [form],
  );

  return (
    <StandardDialog
      isOpen
      title="Export options"
      onClose={onCloseDialog}
      style={{ width: 600 }}
      canEscapeKeyClose
      autoFocus
    >
      <form.AppForm>
        <Form
          layout="inline"
          noValidate
          onSubmit={(event) => {
            event.preventDefault();
            void form.handleSubmit();
          }}
        >
          <StyledDialogBody>
            <StyledDialogBody>
              <SegmentedControl
                defaultValue="list"
                inline
                options={MODES}
                value={mode}
                onValueChange={(element) => {
                  handleChangeMode(element as Mode);
                }}
              />

              <form.Section title="General informations">
                <FormGroup label="Description">
                  <Tag
                    intent={
                      !isValid && Object.keys(errors).length > 0
                        ? 'danger'
                        : 'none'
                    }
                  >
                    <span>{widthInPixel} px</span>
                    <span> x </span>
                    <span>{heightInPixel} px</span>
                    <form.Subscribe selector={(state) => state.values.dpi}>
                      {(dpi) => <span> @ {dpi}DPI</span>}
                    </form.Subscribe>
                  </Tag>
                </FormGroup>

                {mode === 'basic' && (
                  <>
                    <form.AppField name="size">
                      {(field) => (
                        <field.Select
                          label="Size"
                          items={layout ? getSizesList(layout) : []}
                          required
                        />
                      )}
                    </form.AppField>
                    <form.AppField name="layout">
                      {(field) => (
                        <field.RadioGroup
                          label="Layout"
                          inline
                          required
                          options={[
                            { label: 'Portrait', value: 'portrait' },
                            { label: 'Landscape', value: 'landscape' },
                          ]}
                        />
                      )}
                    </form.AppField>
                  </>
                )}

                {mode === 'advance' && (
                  <>
                    <form.AppField
                      name="width"
                      listeners={{
                        onChange: ({ value }) => {
                          const newHeight = changeSize(
                            value,
                            'height',
                            'width',
                          );
                          form.setFieldValue('height', newHeight, {
                            dontRunListeners: true,
                          });
                        },
                      }}
                    >
                      {(field) => (
                        <field.NumericInput
                          autoFocus={mode === 'advance'}
                          label="Width"
                          rightElement={<Tag>{unit}</Tag>}
                          required
                          placeholder="width"
                        />
                      )}
                    </form.AppField>

                    <FormGroup>
                      <Button
                        icon="link"
                        variant="minimal"
                        active={isAspectRatioEnabled}
                        onClick={() => {
                          enableAspectRatio((prevFlag) => !prevFlag);
                        }}
                      />
                    </FormGroup>

                    <form.AppField
                      name="height"
                      listeners={{
                        onChange: ({ value }) => {
                          const newWidth = changeSize(value, 'width', 'height');

                          form.setFieldValue('width', newWidth, {
                            dontRunListeners: true,
                          });
                        },
                      }}
                    >
                      {(field) => (
                        <field.NumericInput
                          label="Height"
                          rightElement={<Tag>{unit}</Tag>}
                          required
                          placeholder="height"
                        />
                      )}
                    </form.AppField>

                    <form.AppField
                      name="unit"
                      listeners={{
                        onChange: ({ value }) => {
                          const { width, height } = changeUnit({ unit: value });

                          form.setFieldValue('width', width, {
                            dontRunListeners: true,
                          });

                          form.setFieldValue('height', height, {
                            dontRunListeners: true,
                          });
                        },
                      }}
                    >
                      {(field) => (
                        <field.Select
                          label="Units"
                          required
                          items={units.map(({ name, unit }) => ({
                            label: name,
                            value: unit,
                          }))}
                        />
                      )}
                    </form.AppField>
                  </>
                )}

                <form.AppField
                  name="dpi"
                  listeners={{
                    onChange: ({ value }) => {
                      if (unit === 'px') {
                        const convertedValue = changeDPI(value);

                        form.setFieldValue('width', convertedValue.width, {
                          dontRunListeners: true,
                        });

                        form.setFieldValue('height', convertedValue.height, {
                          dontRunListeners: true,
                        });
                      }
                    },
                  }}
                >
                  {(field) => (
                    <field.NumericInput
                      autoFocus={mode !== 'advance'}
                      required
                      label="DPI"
                      placeholder="DPI"
                    />
                  )}
                </form.AppField>
              </form.Section>
            </StyledDialogBody>
          </StyledDialogBody>
          <DialogFooter>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
              <form.AppField name="useDefaultSettings">
                {(field) => (
                  <field.Checkbox label="Don't show options dialog next time and use those settings" />
                )}
              </form.AppField>

              <div
                style={{
                  display: 'flex',
                  flexDirection: 'row',
                  gap: 5,
                }}
              >
                <Button
                  variant="outlined"
                  intent="danger"
                  onClick={() => onCloseDialog?.()}
                >
                  Cancel
                </Button>
                <form.SubmitButton intent="success">
                  {confirmButtonText}
                </form.SubmitButton>
              </div>
            </div>
          </DialogFooter>
        </Form>
      </form.AppForm>
    </StandardDialog>
  );
}
