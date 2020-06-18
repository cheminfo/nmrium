/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useCallback } from 'react';
import { FaTimes } from 'react-icons/fa';

import { Tabs, positions } from '../elements/Tab';

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
  .content {
    width: 100%;
    height: 100%;
    border: none;
    overflow: auto;
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
  }
`;
const UserManualModal = ({ onClose }) => {
  const onTabChangeHandler = useCallback(() => {}, []);
  return (
    <div css={styles}>
      <h6 className="header">User Manual</h6>
      <button onClick={onClose} type="button" className="close-bt">
        <FaTimes />
      </button>
      <div className="content">
        <Tabs
          onClick={onTabChangeHandler}
          position={positions.LEFT}
          defaultTabID="zoom"
        >
          <div label="zoom" key="zoom" className="inner-container">
            <p>manual 1</p>
          </div>
          <div label="manual 2" key="user1" className="inner-container">
            <p>manual 2</p>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default UserManualModal;
