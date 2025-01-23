import { Classes, Dialog, DialogFooter, Tab, Tabs } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Workspace } from 'nmr-load-save';
import { useCallback, useEffect, useMemo, useRef } from 'react';
import {
  FormProvider,
  useForm,
  useFormContext,
  useWatch,
} from 'react-hook-form';
import { FaBolt, FaPaste, FaRegCopy, FaWrench } from 'react-icons/fa';
import { Button, Toolbar, useOnOff } from 'react-science/ui';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import {
  usePreferences,
  useWorkspacesList,
} from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import ActionButtons from '../../elements/ActionButtons.js';
import Label from '../../elements/Label.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import type { DropDownListItem } from '../../elements/dropDownButton/DropDownButton.js';
import DropDownButton from '../../elements/dropDownButton/DropDownButton.js';
import { useSaveSettings } from '../../hooks/useSaveSettings.js';
import { useWorkspaceAction } from '../../hooks/useWorkspaceAction.js';
import type { WorkspaceWithSource } from '../../reducer/preferences/preferencesReducer.js';
import { getPreferencesByWorkspace } from '../../reducer/preferences/utilities/getPreferencesByWorkspace.js';
import PredefinedWorkspaces from '../../workspaces/index.js';

import WorkspaceItem from './WorkspaceItem.js';
import DatabasesTabContent from './settings-tabs/DatabasesTabContent.js';
import DisplayTabContent from './settings-tabs/DisplayTabContent.js';
import { ExportTabContent } from './settings-tabs/ExportTabContent.js';
import { ExternalAPIsTabContent } from './settings-tabs/ExternalAPIsTabContent.js';
import GeneralTabContent from './settings-tabs/GeneralTabContent.js';
import ImportationFiltersTabContent from './settings-tabs/ImportationFiltersTabContent.js';
import InfoBlockTabContent from './settings-tabs/InfoBlockTabContent.js';
import NucleiTabContent from './settings-tabs/NucleiTabContent.js';
import OnLoadProcessingTabContent from './settings-tabs/OnLoadProcessingTabContent.js';
import SpectraColorsTabContent from './settings-tabs/SpectraColorsTabContent.js';
import ToolsTabContent from './settings-tabs/ToolsTabContent.js';
import { validation } from './settingsValidation.js';

export const Section = styled.div`
  display: flex;
  font-size: 13px;
  color: #2ca8ff;
  margin-bottom: 10px;
  border-bottom: 0.55px solid #f9f9f9;
  padding: 6px 2px;
`;

const StyledTabs = styled(Tabs)`
  height: 100%;

  div[role='tablist'] {
    gap: 0;
  }

  div[role='tabpanel'] {
    width: 100%;
    padding: 0.8rem;
    overflow: auto;
    max-height: 100%;
  }
`;

const StyledButton = styled(Button)<{ marginHorizontal: number }>`
  margin: 0 ${(props) => props.marginHorizontal}px;
`;

function isRestButtonDisable(
  currentWorkspaceSetting,
  workspaceName,
  customWorkspaces,
) {
  if (
    !PredefinedWorkspaces[workspaceName] &&
    !customWorkspaces[workspaceName]
  ) {
    return true;
  } else {
    return (
      JSON.stringify(currentWorkspaceSetting) ===
      JSON.stringify(getPreferencesByWorkspace(workspaceName, customWorkspaces))
    );
  }
}

interface BasseGeneralModalProps {
  onCloseDialog: () => void;
  onSave: (values?: Partial<Workspace>) => void;
}
interface InnerGeneralSettingsModalProps extends BasseGeneralModalProps {
  height?: number;
}
interface GeneralSettingsModalProps {
  height?: number;
}

function GeneralSettingsModal(props: GeneralSettingsModalProps) {
  const { ...otherProps } = props;
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const { saveSettings, SaveSettingsModal } = useSaveSettings();

  return (
    <>
      <Toolbar.Item
        id="general-settings"
        onClick={openDialog}
        tooltip="General settings"
        icon={<FaWrench />}
      />
      <SaveSettingsModal />
      {isOpenDialog && (
        <InnerGeneralSettingsModal
          {...otherProps}
          onCloseDialog={closeDialog}
          onSave={saveSettings}
        />
      )}
    </>
  );
}

function InnerGeneralSettingsModal(props: InnerGeneralSettingsModalProps) {
  const { height, onCloseDialog, onSave } = props;
  const {
    dispatch,
    current: currentWorkspace,
    originalWorkspaces,
    workspaces,
    ...preferences
  } = usePreferences();
  const { addNewWorkspace, removeWorkspace, setActiveWorkspace } =
    useWorkspaceAction();
  const baseWorkspaces = useWorkspacesList();
  const workspaceName = preferences.workspace.current;
  const pastRef = useRef<Record<string, Workspace> | null>(null);
  const methods = useForm<WorkspaceWithSource>({
    defaultValues: currentWorkspace,
    resolver: yupResolver(validation),
  });
  const { reset, getValues, watch } = methods;
  const workspacesList = useMemo(() => {
    return baseWorkspaces.concat([
      {
        key: 'new',
        label: 'Custom workspace',
      } as any,
    ]);
  }, [baseWorkspaces]);

  function addWorkSpaceHandler(name) {
    addNewWorkspace(name, getValues());
  }

  function deleteWorkSpaceHandler(key) {
    removeWorkspace(key);
  }

  function ChangeWorkspaceHandler(option: DropDownListItem) {
    setActiveWorkspace(option.key);
    reset(workspaces[option.key]);
  }

  function renderItem(item) {
    return (
      <WorkspaceItem
        item={item}
        onSave={addWorkSpaceHandler}
        onDelete={deleteWorkSpaceHandler}
      />
    );
  }

  const setWorkspaceSetting = useCallback(
    (inputWorkspace) => {
      const parseWorkspaceName = Object.keys(inputWorkspace)[0];
      if (preferences.workspace.current === parseWorkspaceName) {
        reset(inputWorkspace[parseWorkspaceName]);
      } else if (workspaces[parseWorkspaceName]) {
        pastRef.current = inputWorkspace;
        dispatch({
          type: 'SET_WORKSPACE',
          payload: {
            workspace: parseWorkspaceName,
            workspaceSource: 'any',
          },
        });
      }
    },
    [dispatch, preferences.workspace, workspaces, reset],
  );
  const isExperimentalFeatures =
    watch('display.general.experimentalFeatures.display') || false;
  useEffect(() => {
    if (pastRef.current) {
      setWorkspaceSetting(pastRef.current);
      pastRef.current = null;
    }
  }, [setWorkspaceSetting]);

  return (
    <FormProvider {...methods}>
      <Dialog
        isOpen
        onClose={onCloseDialog}
        style={{ maxWidth: 1000, width: '50vw', minWidth: 800 }}
        title="General settings"
        icon="cog"
      >
        <div>
          <div
            className={Classes.DIALOG_HEADER}
            style={{
              cursor: 'default',
              paddingTop: '10px',
              boxShadow: 'none',
              backgroundColor: '#f8f8f8',
            }}
          >
            <Label title="Workspace">
              <DropDownButton
                data={workspacesList}
                renderItem={renderItem}
                selectedKey={preferences.workspace.current}
                onSelect={ChangeWorkspaceHandler}
              />
            </Label>
            <WorkSpaceActionsButtons
              onPast={(workspaceSettings) =>
                setWorkspaceSetting(workspaceSettings)
              }
            />
          </div>
        </div>
        <StyledDialogBody>
          <div style={{ height }}>
            <StyledTabs vertical>
              <Tab title="General" id="general" panel={<GeneralTabContent />} />

              <Tab title="Nuclei" id="nuclei" panel={<NucleiTabContent />} />

              <Tab title="Panels" id="display" panel={<DisplayTabContent />} />

              <Tab title="Tools" id="tools" panel={<ToolsTabContent />} />

              <Tab
                title="Databases"
                id="databases"
                panel={
                  <DatabasesTabContent
                    currentWorkspace={workspaceName}
                    originalWorkspaces={originalWorkspaces}
                  />
                }
              />

              <Tab
                title="Import filters"
                id="importation-filters"
                panel={<ImportationFiltersTabContent />}
              />

              <Tab
                title="Title block"
                id="title-block"
                panel={<InfoBlockTabContent />}
              />

              <Tab
                title="Auto processing"
                id="on-load-processing"
                panel={<OnLoadProcessingTabContent />}
              />

              <Tab
                title="Spectra colors"
                id="spectra-colors"
                panel={<SpectraColorsTabContent />}
              />

              {isExperimentalFeatures && (
                <Tab
                  title="External APIs"
                  id="external-apis"
                  panel={<ExternalAPIsTabContent />}
                />
              )}
              <Tab
                title="Export"
                id="export-options"
                panel={<ExportTabContent />}
              />
            </StyledTabs>
          </div>
        </StyledDialogBody>
        <DialogFooter>
          <DialogActionButtons onCloseDialog={onCloseDialog} onSave={onSave} />
        </DialogFooter>
      </Dialog>
    </FormProvider>
  );
}

function WorkSpaceActionsButtons(props) {
  const {
    readText,
    rawWriteWithType,
    shouldFallback,
    cleanShouldFallback,
    text,
  } = useClipboard();
  const toaster = useToaster();
  const { reset } = useFormContext<WorkspaceWithSource>();
  const values = useWatch();
  const {
    originalWorkspaces,
    workspace: { current: workspaceName },
  } = usePreferences();

  function handleReset() {
    const workSpaceDisplayPreferences = getPreferencesByWorkspace(
      workspaceName,
      originalWorkspaces,
    );
    reset(workSpaceDisplayPreferences);
  }

  function handlePastWorkspace(text: string | undefined) {
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
    void readText().then(handlePastWorkspace);
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
        outlined
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
      <StyledButton
        outlined
        onClick={handleCopyWorkspace}
        tooltipProps={{ content: 'Copy workspace preferences', compact: true }}
        marginHorizontal={5}
      >
        <FaRegCopy className={Classes.ICON} />
      </StyledButton>
      <Button
        outlined
        intent="success"
        onClick={handlePastWorkspaceAction}
        tooltipProps={{ content: 'Past workspace preferences', compact: true }}
      >
        <FaPaste className={Classes.ICON} />
      </Button>

      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        onReadText={handlePastWorkspace}
        text={text}
        label="Workspace"
      />
    </div>
  );
}

function DialogActionButtons(props: BasseGeneralModalProps) {
  const { onSave, onCloseDialog } = props;
  const {
    handleSubmit,
    formState: { isValid },
  } = useFormContext<WorkspaceWithSource>();
  const { dispatch } = usePreferences();

  const values = useWatch();

  function submitHandler(values) {
    onSave(values);
    onCloseDialog?.();
  }

  function applyPreferencesHandler() {
    if (!isValid) {
      return handleSubmit(submitHandler)();
    }

    dispatch({
      type: 'APPLY_General_PREFERENCES',
      payload: {
        data: values as any,
      },
    });
    props.onCloseDialog?.();
  }

  return (
    <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
      <ActionButtons
        style={{ flexDirection: 'row-reverse', margin: 0 }}
        onDone={() => handleSubmit(submitHandler)()}
        doneLabel="Apply and Save"
        onCancel={() => {
          props.onCloseDialog?.();
        }}
      />
      <StyledButton
        intent="primary"
        onClick={applyPreferencesHandler}
        marginHorizontal={10}
      >
        Apply
      </StyledButton>
    </div>
  );
}

export default GeneralSettingsModal;
