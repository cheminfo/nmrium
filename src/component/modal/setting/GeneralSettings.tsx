/** @jsxImportSource @emotion/react */
import {
  Dialog,
  DialogBody,
  DialogFooter,
  Classes,
  Tabs,
  Tab,
} from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Formik, FormikProps } from 'formik';
import { Workspace } from 'nmr-load-save';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaBolt, FaPaste, FaRegCopy, FaWrench } from 'react-icons/fa';
import { Toolbar, useOnOff } from 'react-science/ui';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import {
  usePreferences,
  useWorkspacesList,
} from '../../context/PreferencesContext';
import { useToaster } from '../../context/ToasterContext';
import ActionButtons from '../../elements/ActionButtons';
import Button from '../../elements/Button';
import Label from '../../elements/Label';
import DropDownButton, {
  DropDownListItem,
} from '../../elements/dropDownButton/DropDownButton';
import { useSaveSettings } from '../../hooks/useSaveSettings';
import { useWorkspaceAction } from '../../hooks/useWorkspaceAction';
import { getPreferencesByWorkspace } from '../../reducer/preferences/utilities/getPreferencesByWorkspace';
import PredefinedWorkspaces from '../../workspaces';

import WorkspaceItem from './WorkspaceItem';
import DatabasesTabContent from './settings-tabs/DatabasesTabContent';
import DisplayTabContent from './settings-tabs/DisplayTabContent';
import GeneralTabContent from './settings-tabs/GeneralTabContent';
import ImportationFiltersTabContent from './settings-tabs/ImportationFiltersTabContent';
import InfoBlockTabContent from './settings-tabs/InfoBlockTabContent';
import NucleiTabContent from './settings-tabs/NucleiTabContent';
import OnLoadProcessingTabContent from './settings-tabs/OnLoadProcessingTabContent';
import SpectraColorsTabContent from './settings-tabs/SpectraColorsTabContent';
import ToolsTabContent from './settings-tabs/ToolsTabContent';
import { validation } from './settingsValidation';

const styles = css`
  .section-header {
    font-size: 13px;
    color: #2ca8ff;
    margin-bottom: 10px;
    border-bottom: 0.55px solid #f9f9f9;
    padding: 6px 2px;
  }

  .label {
    font-size: 12px;
    font-weight: bold;
    margin-right: 10px;
  }

  .input {
    font-size: 14px;
    padding: 3px;
  }

  .checkbox-label {
    min-width: 300px;
    display: inline-block;
  }

  .help-checkbox-element {
    .checkbox-label {
      width: 260px;
    }
  }
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
interface GeneralSettingsModalProps {
  height?: number;
}

function GeneralSettingsModal({ height }: GeneralSettingsModalProps) {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  const {
    dispatch,
    current: currentWorkspace,
    originalWorkspaces,
    ...preferences
  } = usePreferences();
  const { addNewWorkspace, removeWorkspace, setActiveWorkspace } =
    useWorkspaceAction();
  const { saveSettings, SaveSettingsModal } = useSaveSettings();
  const toaster = useToaster();
  const refForm = useRef<FormikProps<any>>(null);
  const workspaces = useWorkspacesList();
  const workspaceName = preferences.workspace.current;
  const [isRestDisabled, setRestDisabled] = useState(
    isRestButtonDisable(currentWorkspace, workspaceName, originalWorkspaces),
  );
  const pastRef = useRef<Record<string, Workspace> | null>(null);

  const workspacesList = useMemo(() => {
    return workspaces.concat([
      {
        key: 'new',
        label: 'Custom workspace',
      } as any,
    ]);
  }, [workspaces]);

  const handleReset = () => {
    const workSpaceDisplayPreferences = getPreferencesByWorkspace(
      workspaceName,
      originalWorkspaces,
    );
    void refForm.current?.setValues(workSpaceDisplayPreferences);
  };

  function submitHandler(values) {
    saveSettings(values);
    closeDialog?.();
  }
  function addWorkSpaceHandler(name) {
    addNewWorkspace(name, refForm.current?.values);
  }

  async function applyPreferencesHandler() {
    const errors = await refForm.current?.validateForm();
    if (Object.keys(errors || {}).length > 0) {
      refForm.current?.handleSubmit();
    } else {
      dispatch({
        type: 'APPLY_General_PREFERENCES',
        payload: {
          data: refForm.current?.values,
        },
      });
      closeDialog?.();
    }
  }

  function deleteWorkSpaceHandler(key) {
    removeWorkspace(key);
  }

  function ChangeWorkspaceHandler(option: DropDownListItem) {
    setActiveWorkspace(option.key);
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

  function handleDisabledRestButton(values) {
    setRestDisabled(
      isRestButtonDisable(values, workspaceName, originalWorkspaces),
    );
  }

  const {
    readText,
    rawWriteWithType,
    shouldFallback,
    cleanShouldFallback,
    text,
  } = useClipboard();

  function handleCopyWorkspace() {
    const data = { [workspaceName]: refForm.current?.values };
    void rawWriteWithType(JSON.stringify(data)).then(() => {
      toaster.show({
        message: 'Workspace copied to clipboard',
        intent: 'success',
      });
    });
  }

  const setWorkspaceSetting = useCallback(
    (inputWorkspace) => {
      const parseWorkspaceName = Object.keys(inputWorkspace)[0];
      if (preferences.workspace.current === parseWorkspaceName) {
        void refForm.current?.setValues(inputWorkspace[parseWorkspaceName]);
      } else if (preferences.workspaces[parseWorkspaceName]) {
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
    [dispatch, preferences.workspace, preferences.workspaces],
  );

  useEffect(() => {
    if (pastRef.current) {
      setWorkspaceSetting(pastRef.current);
      pastRef.current = null;
    }
  }, [setWorkspaceSetting]);

  function handlePastWorkspace(text: string | undefined) {
    if (!text) return;

    try {
      const parseWorkspaces = JSON.parse(text);
      setWorkspaceSetting(parseWorkspaces);
    } catch {
      toaster.show({ message: 'object parse error', intent: 'danger' });
    }

    cleanShouldFallback();
  }

  function handlePastWorkspaceAction() {
    void readText().then(handlePastWorkspace);
  }

  return (
    <>
      <Toolbar.Item
        id="general-settings"
        onClick={openDialog}
        tooltip="General settings"
        icon={<FaWrench />}
      />

      <Dialog
        isOpen={isOpenDialog}
        onClose={closeDialog}
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
            <Button.Action
              size="xSmall"
              onClick={handleReset}
              toolTip="Reset workspace preferences"
              tooltipOrientation="horizontal"
              style={{
                marginLeft: '10px',
              }}
              disabled={isRestDisabled}
            >
              <FaBolt />
            </Button.Action>
            <Button.Done
              size="xSmall"
              fill="outline"
              onClick={handleCopyWorkspace}
              toolTip="Copy workspace preferences"
              tooltipOrientation="horizontal"
              style={{
                marginLeft: '10px',
              }}
            >
              <FaRegCopy />
            </Button.Done>
            <Button.Action
              size="xSmall"
              fill="outline"
              onClick={handlePastWorkspaceAction}
              toolTip="Past workspace preferences"
              tooltipOrientation="horizontal"
              style={{
                marginLeft: '10px',
              }}
            >
              <FaPaste />
            </Button.Action>
          </div>
        </div>
        <DialogBody
          css={css`
            padding: 0;
            background-color: white;
          `}
        >
          <div css={styles} style={{ height }}>
            <Formik
              enableReinitialize
              innerRef={refForm}
              initialValues={currentWorkspace}
              validationSchema={validation}
              onSubmit={submitHandler}
              validate={handleDisabledRestButton}
            >
              <Tabs
                vertical
                css={css`
                  height: 100%;

                  div[role='tabpanel'] {
                    width: 100%;
                    padding: 0.8rem;
                    overflow: auto;
                    max-height: 100%;
                  }
                `}
                fill
              >
                <Tab
                  title="General"
                  id="general"
                  panel={<GeneralTabContent />}
                />

                <Tab title="Nuclei" id="nuclei" panel={<NucleiTabContent />} />

                <Tab
                  title="Panels"
                  id="display"
                  panel={<DisplayTabContent />}
                />

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
              </Tabs>
            </Formik>
          </div>
        </DialogBody>
        <DialogFooter>
          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <ActionButtons
              style={{ flexDirection: 'row-reverse', margin: 0 }}
              onDone={() => refForm.current?.submitForm()}
              doneLabel="Apply and Save"
              onCancel={() => {
                closeDialog?.();
              }}
            />
            <Button.Secondary
              style={{ margin: '0 10px' }}
              onClick={applyPreferencesHandler}
            >
              Apply
            </Button.Secondary>
          </div>
        </DialogFooter>
      </Dialog>
      <SaveSettingsModal />

      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        onReadText={handlePastWorkspace}
        text={text}
        label="Workspace"
      />
    </>
  );
}

export default GeneralSettingsModal;
