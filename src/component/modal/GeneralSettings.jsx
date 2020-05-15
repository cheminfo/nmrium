/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import lodash from 'lodash';
import { useCallback, useState } from 'react';

import { Tabs } from '../elements/Tab';
import { zoomDefaultValues } from '../reducer/helper/Spectrum1DZoomHelper';
import { useStateWithLocalStorage, getValue } from '../utility/LocalStorage';

const styles = css`
  overflow: auto;
  width: 600px;

  .header {
    text-align: center;
    padding: 10px 0 0 0px;
    margin: 0px;
    color: #000000;
    place-items: normal;
    text-transform: none;
  }
  .content {
    width: 100%;
    height: 250px;
    border: none;
    padding-top: 10px;
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
  button {
    border: none;
    height: 100%;
    padding: 0 20px;
    background-color: #ffffff;
    border-radius: 10px;
    margin: 0px 5px;
  }

  .footer-container {
    display: flex;
    align-items: flex-end;
    justify-content: flex-end;
    background-color: #2ca8ff;
    padding: 8px 15px;
    height: 50px;
  }

  .section-header {
    font-size: 13px;
    color: #2ca8ff;
    margin-bottom: 10px;
    border-bottom: 0.55px solid #f9f9f9;
    padding: 6px 2px;
  }

  .input-label {
    font-size: 12px;
    font-weight: bold;
    margin-right: 10px;
  }

  .number-input {
    font-size: 14px;
    border-radius: 5px;
    border: 1px solid #cccccc;
    padding: 5px;
    width: 100px;
    margin-right: 10px;
  }
`;

let tempData = {};

const GeneralSettings = ({ onClose, onSave }) => {
  const [activeTab, setActiveTab] = useState('controllers');
  const [settingData, setSettingsData] = useStateWithLocalStorage('settings');

  const handleSave = useCallback(() => {
    setSettingsData(JSON.stringify({ ...settingData, ...tempData }));
    onSave();
    tempData = {};
  }, [onSave, setSettingsData, settingData]);

  const tabChangeHandler = useCallback((tab) => {
    setActiveTab(tab);
  }, []);

  const getValueFromStorage = (keyPath, defaultValue = null) => {
    return getValue(settingData, keyPath, defaultValue);
  };

  const onInputChange = useCallback(
    (event) => {
      const names = event.target.name.split('-');
      let temp = { ...settingData, ...tempData };
      if (names.length === 2) {
        temp = lodash.set(
          temp,
          `${activeTab.toLowerCase()}.${names[0]}.${names[1]}`,
          event.target.value,
        );
      } else {
        temp = lodash.set(
          temp,
          `${activeTab.toLowerCase()}.${names[0]}`,
          event.target.value,
        );
      }
      tempData = temp;
    },
    [activeTab, settingData],
  );

  return (
    <div css={styles}>
      <h6 className="header">General Settings</h6>
      <div className="content">
        <Tabs defaultTabID={activeTab} onClick={tabChangeHandler}>
          <div className="inner-content" label="controllers" key="controllers">
            <p className="section-header">Mouse Scroll Wheel Sensitivity</p>
            <span className="input-label">Low</span>
            <input
              name="mws-low"
              className="number-input"
              type="number"
              onChange={onInputChange}
              defaultValue={getValueFromStorage(
                'controllers.mws.low',
                zoomDefaultValues.lowStep,
              )}
            />
            <span className="input-label">High</span>
            <input
              name="mws-high"
              className="number-input"
              type="number"
              onChange={onInputChange}
              defaultValue={getValueFromStorage(
                'controllers.mws.high',
                zoomDefaultValues.highStep,
              )}
            />
          </div>
        </Tabs>
      </div>
      <div className="footer-container">
        <button type="button" onClick={onClose}>
          Close
        </button>
        <button type="button" onClick={handleSave}>
          Save
        </button>
      </div>
    </div>
  );
};

export default GeneralSettings;
