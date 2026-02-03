import { Dialog as BPDialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import { Form, useForm } from 'react-science/ui';
import type { z } from 'zod/v4';

import { usePreferences } from '../../../context/PreferencesContext.js';

import { GeneralSettingsDialogFooter } from './general_settings_dialog_footer.js';
import { GeneralSettingsDialogHeader } from './general_settings_dialog_header.js';
import { workspaceValidation } from './validation.js';

interface GeneralSettingsProps {
  isOpen: boolean;
  close: () => void;
}

const Dialog = styled(BPDialog)`
  max-width: 1000px;
  width: 50vw;
  min-width: 800px;
`;

type GeneralSettingsFormType = z.input<typeof workspaceValidation>;
export function GeneralSettings(props: GeneralSettingsProps) {
  const { isOpen, close } = props;

  const { current: currentWorkspace } = usePreferences();

  const form = useForm({
    validators: { onDynamic: workspaceValidation },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues: {
      general: {
        dimmedSpectraOpacity: currentWorkspace.general.dimmedSpectraOpacity,
      },
    },
    onSubmit: ({ value }) => {
      const parsedValues = workspaceValidation.parse(value);
      console.log(parsedValues);
    },
  });

  return (
    <Dialog isOpen={isOpen} onClose={close} title="General settings" icon="cog">
      <Form
        layout="inline"
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
              label="Opacity of dimmed spectra [0 - 1]"
              min={0}
              max={1}
              step={0.1}
            />
          )}
        </form.AppField>

        <GeneralSettingsDialogFooter form={form} />
      </Form>
    </Dialog>
  );
}
