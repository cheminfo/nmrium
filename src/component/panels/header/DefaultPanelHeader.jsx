import React, { memo } from 'react';
import { FaRegTrashAlt, FaCog } from 'react-icons/fa';

import ToolTip from '../../elements/ToolTip/ToolTip';

const styles = {
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
  container: {
    display: 'flex',
    flexDirection: 'column',
    flexGrow: '1',
    height: '100%',
  },

  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
    padding: '0px 5px',
  },
  counterLabel: {
    margin: 0,
    textAlign: 'right',
    width: '100%',
    lineHeight: '22px',
    padding: '0px 10px',
  },
};
const DefaultPanelHeader = memo(
  ({
    counter,
    onDelete,
    deleteToolTip,
    children,
    showSettingButton = false,
    onSettingClick,
  }) => {
    return (
      <div style={styles.toolbar}>
        <ToolTip title={deleteToolTip} popupPlacement="right">
          <button
            style={styles.button}
            type="button"
            onClick={onDelete}
            disabled={counter === 0}
          >
            <FaRegTrashAlt />
          </button>
        </ToolTip>

        {children}
        <p style={styles.counterLabel}>[ {counter} ]</p>
        {showSettingButton && (
          <ToolTip title="preferences" popupPlacement="left">
            <button
              style={styles.button}
              type="button"
              onClick={onSettingClick}
            >
              <FaCog />
            </button>
          </ToolTip>
        )}
      </div>
    );
  },
);

export default DefaultPanelHeader;
