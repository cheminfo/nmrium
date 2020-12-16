/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodash from 'lodash';
import { rangesToACS } from 'nmr-processing';
import { useCallback } from 'react';
import { FaFileExport, FaUnlink, FaSitemap } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import {
  CHANGE_RANGE_SUM,
  DELETE_RANGE,
  SET_SHOW_MULTIPLICITY_TREES,
} from '../../reducer/types/Types';
import { copyHTMLToClipboard } from '../../utility/Export';
import { getNumberOfDecimals } from '../../utility/FormatNumber';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

const sumButton = css`
  background-color: transparent;
  border: none;
  width: 22px;
  height: 22px;
  min-height: 22px;
  background-position: center center;
  background-repeat: no-repeat;
  background-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  outline: outline;
  :focus {
    outline: none !important;
  }
`;

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  removeAssignmentsButton: {
    borderRadius: '5px',
    marginTop: '3px',
    marginLeft: '2px',
    border: 'none',
    height: '16px',
    width: '18px',
    fontSize: '12px',
    padding: 0,
    backgroundColor: 'transparent',
  },
  setShowMultiplicityTreesButton: {
    borderRadius: '5px',
    // marginTop: '3px',
    marginLeft: '5px',
    color: 'black',
    backgroundColor: 'transparent',
    border: 'none',
    width: '22px',
    height: '20px',
    fontSize: '15px',
    padding: 0,
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const RangesHeader = ({
  ranges,
  info,
  activeTab,
  molecules,
  onUnlink,
  onFilterActivated,
  onSettingClick,
  isFilterActive,
  filterCounter,
  showMultiplicityTrees,
}) => {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const preferences = usePreferences();

  const currentSum = lodash.get(ranges, 'options.sum', null);
  const removeAssignments = useCallback(() => {
    ranges.values.forEach((range) => onUnlink(range));
  }, [ranges, onUnlink]);

  const changeRangesSumHandler = useCallback(
    (value) => {
      if (value !== undefined) {
        dispatch({ type: CHANGE_RANGE_SUM, value });
      }

      modal.close();
    },
    [dispatch, modal],
  );

  const showChangeRangesSumModal = useCallback(() => {
    modal.show(
      <ChangeSumModal
        onClose={() => modal.close()}
        onSave={changeRangesSumHandler}
        header={`Set new Ranges Sum (Current: ${currentSum})`}
        molecules={molecules}
        element={activeTab ? activeTab.replace(/[0-9]/g, '') : null}
      />,
    );
  }, [activeTab, changeRangesSumHandler, currentSum, modal, molecules]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All ranges will be deleted, Are You sure?', {
      onYes: () => {
        removeAssignments();
        dispatch({ type: DELETE_RANGE });
      },
    });
  }, [dispatch, modal, removeAssignments]);

  const saveToClipboardHandler = useCallback(
    (value) => {
      const success = copyHTMLToClipboard(value);
      if (success) {
        alert.success('Data copied to clipboard');
      } else {
        alert.error('copy to clipboard failed');
      }
    },
    [alert],
  );

  const saveAsHTMLHandler = useCallback(() => {
    const { originFrequency: observedFrequency, nucleus } = info;
    const format = lodash.get(
      preferences,
      `formatting.nucleusByKey[${nucleus.toLowerCase()}]`,
    );
    const nbDecimalDelta = getNumberOfDecimals(format.ppm);
    const nbDecimalJ = getNumberOfDecimals(format.hz);

    //   {  nucleus: '19F',
    // nbDecimalDelta: 2,
    // nbDecimalJ: 1,
    // observedFrequency: 400}

    const result = rangesToACS(ranges.values, {
      nucleus,
      nbDecimalDelta,
      nbDecimalJ,
      observedFrequency,
    });
    modal.show(
      <CopyClipboardModal
        text={result}
        onCopyClick={saveToClipboardHandler}
        onClose={() => modal.close()}
      />,
      {},
    );
  }, [info, modal, preferences, ranges.values, saveToClipboardHandler]);

  const handleOnRemoveAssignments = useCallback(() => {
    modal.showConfirmDialog('All assignments will be removed, Are you sure?', {
      onYes: removeAssignments,
    });
  }, [removeAssignments, modal]);

  const handleSetShowMultiplicityTrees = useCallback(() => {
    dispatch({
      type: SET_SHOW_MULTIPLICITY_TREES,
    });
  }, [dispatch]);

  return (
    <DefaultPanelHeader
      counter={ranges && ranges.values && ranges.values.length}
      onDelete={handleDeleteAll}
      deleteToolTip="Delete All Ranges"
      onFilter={onFilterActivated}
      filterToolTip={
        isFilterActive ? 'Show all ranges' : 'Hide ranges out of view'
      }
      filterIsActive={isFilterActive}
      counterFiltered={filterCounter}
      showSettingButton="true"
      onSettingClick={onSettingClick}
    >
      <ToolTip title="Preview publication string" popupPlacement="right">
        <button style={styles.button} type="button" onClick={saveAsHTMLHandler}>
          <FaFileExport />
        </button>
      </ToolTip>
      <ToolTip
        title={`Change Ranges Sum (${currentSum})`}
        popupPlacement="right"
      >
        <button
          className="ci-icon-nmr-sum"
          css={sumButton}
          type="button"
          onClick={showChangeRangesSumModal}
        />
      </ToolTip>
      <ToolTip title={`Remove all Assignments`} popupPlacement="right">
        <button
          style={styles.removeAssignmentsButton}
          type="button"
          onClick={handleOnRemoveAssignments}
          disabled={!ranges || !ranges.values || ranges.values.length === 0}
        >
          <FaUnlink />
        </button>
      </ToolTip>
      <ToolTip
        title={
          showMultiplicityTrees
            ? 'Hide Multiplicity Trees in Spectrum'
            : 'Show Multiplicity Trees in Spectrum'
        }
        popupPlacement="right"
      >
        <button
          style={
            showMultiplicityTrees && showMultiplicityTrees === true
              ? {
                  ...styles.setShowMultiplicityTreesButton,
                  backgroundColor: '#6d6d6d',
                  color: 'white',
                }
              : styles.setShowMultiplicityTreesButton
          }
          type="button"
          onClick={handleSetShowMultiplicityTrees}
          disabled={!ranges || !ranges.values || ranges.values.length === 0}
        >
          <FaSitemap />
        </button>
      </ToolTip>
    </DefaultPanelHeader>
  );
};

export default RangesHeader;
