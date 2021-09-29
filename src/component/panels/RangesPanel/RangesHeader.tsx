import { SvgNmrIntegrate, SvgNmrSum } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { rangesToACS } from 'nmr-processing';
import { useCallback } from 'react';
import { FaFileExport, FaUnlink, FaSitemap } from 'react-icons/fa';
import { ImLink } from 'react-icons/im';

import { useAssignmentData } from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import {
  CHANGE_RANGES_SUM_FLAG,
  CHANGE_RANGE_SUM,
  DELETE_RANGE,
  SHOW_MULTIPLICTY_TREES,
  SHOW_RANGES_INTEGRALS,
} from '../../reducer/types/Types';
import { copyHTMLToClipboard } from '../../utility/Export';
import { getNumberOfDecimals } from '../../utility/FormatNumber';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  center: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '5px',
  },
  removeAssignmentsButton: {
    border: 'none',
    height: '16px',
    fontSize: '12px',
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

function RangesHeader({
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
  showRangesIntegrals,
}) {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const preferences = usePreferences();
  const assignmentData = useAssignmentData();

  const currentSum = lodashGet(ranges, 'options.sum', null);

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
        header={
          currentSum
            ? `Set new Ranges Sum (Current: ${Number(currentSum).toFixed(2)})`
            : 'Set new Ranges Sum'
        }
        molecules={molecules}
        element={activeTab ? activeTab.replace(/[0-9]/g, '') : null}
      />,
    );
  }, [activeTab, changeRangesSumHandler, currentSum, modal, molecules]);

  const removeAssignments = useCallback(() => {
    onUnlink();
  }, [onUnlink]);

  const handleOnRemoveAssignments = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All assignments will be removed. Are you sure?',
      buttons: [{ text: 'Yes', handler: removeAssignments }, { text: 'No' }],
    });
  }, [removeAssignments, modal]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All ranges will be deleted. Are You sure?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            dispatch({
              type: DELETE_RANGE,
              payload: { data: { assignmentData } },
            });
          },
        },
        { text: 'No' },
      ],
    });
  }, [assignmentData, dispatch, modal]);

  const handleSetShowMultiplicityTrees = useCallback(() => {
    dispatch({ type: SHOW_MULTIPLICTY_TREES });
  }, [dispatch]);
  const handleShowIntegrals = useCallback(() => {
    dispatch({ type: SHOW_RANGES_INTEGRALS });
  }, [dispatch]);

  const saveToClipboardHandler = useCallback(
    async (value) => {
      const success = await copyHTMLToClipboard(value);
      if (success) {
        alert.success('Data copied to clipboard');
      } else {
        alert.error('copy to clipboard failed');
      }
    },
    [alert],
  );

  const saveAsHTMLHandler = useCallback(() => {
    const { originFrequency: frequencyObserved, nucleus } = info;
    const format = lodashGet(
      preferences,
      `formatting.nucleusByKey[${nucleus.toLowerCase()}]`,
    );
    const nbDecimalDelta = getNumberOfDecimals(format.ppm);
    const nbDecimalJ = getNumberOfDecimals(format.hz);

    const result = rangesToACS(ranges.values, {
      nucleus, // '19f'
      nbDecimalDelta, // 2
      nbDecimalJ, // 1
      frequencyObserved, //400
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

  const changeSumContantFlagHandler = useCallback(
    (flag) => {
      dispatch({
        type: CHANGE_RANGES_SUM_FLAG,
        payload: flag,
      });
    },
    [dispatch],
  );

  return (
    <DefaultPanelHeader
      counter={ranges?.values?.length}
      onDelete={handleDeleteAll}
      deleteToolTip="Delete All Ranges"
      onFilter={onFilterActivated}
      filterToolTip={
        isFilterActive ? 'Show all ranges' : 'Hide ranges out of view'
      }
      filterIsActive={isFilterActive}
      counterFiltered={filterCounter}
      showSettingButton
      onSettingClick={onSettingClick}
    >
      <ToolTip title="Preview publication string" popupPlacement="right">
        <button style={styles.button} type="button" onClick={saveAsHTMLHandler}>
          <FaFileExport />
        </button>
      </ToolTip>
      <ToolTip
        title={
          currentSum
            ? `Change Ranges Sum (${Number(currentSum).toFixed(2)})`
            : 'Change Ranges Sum'
        }
        popupPlacement="right"
      >
        <button
          style={styles.button}
          type="button"
          onClick={showChangeRangesSumModal}
        >
          <SvgNmrSum />
        </button>
      </ToolTip>
      <ToolTip title={`Remove all Assignments`} popupPlacement="right">
        <button
          style={{ ...styles.center, ...styles.removeAssignmentsButton }}
          type="button"
          onClick={handleOnRemoveAssignments}
          disabled={!ranges || !ranges.values || ranges.values.length === 0}
        >
          <FaUnlink />
        </button>
      </ToolTip>

      <ToggleButton
        popupTitle={
          showMultiplicityTrees
            ? 'Hide Multiplicity Trees in Spectrum'
            : 'Show Multiplicity Trees in Spectrum'
        }
        popupPlacement="right"
        onClick={handleSetShowMultiplicityTrees}
        disabled={!ranges || !ranges.values || ranges.values.length === 0}
      >
        <FaSitemap style={{ pointerEvents: 'none', fontSize: '12px' }} />
      </ToggleButton>
      <ToggleButton
        popupTitle={showRangesIntegrals ? 'Hide integrals' : 'Show integrals'}
        popupPlacement="right"
        onClick={handleShowIntegrals}
        defaultValue={showRangesIntegrals}
        disabled={!ranges || !ranges.values || ranges.values.length === 0}
      >
        <SvgNmrIntegrate style={{ pointerEvents: 'none', fontSize: '12px' }} />
      </ToggleButton>

      <ToggleButton
        popupTitle="fix integral values"
        popupPlacement="right"
        onClick={changeSumContantFlagHandler}
      >
        <ImLink />
      </ToggleButton>
    </DefaultPanelHeader>
  );
}

export default RangesHeader;
