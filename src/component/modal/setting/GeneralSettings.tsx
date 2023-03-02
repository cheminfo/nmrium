/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Formik, FormikProps } from 'formik';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { FaBolt, FaPaste, FaRegCopy } from 'react-icons/fa';

import {
  usePreferences,
  useWorkspacesList,
} from '../../context/PreferencesContext';
import ActionButtons from '../../elements/ActionButtons';
import Button from '../../elements/Button';
import CloseButton from '../../elements/CloseButton';
import Tab from '../../elements/Tab/Tab';
import Tabs, { PositionsEnum } from '../../elements/Tab/Tabs';
import DropDownButton, {
  DropDownListItem,
} from '../../elements/dropDownButton/DropDownButton';
import { useAlert } from '../../elements/popup/Alert';
import { useSaveSettings } from '../../hooks/useSaveSettings';
import { getPreferencesByWorkspace } from '../../reducer/preferences/utilities/getPreferencesByWorkspace';
import { copyTextToClipboard } from '../../utility/export';
import PredefinedWorkspaces from '../../workspaces';
import { Workspace } from '../../workspaces/Workspace';
import { ModalStyles } from '../ModalStyle';

import WorkspaceItem from './WorkspaceItem';
import DatabasesTabContent from './settings-tabs/DatabasesTabContent';
import DisplayTabContent from './settings-tabs/DisplayTabContent';
import FormattingTabContent from './settings-tabs/FormattingTabContent';
import GeneralTabContent from './settings-tabs/GeneralTabContent';
import ImportationFiltersTabContent from './settings-tabs/ImportationFiltersTabContent';
import InfoBlockTabContent from './settings-tabs/InfoBlockTabContent';
import OnLoadProcessingTabContent from './settings-tabs/OnLoadProcessingTabContent';
import ToolsTabContent from './settings-tabs/ToolsTabContent';
import { validation } from './settingsValidation';

const styles = css`
  .main-content {
    width: 100%;
    flex: 1;
    overflow: auto;
    border: none;
  }

  .tab-content {
    width: 100%;
  }

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
    border-radius: 5px;
    border: 1px solid #ccc;
    padding: 5px;
    width: 100px;
    margin-right: 10px;
    height: initial !important;
  }

  .close-bt {
    border: none;
    color: red;
    background-color: transparent;
    outline: none;
    position: absolute;
    right: 10px;
    top: 2px;
    width: 30px;
    height: 30px;
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

  .workspace-container {
    display: flex;
    background-color: #f4f4f4;
    align-items: center;
    cursor: default;
    padding: 0.5em;

    & .label {
      font-size: 0.8em;
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

interface GeneralSettingsProps {
  onClose?: () => void;
}

function GeneralSettings({ onClose }: GeneralSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const {
    dispatch,
    current: currentWorkspace,
    originalWorkspaces,
    ...preferences
  } = usePreferences();
  const saveSettings = useSaveSettings();
  const alert = useAlert();
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
    refForm.current?.setValues(workSpaceDisplayPreferences);
  };

  function submitHandler(values) {
    saveSettings(values);
  }

  const tabChangeHandler = useCallback((tab) => {
    setActiveTab(tab.tabid);
  }, []);

  function addWorkSpaceHandler(name) {
    dispatch({
      type: 'ADD_WORKSPACE',
      payload: {
        workspace: name,
        data: refForm.current?.values,
      },
    });
  }
  function applyPreferencesHandler() {
    dispatch({
      type: 'APPLY_General_PREFERENCES',
      payload: {
        data: refForm.current?.values,
      },
    });
    onClose?.();
  }

  function deleteWorkSpaceHandler(key) {
    dispatch({
      type: 'REMOVE_WORKSPACE',
      payload: {
        workspace: key,
      },
    });
  }

  function ChangeWorkspaceHandler(option: DropDownListItem) {
    dispatch({
      type: 'SET_ACTIVE_WORKSPACE',
      payload: {
        workspace: option.key,
      },
    });
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

  function handleCopyWorkspace() {
    const data = { [workspaceName]: refForm.current?.values };
    void copyTextToClipboard(JSON.stringify(data)).then((flag) => {
      if (flag) {
        alert.success('Workspace copied to clipboard');
      } else {
        alert.error('copied not completed');
      }
    });
  }

  const setWorkspaceSetting = useCallback(
    (inputWorkspace) => {
      const parseWorkspaceName = Object.keys(inputWorkspace)[0];
      if (preferences?.workspace.current === parseWorkspaceName) {
        refForm.current?.setValues(inputWorkspace[parseWorkspaceName]);
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
    [dispatch, preferences?.workspace, preferences.workspaces],
  );

  function handlePastWorkspace() {
    void navigator.clipboard.readText().then((text) => {
      try {
        const parseWorkspaces = JSON.parse(text);
        setWorkspaceSetting(parseWorkspaces);
      } catch {
        alert.error('object parse error');
      }
    });
  }

  useEffect(() => {
    if (pastRef.current) {
      setWorkspaceSetting(pastRef.current);
      pastRef.current = null;
    }
  }, [setWorkspaceSetting]);

  return (
    <div css={[ModalStyles, styles]}>
      <div className="header handle">
        <span>General Settings</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="workspace-container">
        <span className="label">Workspace : </span>

        <DropDownButton
          data={workspacesList}
          renderItem={renderItem}
          selectedKey={preferences?.workspace.current}
          onSelect={ChangeWorkspaceHandler}
        />

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
          onClick={handlePastWorkspace}
          toolTip="Past workspace preferences"
          tooltipOrientation="horizontal"
          style={{
            marginLeft: '10px',
          }}
        >
          <FaPaste />
        </Button.Action>
      </div>
      <div className="main-content">
        <Formik
          enableReinitialize
          innerRef={refForm}
          initialValues={currentWorkspace}
          validationSchema={validation}
          onSubmit={submitHandler}
          validate={handleDisabledRestButton}
        >
          <Tabs
            position={PositionsEnum.LEFT}
            activeTab={activeTab}
            onClick={tabChangeHandler}
          >
            <Tab title="General" tabid="general">
              <div className="inner-content">
                <GeneralTabContent />
              </div>
            </Tab>

            <Tab title="Formatting" tabid="formatting">
              <div className="inner-content">
                <FormattingTabContent />
              </div>
            </Tab>

            <Tab title="Panels" tabid="display">
              <div className="inner-content">
                <DisplayTabContent />
              </div>
            </Tab>

            <Tab title="Tools" tabid="tools">
              <div className="inner-content">
                <ToolsTabContent />
              </div>
            </Tab>

            <Tab title="Databases" tabid="databases">
              <div className="inner-content">
                <DatabasesTabContent
                  currentWorkspace={workspaceName}
                  originalWorkspaces={originalWorkspaces}
                />
              </div>
            </Tab>
            <Tab title="Import filters" tabid="importation-filters">
              <div className="inner-content">
                <ImportationFiltersTabContent />
              </div>
            </Tab>
            <Tab title="Title Block" tabid="title-block">
              <div className="inner-content">
                <InfoBlockTabContent />
              </div>
            </Tab>
            <Tab title="On Load Processing" tabid="on-load-processing">
              <div className="inner-content">
                <OnLoadProcessingTabContent />
              </div>
            </Tab>
          </Tabs>
        </Formik>
      </div>
      <div className="footer-container">
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={() => refForm.current?.submitForm()}
          doneLabel="Apply and Save"
          onCancel={() => {
            onClose?.();
          }}
        />
        <Button.Secondary
          style={{ margin: '0 10px' }}
          onClick={applyPreferencesHandler}
        >
          Apply
        </Button.Secondary>
      </div>
    </div>
  );
}

export default GeneralSettings;
