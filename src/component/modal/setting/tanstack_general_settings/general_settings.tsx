import { Dialog as BPDialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { Workspace } from '@zakodium/nmrium-core';
import lodashMerge from 'lodash/merge.js';
import { Form, assert, assertUnreachable, useForm } from 'react-science/ui';

import { usePreferences } from '../../../context/PreferencesContext.js';
import { useSaveSettings } from '../../../hooks/useSaveSettings.js';

import { GeneralSettingsDialogBody } from './general_settings_dialog_body.js';
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

export function GeneralSettings(props: GeneralSettingsProps) {
  const { isOpen, close, height } = props;

  const { current: currentWorkspace, dispatch } = usePreferences();
  const { saveSettings } = useSaveSettings();

  function onApply(data: Omit<Workspace, 'version' | 'label'>) {
    dispatch({
      type: 'APPLY_General_PREFERENCES',
      payload: { data },
    });

    close();
  }

  const form = useForm({
    validators: {
      onDynamic: workspaceValidation,
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues: workspaceValidation.encode(currentWorkspace),
    onSubmitMeta: undefined as unknown as SubmitEvent,
    onSubmit: ({ value, meta }) => {
      const safeParseResult = workspaceValidation.safeParse(value);

      if (!safeParseResult.success) {
        throw new Error('Failed to parse workspace validation');
      }

      const safeValue = safeParseResult.data;
      const mergedValues = lodashMerge({}, currentWorkspace, safeValue);

      const submitter = meta.submitter as HTMLButtonElement | null;
      assert(submitter, 'form event should have a submitter');

      switch (submitter.dataset.action) {
        case 'apply':
          onApply(mergedValues);
          break;
        case 'save':
          saveSettings(mergedValues);
          break;
        default:
          assertUnreachable(submitter.dataset.action as never);
      }

      close();
    },
  });

  return (
    <Dialog isOpen={isOpen} onClose={close} title="General settings" icon="cog">
      <Form
        layout="inline"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();
          void form.handleSubmit(event.nativeEvent as SubmitEvent);
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
        <GeneralSettingsDialogFooter form={form} onCancel={close} />
      </Form>
    </Dialog>
  );
}
