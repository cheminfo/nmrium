/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback, useEffect, useRef, useState } from 'react';

import CloseButton from '../../elements/CloseButton';
import { Tabs } from '../../elements/Tab';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { useStateWithLocalStorage } from '../../utility/LocalStorage';

import initSetting from './InitSetting';

const styles = css`
  overflow: auto;
  width: 600px;

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
    height: 250px;
    border: none;
    // padding-top: 10px;
  }

  .inner-content {
    padding: 15px;
  }

  button:focus {
    outline: none;
  }
  button:hover {
    color: #007bff;
  }
  .save-button:hover {
    background-color: #ffffff;
  }
  .save-button {
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
`;

const GeneralSettings = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('controllers');
  const [settingData, setSettingsData] = useStateWithLocalStorage(
    'general_settings',
  );
  const refForm = useRef();

  useEffect(() => {
    refForm.current.setValues({ ...initSetting, ...settingData });
  }, [settingData]);

  const handleSave = useCallback(() => {
    refForm.current.submitForm();
    // setSettingsData(JSON.stringify({ ...settingData, ...tempData }));
    // onSave();
    // tempData = {};
  }, []);

  const submitHandler = useCallback(
    (values) => {
      // setSettingsData(JSON.stringify({ ...settingData, ...tempData }));
      setSettingsData(JSON.stringify(values));
      onSave();
    },
    [onSave, setSettingsData],
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
          initialValues={initSetting}
          onSubmit={submitHandler}
        >
          <Tabs
            position="LEFT"
            defaultTabID={activeTab}
            onClick={tabChangeHandler}
          >
            <div
              className="inner-content"
              tablabel="controllers"
              tabid="controllers"
            >
              <p className="section-header">Mouse Scroll Wheel Sensitivity</p>
              <FormikInput
                type="number"
                label="Low"
                name="controllers.mws.low"
              />
              <FormikInput
                type="number"
                label="high"
                name="controllers.mws.high"
              />
            </div>
          </Tabs>
        </FormikForm>
      </div>
      <div className="footer-container">
        <button type="button" onClick={handleSave} className="save-button">
          Save
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
