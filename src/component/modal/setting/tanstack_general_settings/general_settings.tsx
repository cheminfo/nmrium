import { Dialog as BPDialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { Workspace } from '@zakodium/nmrium-core';
import { ErrorBoundary } from 'react-error-boundary';
import { Form, assert, useForm } from 'react-science/ui';
import { match } from 'ts-pattern';

import { usePreferences } from '../../../context/PreferencesContext.js';
import ErrorOverlay from '../../../main/ErrorOverlay.tsx';

import { GeneralSettingsErrorsOpenProvider } from './errors/context.tsx';
import { GeneralSettingsDialogBody } from './general_settings_dialog_body.js';
import { GeneralSettingsDialogFooter } from './general_settings_dialog_footer.js';
import { GeneralSettingsDialogHeader } from './general_settings_dialog_header.js';
import {
  formValueToWorkspace,
  useDefaultValues,
} from './hooks/use_safe_workspace.ts';
import { workspaceValidation } from './validation.js';

interface GeneralSettingsDialogProps {
  isOpen: boolean;
  close: () => void;
  onSave: (values?: Partial<Workspace>) => void;
  height?: number;
}

const Dialog = styled(BPDialog)`
  max-width: 1000px;
  width: 50vw;
  min-width: 800px;

  /*
   * Fix: Blueprint NumericInput text selection bug inside Dialog
   * https://github.com/palantir/blueprint/issues/3004#issuecomment-432853498
   *
   * Clicking the up/down buttons of a NumericInput selects the surrounding text.
   * Recommended way to fix this is to set user-select with initial.
   */
  user-select: initial !important;
`;

export function GeneralSettingsDialog(props: GeneralSettingsDialogProps) {
  const { isOpen, close } = props;

  return (
    <Dialog isOpen={isOpen} onClose={close} title="General settings" icon="cog">
      <ErrorBoundary FallbackComponent={ErrorOverlay}>
        <GeneralSettings {...props} />
      </ErrorBoundary>
    </Dialog>
  );
}

interface GeneralSettingsProps extends Omit<
  GeneralSettingsDialogProps,
  'isOpen'
> {
  onSave: (values?: Partial<Workspace>) => void;
}

type FormMeta = 'apply' | 'save';

function GeneralSettings(props: GeneralSettingsProps) {
  const { close, height, onSave } = props;

  const { current: currentWorkspace, dispatch } = usePreferences();
  const defaultValues = useDefaultValues();

  const form = useForm({
    validators: {
      onDynamic: workspaceValidation,
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues,
    // We don't want onSubmitMeta to be inferred as sting.
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
    onSubmitMeta: 'apply' as FormMeta,
    onSubmit: ({ value, meta }) => {
      const mergedValues = formValueToWorkspace(value, currentWorkspace);

      match(meta)
        .with('apply', () => {
          dispatch({
            type: 'APPLY_GENERAL_PREFERENCES',
            payload: { data: mergedValues },
          });
        })
        .with('save', () => {
          onSave(mergedValues);
        })
        .exhaustive();

      close();
    },
  });

  return (
    <form.AppForm>
      <Form
        layout="inline"
        noValidate
        onSubmit={(event) => {
          event.preventDefault();

          const nativeEvent = event.nativeEvent as SubmitEvent;
          const submitter = nativeEvent.submitter as HTMLButtonElement | null;
          assert(submitter, 'form event should have a submitter');
          const action = submitter.dataset.action;

          void form.handleSubmit(action as FormMeta);
        }}
      >
        <PreventImplicitSubmit />

        <GeneralSettingsErrorsOpenProvider form={form}>
          <GeneralSettingsDialogHeader form={form} />
          <GeneralSettingsDialogBody form={form} height={height} />
          <GeneralSettingsDialogFooter form={form} onCancel={close} />
        </GeneralSettingsErrorsOpenProvider>
      </Form>
    </form.AppForm>
  );
}

const InvisibleButton = styled.button`
  display: none;
`;

/**
 * In this form there are inputs with datalist, the complete event with the `Enter` key also triggers the form submission.
 * The previous version of this form did not use a proper Submit button, so there was no implicit form submission.
 *
 * @see https://stackoverflow.com/a/51507806
 */
function PreventImplicitSubmit() {
  return <InvisibleButton type="submit" aria-hidden="true" disabled />;
}
