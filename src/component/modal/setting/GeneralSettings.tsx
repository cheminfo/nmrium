/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useMemo, useRef, useState } from 'react';

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
import FormikForm from '../../elements/formik/FormikForm';
import { useAlert } from '../../elements/popup/Alert';
import { getPreferencesByWorkspace } from '../../reducer/preferences/utilities/getPreferencesByWorkspace';
import { ModalStyles } from '../ModalStyle';

import DatabasesTabContent from './DatabasesTabContent';
import DisplayTabContent from './DisplayTabContent';
import FormattingTabContent from './FormattingTabContent';
import GeneralTabContent from './GeneralTabContent';
import ToolsTabContent from './ToolsTabContent';
import WorkspaceItem from './WorkspaceItem';
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
    border: 1px solid #cccccc;
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
    .dropdown {
      padding: 0.4em 1em;
    }
    & .label {
      font-size: 0.8em;
    }
  }
`;

interface GeneralSettingsProps {
  onClose?: () => void;
}

function GeneralSettings({ onClose }: GeneralSettingsProps) {
  const [activeTab, setActiveTab] = useState('general');
  const {
    dispatch,
    current: currentWorkspace,
    ...preferences
  } = usePreferences();
  const alert = useAlert();
  const refForm = useRef<any>();
  const workspaces = useWorkspacesList();

  const workspacesList = useMemo(() => {
    return workspaces.concat([
      {
        key: 'new',
        label: 'Custom workspace',
      },
    ]);
  }, [workspaces]);

  const handleSave = () => {
    refForm.current.submitForm();
  };

  const handleReset = () => {
    const workSpaceDisplayPreferences = getPreferencesByWorkspace(
      preferences.workspace.current,
    );
    refForm.current.setValues(workSpaceDisplayPreferences);
  };

  const handleClose = () => {
    onClose?.();
  };

  const submitHandler = (values) => {
    dispatch({ type: 'SET_PREFERENCES', payload: values });
    alert.success('Settings saved successfully');

    onClose?.();
  };

  const tabChangeHandler = useCallback((tab) => {
    setActiveTab(tab.tabid);
  }, []);

  const addWorkSpaceHandler = useCallback(
    (name) => {
      dispatch({
        type: 'ADD_WORKSPACE',
        payload: {
          workspace: name,
          data: refForm.current.values,
        },
      });
    },
    [dispatch],
  );
  const deleteWorkSpaceHandler = useCallback(
    (key) => {
      dispatch({
        type: 'REMOVE_WORKSPACE',
        payload: {
          workspace: key,
        },
      });
    },
    [dispatch],
  );

  const ChangeWorkspaceHandler = useCallback(
    (option: DropDownListItem) => {
      dispatch({
        type: 'SET_WORKSPACE',
        payload: {
          workspace: option.key,
        },
      });
    },
    [dispatch],
  );

  const renderItem = useCallback(
    (item) => {
      return (
        <WorkspaceItem
          item={item}
          onSave={addWorkSpaceHandler}
          onDelete={deleteWorkSpaceHandler}
        />
      );
    },
    [addWorkSpaceHandler, deleteWorkSpaceHandler],
  );

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

        <Button.Danger
          fill="outline"
          size="xSmall"
          onClick={handleReset}
          style={{
            marginLeft: '10px',
          }}
        >
          Reset workspace settings
        </Button.Danger>
      </div>
      <div className="main-content">
        <FormikForm
          key={JSON.stringify(currentWorkspace)}
          ref={refForm}
          initialValues={currentWorkspace}
          validationSchema={validation}
          onSubmit={submitHandler}
        >
          <Tabs
            position={PositionsEnum.LEFT}
            activeTab={activeTab}
            onClick={tabChangeHandler}
          >
            <Tab tablabel="General" tabid="general">
              <div className="inner-content">
                <GeneralTabContent />
              </div>
            </Tab>

            <Tab tablabel="Formatting" tabid="formatting">
              <div className="inner-content">
                <FormattingTabContent />
              </div>
            </Tab>

            <Tab tablabel="Display" tabid="display">
              <div className="inner-content">
                <DisplayTabContent />
              </div>
            </Tab>
            <Tab tablabel="Tools" tabid="tools">
              <div className="inner-content">
                <ToolsTabContent />
              </div>
            </Tab>

            <Tab tablabel="Databases" tabid="databases">
              <div className="inner-content">
                <DatabasesTabContent
                  currentWorkspace={preferences.workspace.current}
                />
              </div>
            </Tab>
          </Tabs>
        </FormikForm>
      </div>
      <div className="footer-container">
        <ActionButtons
          style={{ flexDirection: 'row-reverse', margin: 0 }}
          onDone={handleSave}
          doneLabel="Save"
          onCancel={handleClose}
        />
      </div>
    </div>
  );
}

export default GeneralSettings;
