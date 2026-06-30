import { DialogBody, DialogFooter } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import { useMemo } from 'react';
import { AppForm, Button, useForm } from 'react-science/ui';
import { z } from 'zod/v4';

import { DataExportOptions } from '../../data/SpectraManager.js';
import { useChartData } from '../context/ChartContext.js';
import { StandardDialog } from '../elements/StandardDialog.tsx';
import { useExport } from '../hooks/useExport.js';

const formSchema = z.object({
  name: z.string().min(1, { error: 'Name is required' }),
  include: z.object({
    dataType: z.enum([
      'NO_DATA',
      'SELF_CONTAINED',
      'SELF_CONTAINED_EXTERNAL_DATASOURCE',
    ]),
    view: z.boolean(),
    settings: z.boolean(),
  }),
});

const INITIAL_VALUE: z.input<typeof formSchema> = {
  name: '',
  include: {
    dataType: 'SELF_CONTAINED',
    view: false,
    settings: false,
  },
};

interface InnerSaveAsModalProps {
  onCloseDialog: () => void;
}

interface SaveAsModalProps extends InnerSaveAsModalProps {
  isOpen: boolean;
}

export default function SaveAsModal(props: SaveAsModalProps) {
  const { onCloseDialog, isOpen } = props;

  if (!isOpen) return;
  return <InnerSaveAsModal onCloseDialog={onCloseDialog} />;
}

function InnerSaveAsModal(props: InnerSaveAsModalProps) {
  const { onCloseDialog } = props;
  const { data, aggregator } = useChartData();
  const { saveHandler } = useExport();

  const form = useForm({
    defaultValues: { ...INITIAL_VALUE, name: data[0]?.info?.name ?? '' },
    validators: { onDynamic: formSchema },
    validationLogic: revalidateLogic({ modeAfterSubmission: 'change' }),
    onSubmit: ({ value }) => {
      const parsedValue = formSchema.parse(value);
      saveHandler(parsedValue);

      onCloseDialog();
    },
  });

  const containsLinkedFiles = useMemo(() => {
    return aggregator.sources.some((s) => !s.baseURL?.startsWith('ium:'));
  }, [aggregator]);

  const options = useMemo(() => {
    return [
      { value: DataExportOptions.SELF_CONTAINED, label: 'Embed data' },
      {
        value: DataExportOptions.SELF_CONTAINED_EXTERNAL_DATASOURCE,
        label: 'Link data',
        disabled: !containsLinkedFiles,
      },
      { value: DataExportOptions.NO_DATA, label: 'None' },
    ];
  }, [containsLinkedFiles]);

  return (
    <StandardDialog
      isOpen
      title="Save as ... "
      onClose={onCloseDialog}
      style={{ width: 600 }}
    >
      <AppForm form={form} layout="inline">
        <DialogBody style={{ backgroundColor: 'white' }}>
          <form.Section title="General information">
            <form.AppField name="name">
              {(field) => <field.Input label="Name" required autoFocus />}
            </form.AppField>
          </form.Section>
          <form.Section title="Include">
            <form.AppField name="include.view">
              {(field) => <field.Checkbox label="View" />}
            </form.AppField>

            <form.AppField name="include.settings">
              {(field) => <field.Checkbox label="Workspace" />}
            </form.AppField>

            <form.AppField name="include.dataType">
              {(field) => (
                <field.RadioGroup inline label="Data" options={options} />
              )}
            </form.AppField>
          </form.Section>
        </DialogBody>

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
              <form.SubmitButton intent="success">Save</form.SubmitButton>
            </>
          }
        />
      </AppForm>
    </StandardDialog>
  );
}
