import { Dialog } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import { useForm } from 'react-science/ui';
import type { z } from 'zod/v4';

import { usePreferences } from '../../../context/PreferencesContext.tsx';

import { GeneralSettingsDialogHeader } from './general_settings_dialog_header.tsx';
import { workspaceValidation } from './validation.ts';

interface GeneralSettingsProps {
  isOpen: boolean;
  close: () => void;
}

type GeneralSettingsFormType = Partial<z.input<typeof workspaceValidation>>;
export function GeneralSettings(props: GeneralSettingsProps) {
  const { isOpen, close } = props;

  const { current: currentWorkspace } = usePreferences();

  const form = useForm({
    validators: { onDynamic: workspaceValidation },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues: currentWorkspace as GeneralSettingsFormType,
    onSubmit: ({ value }) => {
      console.log('submit', value);
    },
  });

  return (
    <Dialog
      isOpen={isOpen}
      onClose={close}
      style={{ maxWidth: 1000, width: '50vw', minWidth: 800 }}
      title="General settings"
      icon="cog"
    >
      <form
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit();
        }}
      >
        <GeneralSettingsDialogHeader<GeneralSettingsFormType>
          reset={form.reset}
          currentValues={form.state.values}
        />

        <p>Todo: Refactor old general settings to use new forms</p>
        <form.AppField name="general.dimmedSpectraOpacity">
          {(Field) => (
            <Field.NumericInput
              layout="inline"
              label="Opacity of dimmed spectra [0 - 1]"
              min={0}
              max={1}
              stepSize={0.1}
            />
          )}
        </form.AppField>
      </form>
    </Dialog>
  );
}
