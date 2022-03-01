/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useCallback, useRef, useState } from 'react';

import { usePreferences } from '../../context/PreferencesContext';
import CloseButton from '../../elements/CloseButton';
import Tab from '../../elements/Tab/Tab';
import Tabs, { PositionsEnum } from '../../elements/Tab/Tabs';
import FormikForm from '../../elements/formik/FormikForm';
import { SET_PREFERENCES } from '../../reducer/preferencesReducer';

import ControllersTabContent from './ControllersTabContent';
import DisplayTabContent from './DisplayTabContent';
import FormattingTabContent from './FormattingTabContent';

const styles = css`
  overflow: auto;
  height: 100%;
  display: flex;
  flex-direction: column;

  .header {
    text-align: center;
    padding: 10px 0 10px 0px;
    margin: 0px;
    color: #005d9e;
    place-items: normal;
    text-transform: none;
    background-color: #fcfcfc;
  }
  .main-content {
    width: 100%;
    flex: 1;
    overflow: auto;
    border: none;
  }

  .tab-content {
    width: 100%;
  }

  .inner-content {
    padding: 15px 30px;
    width: 100%;
    overflow: auto;
  }

  button:focus {
    outline: none;
  }
  button:hover {
    color: #007bff;
  }
  .btn:hover {
    background-color: #ffffff;
  }
  .btn {
    border: none;
    padding: 0 15px;
    background-color: #ffffff5e;
    border-radius: 5px;
    height: 25px;
  }

  .footer-container {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    background: rgb(242, 242, 242);
    background: -moz-linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    background: -webkit-linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    background: linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    filter: progid:DXImageTransform.Microsoft.gradient(startColorstr="#f2f2f2",endColorstr="#ffffff",GradientType=1);
    padding: 6px 15px;
    height: 55px;
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
  .checkbox-element {
    margin-bottom: 5px;
  }
`;

interface GeneralSettingsProps {
  onClose?: () => void;
  onSave?: () => void;
}

function GeneralSettings({ onClose, onSave }: GeneralSettingsProps) {
  const [activeTab, setActiveTab] = useState('controllers');
  const preferences = usePreferences();
  const refForm = useRef<any>();

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
  }, []);

  const submitHandler = useCallback(
    (values) => {
      preferences.dispatch({ type: SET_PREFERENCES, payload: values });
      onSave?.();
    },
    [onSave, preferences],
  );

  const tabChangeHandler = useCallback((tab) => {
    setActiveTab(tab.tabid);
  }, []);

  return (
    <div css={styles}>
      <div className="header handle">
        <span>General Settings</span>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="main-content">
        <FormikForm
          ref={refForm}
          initialValues={preferences}
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
                <DisplayTabContent preferences={preferences} />
              </div>
            </Tab>
          </Tabs>
        </FormikForm>
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="btn">
          Save
        </button>
      </div>
    </div>
  );
}

export default GeneralSettings;
