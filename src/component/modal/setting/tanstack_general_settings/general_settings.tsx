import { Dialog as BPDialog } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import lodashMergeWith from 'lodash/mergeWith.js';
import { useMemo } from 'react';
import { ErrorBoundary } from 'react-error-boundary';
import { Form, assert, assertUnreachable, useForm } from 'react-science/ui';

import { useLogger } from '../../../context/LoggerContext.tsx';
import { usePreferences } from '../../../context/PreferencesContext.js';
import { useSaveSettings } from '../../../hooks/useSaveSettings.js';
import ErrorOverlay from '../../../main/ErrorOverlay.tsx';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.ts';
import { workspaceDefaultProperties } from '../../../workspaces/workspaceDefaultProperties.ts';

import { GeneralSettingsDialogBody } from './general_settings_dialog_body.js';
import { GeneralSettingsDialogFooter } from './general_settings_dialog_footer.js';
import { GeneralSettingsDialogHeader } from './general_settings_dialog_header.js';
import {
  defaultGeneralSettingsFormValues,
  workspaceValidation,
} from './validation.js';

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

export function GeneralSettingsDialog(props: GeneralSettingsProps) {
  const { isOpen, close } = props;

  return (
    <Dialog isOpen={isOpen} onClose={close} title="General settings" icon="cog">
      <ErrorBoundary FallbackComponent={ErrorOverlay}>
        <GeneralSettings {...props} />
      </ErrorBoundary>
    </Dialog>
  );
}

type FormMeta = 'apply' | 'save';
function GeneralSettings(props: Omit<GeneralSettingsProps, 'isOpen'>) {
  const { close, height } = props;

  const { current: currentWorkspace, dispatch } = usePreferences();
  const { saveSettings } = useSaveSettings();
  const defaultValues = useDefaultValues();

  function onApply(data: WorkspaceWithSource) {
    dispatch({
      type: 'APPLY_GENERAL_PREFERENCES',
      payload: { data },
    });

    close();
  }

  const form = useForm({
    validators: {
      onDynamic: workspaceValidation,
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues,
    onSubmitMeta: 'apply' satisfies FormMeta as FormMeta,
    onSubmit: ({ value, meta }) => {
      const safeParseResult = workspaceValidation.safeParse(value);

      if (!safeParseResult.success) {
        throw new Error('Failed to parse workspace validation');
      }

      const safeValue = safeParseResult.data;
      const mergedValues = lodashMergeWith(
        {},
        currentWorkspace,
        safeValue,
        mergeReplaceArray,
      );

      switch (meta) {
        case 'apply':
          onApply(mergedValues);
          break;
        case 'save':
          saveSettings(mergedValues);
          break;
        default:
          assertUnreachable(meta);
      }

      close();
    },
  });

  return (
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
  );
}

/**
 * Best effort to return typesafe values for the form
 * If one step does not work
 * - warn zod result with workspace in context
 * - fallback on the next step.
 *
 * 1. try to encode the current workspace
 * 2. try to encode the current workspace merged with workspaceDefaultProperties
 * 3. fallback on defaultGeneralSettingsFormValues (apply / save will lose current workspace values)
 *
 * NB: merge use a replacement array strategy.
 */
function useDefaultValues() {
  const { current: currentWorkspace } = usePreferences();
  const { logger } = useLogger();

  return useMemo(() => {
    const result = workspaceValidation.safeEncode(currentWorkspace);
    if (result.success) return result.data;

    const childLogger = logger.child({ workspace: currentWorkspace });

    childLogger.warn(
      result,
      'Failed to encode current workspace, try to merge with current workspace default values',
    );
    const workspaceMergedWithDefault = lodashMergeWith(
      {},
      workspaceDefaultProperties,
      currentWorkspace,
      mergeReplaceArray,
    );
    const mergedResult = workspaceValidation.safeEncode(
      workspaceMergedWithDefault,
    );
    if (mergedResult.success) return mergedResult.data;

    childLogger.warn(
      mergedResult,
      'Failed to encode workspace merged with default values, use current default values instead',
    );
    return defaultGeneralSettingsFormValues;
  }, [currentWorkspace, logger]);
}

function mergeReplaceArray(obj: unknown, src: unknown) {
  if (!Array.isArray(obj)) return;
  if (!Array.isArray(src)) return;

  return src;
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
