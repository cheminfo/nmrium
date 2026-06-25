import { DialogFooter } from '@blueprintjs/core';
import { Button, Form, useForm } from 'react-science/ui';
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

function InnerExportOptionsModal(props: InnerExportOptionsModalProps) {
  const {
    onCloseDialog,
    confirmButtonText,
    defaultExportOptions,
    onExportOptionsChange,
  } = props;

  const form = useForm({
    defaultValues: {
      values: getExportDefaultOptions(
        defaultExportOptions,
      ) as unknown as z.input<typeof exportSettingsValidation>,
    },
    validators: {
      onDynamic: z.object({
        values: exportSettingsValidation,
      }),
    },
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
            <form.Section title="Export to file options">
              <ExportFields form={form} fields="values" />
            </form.Section>
          </StyledDialogBody>
          <DialogFooter>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline',
              }}
            >
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
