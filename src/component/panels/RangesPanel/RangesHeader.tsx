/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrIntegrate, SvgNmrSum } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { rangesToACS } from 'nmr-processing';
import { useCallback } from 'react';
import {
  FaFileExport,
  FaUnlink,
  FaSitemap,
  FaChartBar,
  FaPlus,
} from 'react-icons/fa';
import { ImLink } from 'react-icons/im';

import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useDispatch } from '../../context/DispatchContext';
import ActiveButton from '../../elements/ActiveButton';
import Button from '../../elements/ButtonToolTip';
import ToggleButton from '../../elements/ToggleButton';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import {
  ADD_RANGE,
  CHANGE_RANGES_SUM_FLAG,
  CHANGE_RANGE_SUM,
  DELETE_RANGE,
  SHOW_J_GRAPH,
  SHOW_MULTIPLICTY_TREES,
  SHOW_RANGES_INTEGRALS,
} from '../../reducer/types/Types';
import { copyHTMLToClipboard } from '../../utility/Export';
import { getNumberOfDecimals } from '../../utility/formatNumber';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import useEditRangeModal from './hooks/useEditRangeModal';

const style = css`
  .btn {
    background-color: transparent;
    border: none;
  }

  .icon svg {
    font-size: 12px;
  }

  .preview-publication-icon svg {
    font-size: 13px;
  }

  button {
    margin-right: 2px;
  }
`;

function RangesHeader({
  id,
  ranges,
  info,
  onUnlink,
  onFilterActivated,
  onSettingClick,
  isFilterActive,
  filterCounter,
  showMultiplicityTrees,
  showJGraph,
  showRangesIntegrals,
  activeTab,
}) {
  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const assignmentData = useAssignmentData();

  const currentSum = lodashGet(ranges, 'options.sum', null);
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  const changeRangesSumHandler = useCallback(
    (value) => {
      dispatch({ type: CHANGE_RANGE_SUM, value });
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
        sumOptions={ranges?.options}
      />,
    );
  }, [changeRangesSumHandler, currentSum, modal, ranges?.options]);

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
    dispatch({ type: SHOW_MULTIPLICTY_TREES, payload: { id } });
  }, [dispatch, id]);

  const handleShowIntegrals = useCallback(() => {
    dispatch({ type: SHOW_RANGES_INTEGRALS, payload: { id } });
  }, [dispatch, id]);

  const handleShowJGraph = useCallback(() => {
    dispatch({ type: SHOW_J_GRAPH, payload: { id } });
  }, [dispatch, id]);

  const saveToClipboardHandler = useCallback(
    (value) => {
      void (async () => {
        const success = await copyHTMLToClipboard(value);
        if (success) {
          alert.success('Data copied to clipboard');
        } else {
          alert.error('copy to clipboard failed');
        }
      })();
    },
    [alert],
  );

  const saveAsHTMLHandler = useCallback(() => {
    const { originFrequency: observedFrequency, nucleus } = info;

    const nbDecimalDelta = getNumberOfDecimals(
      rangesPreferences.deltaPPM.format,
    );
    const nbDecimalJ = getNumberOfDecimals(rangesPreferences.deltaHz.format);

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
  }, [
    info,
    modal,
    ranges.values,
    rangesPreferences?.deltaHz?.format,
    rangesPreferences?.deltaPPM?.format,
    saveToClipboardHandler,
  ]);

  const changeSumConstantFlagHandler = useCallback(
    (flag) => {
      dispatch({
        type: CHANGE_RANGES_SUM_FLAG,
        payload: flag,
      });
    },
    [dispatch],
  );
  const { editRange } = useEditRangeModal();
  const addRangeHandler = useCallback(() => {
    dispatch({
      type: ADD_RANGE,
      payload: { id: 'new' },
    });

    editRange(true);
  }, [dispatch, editRange]);

  return (
    <div css={style}>
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
        <Button
          popupTitle="Preview publication string"
          popupPlacement="right"
          onClick={saveAsHTMLHandler}
          className="btn preview-publication-icon"
        >
          <FaFileExport />
        </Button>
        <Button
          popupTitle={
            currentSum
              ? `Change Ranges Sum (${Number(currentSum).toFixed(2)})`
              : 'Change Ranges Sum'
          }
          popupPlacement="right"
          onClick={showChangeRangesSumModal}
          className="btn icon"
        >
          <SvgNmrSum />
        </Button>
        <Button
          popupTitle="Remove all Assignments"
          popupPlacement="right"
          onClick={handleOnRemoveAssignments}
          disabled={!ranges || !ranges.values || ranges.values.length === 0}
          className="btn icon"
        >
          <FaUnlink />
        </Button>
        <ActiveButton
          popupTitle={
            showMultiplicityTrees
              ? 'Hide Multiplicity Trees in Spectrum'
              : 'Show Multiplicity Trees in Spectrum'
          }
          popupPlacement="right"
          onClick={handleSetShowMultiplicityTrees}
          value={showMultiplicityTrees}
          disabled={!ranges || !ranges.values || ranges.values.length === 0}
        >
          <FaSitemap style={{ pointerEvents: 'none', fontSize: '12px' }} />
        </ActiveButton>
        <ActiveButton
          popupTitle={showJGraph ? 'Hide J Graph' : 'Show J Graph'}
          popupPlacement="right"
          onClick={handleShowJGraph}
          value={showJGraph}
          disabled={!ranges || !ranges.values || ranges.values.length === 0}
        >
          <FaChartBar style={{ pointerEvents: 'none', fontSize: '12px' }} />
        </ActiveButton>
        <ActiveButton
          popupTitle={showRangesIntegrals ? 'Hide integrals' : 'Show integrals'}
          popupPlacement="right"
          onClick={handleShowIntegrals}
          value={showRangesIntegrals}
          disabled={!ranges || !ranges.values || ranges.values.length === 0}
        >
          <SvgNmrIntegrate
            style={{ pointerEvents: 'none', fontSize: '12px' }}
          />
        </ActiveButton>

        <ToggleButton
          className="icon"
          popupTitle="fix integral values"
          popupPlacement="right"
          onClick={changeSumConstantFlagHandler}
        >
          <ImLink />
        </ToggleButton>
        <Button
          popupTitle="Add range"
          popupPlacement="right"
          onClick={addRangeHandler}
          className="btn icon"
        >
          <FaPlus />
        </Button>
      </DefaultPanelHeader>
    </div>
  );
}

export default RangesHeader;
