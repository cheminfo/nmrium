/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { SvgNmrIntegrate, SvgNmrSum } from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { rangesToACS } from 'nmr-processing';
import { FaFileExport, FaUnlink, FaSitemap, FaChartBar } from 'react-icons/fa';
import { ImLink } from 'react-icons/im';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useDispatch } from '../../context/DispatchContext';
import ActiveButton from '../../elements/ActiveButton';
import Button from '../../elements/ButtonToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import { getNumberOfDecimals } from '../../utility/formatNumber';
import DefaultPanelHeader, {
  createFilterLabel,
} from '../header/DefaultPanelHeader';

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

  function changeRangesSumHandler(options) {
    dispatch({ type: 'CHANGE_RANGE_SUM', payload: { options } });
    modal.close();
  }

  function removeAssignments() {
    onUnlink();
  }

  function handleOnRemoveAssignments() {
    modal.showConfirmDialog({
      message: 'All assignments will be removed. Are you sure?',
      buttons: [{ text: 'Yes', handler: removeAssignments }, { text: 'No' }],
    });
  }

  function handleDeleteAll() {
    modal.showConfirmDialog({
      message: 'All ranges will be deleted. Are You sure?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            dispatch({
              type: 'DELETE_RANGE',
              payload: { assignmentData },
            });
          },
        },
        { text: 'No' },
      ],
    });
  }

  function handleSetShowMultiplicityTrees() {
    dispatch({ type: 'SHOW_MULTIPLICITY_TREES', payload: { id } });
  }

  function handleShowIntegrals() {
    dispatch({ type: 'SHOW_RANGES_INTEGRALS', payload: { id } });
  }

  function handleShowJGraph() {
    dispatch({ type: 'SHOW_J_GRAPH', payload: { id } });
  }

  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();

  function saveToClipboardHandler(value: string) {
    void rawWriteWithType(value, 'text/html').then(() =>
      alert.success('Data copied to clipboard'),
    );
  }

  function saveAsHTMLHandler() {
    if (Array.isArray(ranges?.values) && ranges.values.length > 0) {
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
    }
  }

  function changeSumConstantFlagHandler() {
    dispatch({
      type: 'CHANGE_RANGES_SUM_FLAG',
    });
  }

  const hasRanges = Array.isArray(ranges?.values) && ranges.values.length > 0;
  const counter = ranges?.values?.length || 0;
  return (
    <div css={style}>
      <DefaultPanelHeader
        counter={counter}
        counterLabel={createFilterLabel(
          counter,
          isFilterActive && filterCounter,
        )}
        onDelete={handleDeleteAll}
        deleteToolTip="Delete All Ranges"
        onFilter={onFilterActivated}
        filterToolTip={
          isFilterActive ? 'Show all ranges' : 'Hide ranges out of view'
        }
        showSettingButton
        onSettingClick={onSettingClick}
      >
        <Button
          popupTitle="Preview publication string"
          popupPlacement="right"
          onClick={saveAsHTMLHandler}
          className="btn preview-publication-icon"
          disabled={!hasRanges}
        >
          <FaFileExport />
        </Button>
        <ChangeSumModal
          onSave={changeRangesSumHandler}
          sumType="ranges"
          currentSum={currentSum}
          sumOptions={ranges?.options}
          renderButton={(onClick) => (
            <Button
              popupTitle={
                currentSum
                  ? `Change ranges sum (${currentSum.toFixed(2)})`
                  : 'Change ranges sum'
              }
              popupPlacement="right"
              className="btn icon"
              onClick={onClick}
            >
              <SvgNmrSum />
            </Button>
          )}
        />
        <Button
          popupTitle="Remove all assignments"
          popupPlacement="right"
          onClick={handleOnRemoveAssignments}
          disabled={!hasRanges}
          className="btn icon"
        >
          <FaUnlink />
        </Button>
        <ActiveButton
          popupTitle={
            showMultiplicityTrees
              ? 'Hide multiplicity trees in spectrum'
              : 'Show multiplicity trees in spectrum'
          }
          popupPlacement="right"
          onClick={handleSetShowMultiplicityTrees}
          value={showMultiplicityTrees}
          disabled={!hasRanges}
        >
          <FaSitemap style={{ pointerEvents: 'none', fontSize: '12px' }} />
        </ActiveButton>
        <ActiveButton
          popupTitle={showJGraph ? 'Hide J Graph' : 'Show J Graph'}
          popupPlacement="right"
          onClick={handleShowJGraph}
          value={showJGraph}
          disabled={!hasRanges}
        >
          <FaChartBar style={{ pointerEvents: 'none', fontSize: '12px' }} />
        </ActiveButton>
        <ActiveButton
          popupTitle={showRangesIntegrals ? 'Hide integrals' : 'Show integrals'}
          popupPlacement="right"
          onClick={handleShowIntegrals}
          value={showRangesIntegrals}
          disabled={!hasRanges}
        >
          <SvgNmrIntegrate
            style={{ pointerEvents: 'none', fontSize: '12px' }}
          />
        </ActiveButton>

        <ActiveButton
          className="icon"
          popupTitle="Fix integral values"
          popupPlacement="right"
          onClick={changeSumConstantFlagHandler}
          value={ranges?.options?.isSumConstant}
        >
          <ImLink />
        </ActiveButton>
      </DefaultPanelHeader>

      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Preview publication string"
      />
    </div>
  );
}

export default RangesHeader;
