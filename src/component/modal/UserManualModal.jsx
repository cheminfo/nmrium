/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

import getHelpData from '../constants/help';
import CloseButton from '../elements/CloseButton';

const styles = css`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .manual-header {
    .title {
      text-align: center;
      padding: 10px 0 10px 0px;
      margin: 0px;
      color: #000000;
      place-items: normal;
      text-transform: none;
      // border-bottom: 4px solid #2ca8ff;
      background-color: #fafafa;
    }

    .close-bt {
      border: none;
      color: red;
      background-color: transparent;
      outline: none;
      position: absolute;
      right: 15px;
      top: 10px;
    }
  }
  .main-content {
    width: 100%;
    height: 100%;
    border: none;
    // overflow: auto;
    padding-left: 5px;
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
  const filePath = getHelpData().loadSpectrum.filePath;

  return (
    <div css={styles}>
      <div className="manual-header handle">
        <h6 className="title">User Manual</h6>
        <CloseButton onClick={onClose} className="close-bt" />
      </div>
      <div className="main-content">
        <div className="inner-container">
          <iframe
            title="General User Manual "
            src={filePath}
            frameBorder="0"
            scrolling="auto"
            style={{ width: '100%', height: '100%' }}
          />
        </div>
      </div>
    </div>
  );
};

export default UserManualModal;
