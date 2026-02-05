import { Dialog as BPDialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import { Form, useForm } from 'react-science/ui';
import type { z } from 'zod/v4';

import { usePreferences } from '../../../context/PreferencesContext.js';

import { GeneralSettingsDialogBody } from './general_settings_dialog_body.tsx';
import { GeneralSettingsDialogFooter } from './general_settings_dialog_footer.js';
import { GeneralSettingsDialogHeader } from './general_settings_dialog_header.js';
import { workspaceValidation } from './validation.js';

interface GeneralSettingsProps {
  isOpen: boolean;
  close: () => void;
  height?: number;
}

const Dialog = styled(BPDialog)`
  max-width: 1000px;
  width: 50vw;
  min-width: 800px;
`;

export type GeneralSettingsFormType = z.input<typeof workspaceValidation>;
export function GeneralSettings(props: GeneralSettingsProps) {
  const { isOpen, close, height } = props;

  const { current: currentWorkspace } = usePreferences();

  const defaultValues: z.input<typeof workspaceValidation> = {
    general: {
      dimmedSpectraOpacity: currentWorkspace.general.dimmedSpectraOpacity,
    },
  };

  const form = useForm({
    validators: { onDynamic: workspaceValidation },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues,
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

        <GeneralSettingsDialogBody form={form} height={height} />
        <GeneralSettingsDialogFooter
          submitButton={() => (
            <form.AppForm>
              <form.SubmitButton>Save</form.SubmitButton>
            </form.AppForm>
          )}
        />
      </Form>
    </Dialog>
  );
}
