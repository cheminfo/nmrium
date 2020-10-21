import React, { memo } from 'react';
import { FaRegTrashAlt, FaCog, FaFilter } from 'react-icons/fa';

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
  filterButton: {
    borderRadius: '5px',
    marginTop: '3px',
    marginLeft: '5px',
    color: 'black',
    backgroundColor: 'transparent',
    border: 'none',
    height: '16px',
    width: '18px',
    fontSize: '12px',
    padding: 0,
  },
};
const DefaultPanelHeader = memo(
  ({
    counter,
    onDelete,
    deleteToolTip,
    onFilter,
    filterToolTip,
    filterIsActive,
    counterFiltered,
    children,
    showSettingButton = false,
    onSettingClick,
    showDeleteButton = true,
    showCounterLabel = true,
  }) => {
    return (
      <div style={styles.toolbar}>
        {showDeleteButton && (
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
        )}

        {children}

        {/* Optional if there is no filter needed, e.g. in spectra panel */}
        {onFilter && filterToolTip ? (
          <ToolTip title={filterToolTip} popupPlacement="right">
            <button
              style={
                filterIsActive && filterIsActive === true
                  ? {
                      ...styles.filterButton,
                      backgroundColor: '#6d6d6d',
                      color: 'white',
                      fontSize: '10px',
                    }
                  : styles.filterButton
              }
              type="button"
              onClick={onFilter}
              disabled={counter === 0}
            >
              <FaFilter />
            </button>
          </ToolTip>
        ) : null}

        {showCounterLabel && (
          <p style={styles.counterLabel}>
            [{' '}
            {filterIsActive &&
            filterIsActive === true &&
            counterFiltered !== undefined
              ? `${counterFiltered}/${counter}`
              : counter}{' '}
            ]
          </p>
        )}
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
