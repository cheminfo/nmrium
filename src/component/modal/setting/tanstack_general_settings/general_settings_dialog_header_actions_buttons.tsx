import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import type { Workspace } from '@zakodium/nmrium-core';
import { useCallback, useEffect, useRef } from 'react';
import { FaBolt, FaPaste, FaRegCopy } from 'react-icons/fa';
import { Button, withForm } from 'react-science/ui';

import { ClipboardFallbackModal } from '../../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../../utils/clipboard/clipboardHooks.js';
import { usePreferences } from '../../../context/PreferencesContext.js';
import { useToaster } from '../../../context/ToasterContext.js';
import type { WorkspaceWithSource } from '../../../reducer/preferences/preferencesReducer.ts';
import { getPreferencesByWorkspace } from '../../../reducer/preferences/utilities/getPreferencesByWorkspace.js';

import { unsafeWorkspaceToForm } from './hooks/use_safe_workspace.ts';
import { defaultGeneralSettingsFormValues } from './validation.ts';

export const GeneralSettingsDialogHeaderActionsButtons = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function GeneralSettingsDialogHeaderActionsButtons({ form }) {
    const { reset } = form;

    const { dispatch, workspaces, ...preferences } = usePreferences();
    const pasteRef = useRef<Record<string, Workspace> | null>(null);

    const setWorkspaceSetting = useCallback(
      (inputWorkspace: any) => {
        const parseWorkspaceName = Object.keys(inputWorkspace)[0];

        if (preferences.workspace.current === parseWorkspaceName) {
          reset(inputWorkspace[parseWorkspaceName]);
        } else if (workspaces[parseWorkspaceName]) {
          pasteRef.current = inputWorkspace as unknown as Record<
            string,
            Workspace
          >;

          dispatch({
            type: 'SET_WORKSPACE',
            payload: {
              workspace: parseWorkspaceName,
              workspaceSource: 'any',
            },
          });
        }
      },
      [dispatch, preferences.workspace, reset, workspaces],
    );

    useEffect(() => {
      if (pasteRef.current) {
        setWorkspaceSetting(pasteRef.current);
        pasteRef.current = null;
      }
    }, [setWorkspaceSetting]);

    return (
      <WorkSpaceActionsButtons form={form} onPaste={setWorkspaceSetting} />
    );
  },
});

interface WorkSpaceActionsButtonsProps {
  /**
   * @param value - a JSON.parse result
   */
  onPaste: (value: any) => void;
}
const workSpaceActionsButtonsProps: WorkSpaceActionsButtonsProps = {
  onPaste: () => {},
};
const WorkSpaceActionsButtons = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  props: workSpaceActionsButtonsProps,
  render: function WorkSpaceActionsButtons({ form, onPaste }) {
    const { reset } = form;
    const values = useStore(form.store, (state) => state.values);

    const {
      readText,
      rawWriteWithType,
      shouldFallback,
      cleanShouldFallback,
      text,
    } = useClipboard();

    const toaster = useToaster();
    const isExperimentalFeatures = useStore(
      form.store,
      (state) => state.values.display?.general?.experimentalFeatures?.display,
    );

    const {
      originalWorkspaces,
      workspace: { current: workspaceName },
    } = usePreferences();

    function handleReset() {
      const workSpaceDisplayPreferences = getPreferencesByWorkspace(
        workspaceName,
        originalWorkspaces,
      ) as WorkspaceWithSource;

      reset(unsafeWorkspaceToForm(workSpaceDisplayPreferences));
    }

    function handlePasteWorkspaces(text: string | null) {
      if (!text) return;

      try {
        const parseWorkspaces = JSON.parse(text);
        onPaste(parseWorkspaces);
      } catch {
        toaster.show({ message: 'object parse error', intent: 'danger' });
      }

      cleanShouldFallback();
    }

    function handlePastWorkspaceAction() {
      void readText().then(handlePasteWorkspaces);
    }

    function handleCopyWorkspace() {
      const data = { [workspaceName]: values };
      void rawWriteWithType(JSON.stringify(data)).then(() => {
        toaster.show({
          message: 'Workspace copied to clipboard',
          intent: 'success',
        });
      });
    }

    return (
      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-start',
          padding: '0 3px',
        }}
      >
        <Button
          variant="outlined"
          intent="primary"
          onClick={handleReset}
          tooltipProps={{
            content: 'Reset workspace preferences',
            compact: true,
          }}
          disabled={form.state.isPristine}
        >
          <FaBolt className={Classes.ICON} />
        </Button>
        {isExperimentalFeatures && (
          <>
            <StyledButton
              variant="outlined"
              onClick={handleCopyWorkspace}
              tooltipProps={{
                content: 'Copy workspace preferences',
                compact: true,
              }}
              marginHorizontal={5}
            >
              <FaRegCopy className={Classes.ICON} />
            </StyledButton>
            <Button
              variant="outlined"
              intent="success"
              onClick={handlePastWorkspaceAction}
              tooltipProps={{
                content: 'Paste workspace preferences',
                compact: true,
              }}
            >
              <FaPaste className={Classes.ICON} />
            </Button>
          </>
        )}
        <ClipboardFallbackModal
          mode={shouldFallback}
          onDismiss={cleanShouldFallback}
          onReadText={handlePasteWorkspaces}
          text={text}
          label="Workspace"
        />
      </div>
    );
  },
});

const StyledButton = styled(Button, {
  shouldForwardProp(propName) {
    return propName !== 'marginHorizontal';
  },
})<{ marginHorizontal: number }>`
  margin: 0 ${(props) => props.marginHorizontal}px;
`;
