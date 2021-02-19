import { SvgNmrSum } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { rangesToACS } from 'nmr-processing';
import { useCallback, useState } from 'react';
import { FaFileExport, FaUnlink, FaSitemap } from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import { CHANGE_RANGE_SUM, DELETE_RANGE } from '../../reducer/types/Types';
import Events from '../../utility/Events';
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
    // width: '18px',
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
}) {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const preferences = usePreferences();
  const [isMultiplicityTreesVisible, showMultiplicityTrees] = useState(false);

  const currentSum = lodashGet(ranges, 'options.sum', null);
  const removeAssignments = useCallback(() => {
    for (const range of ranges.values) {
      onUnlink(range);
    }
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
      observedFrequency, //400
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

  const handleSetShowMultiplicityTrees = useCallback((flag) => {
    Events.emit('showMultiplicityTrees', flag);
    showMultiplicityTrees(flag);
  }, []);

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
          css={styles.button}
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
          isMultiplicityTreesVisible
            ? 'Hide Multiplicity Trees in Spectrum'
            : 'Show Multiplicity Trees in Spectrum'
        }
        popupPlacement="right"
        onClick={handleSetShowMultiplicityTrees}
        disabled={!ranges || !ranges.values || ranges.values.length === 0}
      >
        <FaSitemap style={{ pointerEvents: 'none', fontSize: '12px' }} />
      </ToggleButton>
    </DefaultPanelHeader>
  );
}

export default RangesHeader;
