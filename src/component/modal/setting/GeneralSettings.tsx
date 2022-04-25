/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useMemo, useRef, useState } from 'react';

import {
  usePreferences,
  useWorkspacesList,
} from '../../context/PreferencesContext';
import ActionButtons from '../../elements/ActionButtons';
import CloseButton from '../../elements/CloseButton';
import Tab from '../../elements/Tab/Tab';
import Tabs, { PositionsEnum } from '../../elements/Tab/Tabs';
import DropDownButton, {
  DropDownListItem,
} from '../../elements/dropDownButton/DropDownButton';
import FormikForm from '../../elements/formik/FormikForm';
import { useAlert } from '../../elements/popup/Alert';
import { ModalStyles } from '../ModalStyle';

import ControllersTabContent from './ControllersTabContent';
import DatabasesTabContent from './DatabasesTabContent';
import DisplayTabContent from './DisplayTabContent';
import FormattingTabContent from './FormattingTabContent';
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
  const [activeTab, setActiveTab] = useState('controllers');
  const { dispatch, ...preferences } = usePreferences();
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

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);
  const handleReset = useCallback(() => {
    dispatch({ type: 'RESET_PREFERENCES' });
    alert.success('Settings saved successfully');
    onClose?.();
  }, [alert, dispatch, onClose]);

  const submitHandler = useCallback(
    (values) => {
      dispatch({ type: 'SET_PREFERENCES', payload: values });
      alert.success('Settings saved successfully');

      onClose?.();
    },
    [alert, dispatch, onClose],
  );

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
      </div>
      <div className="main-content">
        <FormikForm
          key={JSON.stringify(preferences.current)}
          ref={refForm}
          initialValues={preferences.current}
          validationSchema={validation}
          onSubmit={submitHandler}
        >
          <Tabs
            position={PositionsEnum.LEFT}
            activeTab={activeTab}
            onClick={tabChangeHandler}
          >
            <Tab tablabel="Controllers" tabid="controllers">
              <div className="inner-content">
                <ControllersTabContent />
              </div>
            </Tab>

            <Tab tablabel="Formatting" tabid="formatting">
              <div className="inner-content">
                <FormattingTabContent />
              </div>
            </Tab>

            <Tab tablabel="Display" tabid="display">
              <div className="inner-content">
                <DisplayTabContent preferences={preferences.current.display} />
              </div>
            </Tab>

            <Tab tablabel="Databases" tabid="databases">
              <div className="inner-content">
                <DatabasesTabContent />
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
          onCancel={handleReset}
          cancelLabel="Reset"
        />
      </div>
    </div>
  );
}

export default GeneralSettings;
