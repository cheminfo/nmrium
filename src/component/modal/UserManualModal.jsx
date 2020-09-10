/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useEffect, useState } from 'react';
import { FaTimes } from 'react-icons/fa';

import { Tabs, positions } from '../elements/Tab';
import helpData from '../help';

const styles = css`
  width: 600px;
  height: 400px;
  display: flex;
  flex-direction: column;

  .header {
    text-align: center;
    padding: 10px 0 10px 0px;
    margin: 0px;
    color: #000000;
    place-items: normal;
    text-transform: none;
    // border-bottom: 4px solid #2ca8ff;
    background-color: #fafafa;
  }
  .main-content {
    width: 100%;
    height: 100%;
    border: none;
    // overflow: auto;
    padding-left: 5px;
  }

  .close-bt {
    border: none;
    color: red;
    background-color: transparent;
    outline: none;
    position: absolute;
    left: 15px;
    top: 15px;
  }

  .inner-container {
    padding: 5px;
    width: 100%;
    height: 100%;
  }

  .tab-content {
    width: 100%;
  }
`;

const UserManualModal = ({ onClose }) => {
  const [manuals, setManualsData] = useState([]);

  useEffect(() => {
    const manualsData = Object.keys(helpData)
      .reduce((accumulator, key) => {
        if (helpData[key].ShowInGneralUserManual) {
          const datum = { key, ...helpData[key] };
          accumulator.push(datum);
        }
        return accumulator;
      }, [])
      .sort((prev, next) => prev.index - next.index);
    setManualsData(manualsData);
  }, []);
  return (
    <div css={styles}>
      <h6 className="header">User Manual</h6>
      <button onClick={onClose} type="button" className="close-bt">
        <FaTimes />
      </button>
      <div className="main-content">
        <Tabs position={positions.LEFT} defaultTabID="loadSpectrum">
          {manuals.map((manualItem) => (
            <div
              tablabel={manualItem.tabTitle}
              key={manualItem.key}
              tabid={manualItem.key}
              className="inner-container"
            >
              <iframe
                src={manualItem.filePath}
                frameBorder="0"
                scrolling="auto"
                style={{ width: '100%', height: '100%' }}
              />
            </div>
          ))}
        </Tabs>
      </div>
    </div>
  );
};

export default UserManualModal;
