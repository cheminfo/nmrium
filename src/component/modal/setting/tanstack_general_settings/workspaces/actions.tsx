import { Classes } from '@blueprintjs/core';
import { FaBolt, FaPaste, FaRegCopy } from 'react-icons/fa';
import { Button } from 'react-science/ui';

import { ClipboardFallbackModal } from '../../../../../utils/clipboard/clipboardComponents.tsx';
import { useClipboard } from '../../../../../utils/clipboard/clipboardHooks.ts';
import { usePreferences } from '../../../../context/PreferencesContext.tsx';
import { useToaster } from '../../../../context/ToasterContext.tsx';
import { getPreferencesByWorkspace } from '../../../../reducer/preferences/utilities/getPreferencesByWorkspace.ts';
import {
  formValueToWorkspace,
  unsafeWorkspaceToForm,
} from '../hooks/use_safe_workspace.ts';
import { workspaceValidation } from '../validation.ts';

import type { WorkspacesProps } from './props.ts';

export function WorkspaceActions(props: WorkspacesProps) {
  return (
    <>
      <ResetWorkspaceButton {...props} />
      <CopyPasteButtons {...props} />
    </>
  );
}

const resetTooltipProps = {
  content: 'Reset workspace preferences',
  compact: true,
};
function ResetWorkspaceButton(props: WorkspacesProps) {
  const { isPristine, reset } = props;
  const preferences = usePreferences();

  function handleReset() {
    const workSpaceDisplayPreferences = getPreferencesByWorkspace(
      preferences.workspace.current,
      preferences.originalWorkspaces,
    );

    reset(unsafeWorkspaceToForm(workSpaceDisplayPreferences));
  }

  return (
    <Button
      variant="outlined"
      intent="primary"
      onClick={handleReset}
      tooltipProps={resetTooltipProps}
      disabled={isPristine}
    >
      <FaBolt className={Classes.ICON} />
    </Button>
  );
}

const copyWorkspaceTooltipProps = {
  content: 'Copy workspace preferences',
  compact: true,
};
const pasteWorkspaceTooltipProps = {
  content: 'Paste workspace preferences',
  compact: true,
};
function CopyPasteButtons(props: WorkspacesProps) {
  const { reset, formValues } = props;
  const isExperimental =
    formValues.display?.general?.experimentalFeatures?.display;

  const clipboard = useClipboard();
  const toaster = useToaster();
  const preferences = usePreferences();

  if (!isExperimental) return null;

  async function handleCopyWorkspace() {
    const workspace = formValueToWorkspace(formValues, preferences.current);
    const serializedWorkspace = JSON.stringify(workspace);

    await clipboard.writeText(serializedWorkspace);
  }

  function onCopyWorkspace() {
    void handleCopyWorkspace()
      .then(() =>
        toaster.show({
          intent: 'success',
          message: 'Workspace form values copied to clipboard',
        }),
      )
      .catch((error: unknown) =>
        toaster.show({ intent: 'danger', message: (error as Error).message }),
      );
  }

  async function handlePasteWorkspaces() {
    const text = await clipboard.readText();
    if (!text) return;

    const rawWorkspace = JSON.parse(text);
    const parsedWorkspace = workspaceValidation.encode(rawWorkspace);

    reset(parsedWorkspace);
    toaster.show({
      intent: 'success',
      message: 'Clipboard applied to the form',
    });
    clipboard.cleanShouldFallback();
  }

  function onPasteWorkspace() {
    handlePasteWorkspaces().catch((error: unknown) =>
      toaster.show({ intent: 'danger', message: (error as Error).message }),
    );
  }

  return (
    <>
      <Button
        variant="outlined"
        onClick={onCopyWorkspace}
        tooltipProps={copyWorkspaceTooltipProps}
      >
        <FaRegCopy className={Classes.ICON} />
      </Button>
      <Button
        variant="outlined"
        intent="success"
        onClick={onPasteWorkspace}
        tooltipProps={pasteWorkspaceTooltipProps}
      >
        <FaPaste className={Classes.ICON} />
      </Button>

      <ClipboardFallbackModal
        mode={clipboard.shouldFallback}
        onDismiss={clipboard.cleanShouldFallback}
        onReadText={handlePasteWorkspaces}
        text={clipboard.text}
        label="Workspace"
      />
    </>
  );
}
