import { Dialog as BPDialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { Workspace } from '@zakodium/nmrium-core';
import { Form, useForm } from 'react-science/ui';
import type { z } from 'zod/v4';

import { usePreferences } from '../../../context/PreferencesContext.js';
import { useSaveSettings } from '../../../hooks/useSaveSettings.tsx';

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

  const { current: currentWorkspace, dispatch } = usePreferences();
  const { saveSettings } = useSaveSettings();

  const form = useForm({
    validators: {
      onDynamic: workspaceValidation,
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues: workspaceValidation.encode(
      currentWorkspace as unknown as z.output<typeof workspaceValidation>,
    ),
    onSubmit: ({ value }) => {
      const safeParseResult = workspaceValidation.safeParse(value);

      if (!safeParseResult.success) {
        throw new Error('Failed to parse workspace validation');
      }

      saveSettings(value as unknown as Partial<Workspace>);
      close();
    },
  });

  function onApply(values: GeneralSettingsFormType) {
    dispatch({
      type: 'APPLY_General_PREFERENCES',
      payload: {
        data: values as unknown as Omit<Workspace, 'label' | 'version'>,
      },
    });

    close();
  }

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
        <form.Subscribe selector={(state) => state.values}>
          {(values) => (
            <GeneralSettingsDialogHeader
              reset={form.reset}
              currentValues={values}
            />
          )}
        </form.Subscribe>

        <GeneralSettingsDialogBody form={form} height={height} />
        <GeneralSettingsDialogFooter
          form={form}
          onCancel={close}
          onApply={onApply}
        />
      </Form>
    </Dialog>
  );
}
