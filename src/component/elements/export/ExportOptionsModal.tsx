import { Callout, DialogFooter } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import { useMemo } from 'react';
import { AppForm, Button, useForm } from 'react-science/ui';
import { z } from 'zod/v4';

import { ExportFields } from '../../modal/setting/tanstack_general_settings/tabs/export_tab.fields.tsx';
import { exportSettingsValidation } from '../../modal/setting/tanstack_general_settings/validation/export_tab_validation.ts';
import { StandardDialog } from '../StandardDialog.tsx';
import { StyledDialogBody } from '../StyledDialogBody.tsx';

import type { BaseExportProps } from './ExportContent.js';
import { getExportDefaultOptions } from './utilities/getExportOptions.ts';

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

const validator = z.object({
  values: exportSettingsValidation,
});

function InnerExportOptionsModal(props: InnerExportOptionsModalProps) {
  const {
    onCloseDialog,
    confirmButtonText,
    defaultExportOptions,
    onExportOptionsChange,
  } = props;

  const values = useMemo(() => {
    return exportSettingsValidation.encode(
      getExportDefaultOptions(defaultExportOptions),
    );
  }, [defaultExportOptions]);

  const form = useForm({
    defaultValues: {
      values,
    },
    validators: {
      onDynamic: validator,
    },
    // onDynamic validators are ignored by the default validation logic
    validationLogic: revalidateLogic({ mode: 'change' }),
    onSubmit: ({ value: { values } }) => {
      const parsedValues = exportSettingsValidation.parse(values);
      onExportOptionsChange(parsedValues);
    },
  });

  return (
    <StandardDialog
      isOpen
      title="Export options"
      onClose={onCloseDialog}
      style={{ width: 600 }}
      canEscapeKeyClose
      autoFocus
    >
      <AppForm form={form} layout="inline">
        <StyledDialogBody>
          <form.Subscribe
            selector={(state) =>
              Array.from(
                new Set(
                  Object.values(state.errorMap.onDynamic ?? {})
                    .flat()
                    .map((error) => error?.message)
                    .filter((message) => typeof message === 'string'),
                ),
              )
            }
          >
            {(messages) =>
              messages.length > 0 && (
                <Callout
                  intent="danger"
                  title="Invalid export options"
                  style={{ marginBottom: 10 }}
                >
                  <ul style={{ margin: 0, paddingInlineStart: '1.2em' }}>
                    {messages.map((message) => (
                      <li key={message}>{message}</li>
                    ))}
                  </ul>
                </Callout>
              )
            }
          </form.Subscribe>
          <ExportFields form={form} fields="values" />
        </StyledDialogBody>
        <DialogFooter
          actions={
            <>
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
            </>
          }
        />
      </AppForm>
    </StandardDialog>
  );
}
