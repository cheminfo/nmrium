import React from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

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
  },
  counterLabel: {
    margin: 0,
    textAlign: 'right',
    width: '100%',
    lineHeight: '22px',
    padding: '0px 10px',
  },
};
const DefaultPanelHeader = ({ counter, onDelete, deleteToolTip }) => {
  return (
    <div style={styles.toolbar}>
      <ToolTip title={deleteToolTip} popupPlacement="left">
        <button
          style={styles.button}
          type="button"
          onClick={onDelete}
          disabled={counter === 0}
        >
          <FaRegTrashAlt />
        </button>
      </ToolTip>
      <p style={styles.counterLabel}>[ {counter} ]</p>
    </div>
  );
};

export default DefaultPanelHeader;
