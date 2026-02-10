import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { Workspace } from '@zakodium/nmrium-core';
import dlv from 'dlv';
import { useCallback, useEffect, useRef } from 'react';
import { FaBolt, FaPaste, FaRegCopy } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { ClipboardFallbackModal } from '../../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../../utils/clipboard/clipboardHooks.js';
import { usePreferences } from '../../../context/PreferencesContext.js';
import { useToaster } from '../../../context/ToasterContext.js';
import { getPreferencesByWorkspace } from '../../../reducer/preferences/utilities/getPreferencesByWorkspace.js';
import PredefinedWorkspaces from '../../../workspaces/index.js';

interface GeneralSettingsDialogHeaderActionsButtonsProps<T> {
  reset: (values: T) => void;
  values: T;
}

export function GeneralSettingsDialogHeaderActionsButtons<T extends object>(
  props: GeneralSettingsDialogHeaderActionsButtonsProps<T>,
) {
  const { reset, values } = props;

  const { dispatch, workspaces, ...preferences } = usePreferences();
  const pastRef = useRef<Record<string, Workspace> | null>(null);

  const setWorkspaceSetting = useCallback(
    (inputWorkspace: any) => {
      const parseWorkspaceName = Object.keys(inputWorkspace)[0];

      if (preferences.workspace.current === parseWorkspaceName) {
        reset(inputWorkspace[parseWorkspaceName]);
      } else if (workspaces[parseWorkspaceName]) {
        pastRef.current = inputWorkspace as unknown as Record<
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
    if (pastRef.current) {
      setWorkspaceSetting(pastRef.current);
      pastRef.current = null;
    }
  }, [setWorkspaceSetting]);

  return (
    <WorkSpaceActionsButtons<T>
      reset={reset}
      values={values}
      onPast={setWorkspaceSetting}
    />
  );
}

interface WorkSpaceActionsButtonsProps<T> {
  onPast: (value: string) => void;
  reset: (values: T) => void;
  values: T;
}

function WorkSpaceActionsButtons<T extends object>(
  props: WorkSpaceActionsButtonsProps<T>,
) {
  const { reset, values } = props;

  const {
    readText,
    rawWriteWithType,
    shouldFallback,
    cleanShouldFallback,
    text,
  } = useClipboard();

  const toaster = useToaster();
  const isExperimentalFeatures = dlv(
    values,
    'general.experimentalFeatures',
    false,
  );

  const {
    originalWorkspaces,
    workspace: { current: workspaceName },
  } = usePreferences();

  function handleReset() {
    const workSpaceDisplayPreferences = getPreferencesByWorkspace(
      workspaceName,
      originalWorkspaces,
    );

    reset(workSpaceDisplayPreferences as T);
  }

  function handlePasteWorkspace(text: string | null) {
    if (!text) return;

    try {
      const parseWorkspaces = JSON.parse(text);
      props.onPast(parseWorkspaces);
    } catch {
      toaster.show({ message: 'object parse error', intent: 'danger' });
    }

    cleanShouldFallback();
  }

  function handlePastWorkspaceAction() {
    void readText().then(handlePasteWorkspace);
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
        tooltipProps={{ content: 'Reset workspace preferences', compact: true }}
        disabled={isRestButtonDisable(
          values,
          workspaceName,
          originalWorkspaces,
        )}
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
        onReadText={handlePasteWorkspace}
        text={text}
        label="Workspace"
      />
    </div>
  );
}

const StyledButton = styled(Button, {
  shouldForwardProp(propName) {
    return propName !== 'marginHorizontal';
  },
})<{ marginHorizontal: number }>`
  margin: 0 ${(props) => props.marginHorizontal}px;
`;

function isRestButtonDisable(
  currentWorkspaceSetting: any,
  workspaceName: any,
  customWorkspaces: any,
) {
  if (
    !(workspaceName in PredefinedWorkspaces) &&
    !(workspaceName in customWorkspaces)
  ) {
    return true;
  } else {
    return (
      JSON.stringify(currentWorkspaceSetting) ===
      JSON.stringify(getPreferencesByWorkspace(workspaceName, customWorkspaces))
    );
  }
}
