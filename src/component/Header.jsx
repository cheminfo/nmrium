import React from 'react';
import { FaRegWindowMaximize } from 'react-icons/fa';
/** @jsx jsx */
import { jsx, css } from '@emotion/core';

const headerStyle = css`
  display: flex;
  align-items: flex-end;
  justify-content: flex-end;

  button {
    width: 40px !important;
    min-width: 40px !important;
    background-color: transparent;
    border: none;
  }
`;

const Header = ({ isFullscreen, onMaximize }) => {
  return (
    <div css={headerStyle} className="header-toolbar">
      {!isFullscreen ? (
        <button type="button" onClick={onMaximize}>
          <FaRegWindowMaximize />
        </button>
      ) : (
        ''
      )}
    </div>
  );
};

Header.defaultProps = {
  onMaximize: function() {
    return null;
  },
};

export default Header;
