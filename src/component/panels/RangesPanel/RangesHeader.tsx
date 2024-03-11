import {
  SvgNmrIntegrate,
  SvgNmrPeaks,
  SvgNmrPeaksTopLabels,
} from 'cheminfo-font';
import lodashGet from 'lodash/get';
import { RangesViewState } from 'nmr-load-save';
import { rangesToACS } from 'nmr-processing';
import { FaFileExport, FaUnlink, FaSitemap, FaChartBar } from 'react-icons/fa';
import { ImLink } from 'react-icons/im';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import { useModal } from '../../elements/popup/Modal';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import { booleanToString } from '../../utility/booleanToString';
import { FilterType } from '../../utility/filterType';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

function RangesHeader({
  ranges,
  info,
  onUnlink,
  onFilterActivated,
  onSettingClick,
  isFilterActive,
  filterCounter,
  activeTab,
}) {
  const dispatch = useDispatch();
  const modal = useModal();
  const toaster = useToaster();
  const assignmentData = useAssignmentData();

  const currentSum = lodashGet(ranges, 'options.sum', null);
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  const {
    showMultiplicityTrees,
    showJGraph,
    showIntegrals,
    showIntegralsValues,
    showPeaks,
    displayingMode,
  } = useActiveSpectrumRangesViewState();

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
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showMultiplicityTrees' },
    });
  }

  function handleShowIntegralsValues() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showIntegralsValues' },
    });
  }
  function handleShowIntegrals() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showIntegrals' },
    });
  }

  function handleShowJGraph() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showJGraph' },
    });
  }

  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();

  function saveToClipboardHandler(value: string) {
    void rawWriteWithType(value, 'text/html').then(() =>
      toaster.show({ message: 'Data copied to clipboard', intent: 'success' }),
    );
  }

  function saveAsHTMLHandler() {
    if (Array.isArray(ranges?.values) && ranges.values.length > 0) {
      const { originFrequency: observedFrequency, nucleus } = info;

      const result = rangesToACS(ranges.values, {
        nucleus, // '19f'
        deltaFormat: rangesPreferences.deltaPPM.format,
        couplingFormat: rangesPreferences.coupling.format,
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

  function toggleViewProperty(key: keyof FilterType<RangesViewState, boolean>) {
    dispatch({ type: 'TOGGLE_RANGES_VIEW_PROPERTY', payload: { key } });
  }
  function toggleDisplayingMode() {
    dispatch({ type: 'TOGGLE_RANGES_PEAKS_DISPLAYING_MODE' });
  }

  const hasRanges = Array.isArray(ranges?.values) && ranges.values.length > 0;
  const total = ranges?.values?.length || 0;
  return (
    <div>
      <DefaultPanelHeader
        total={total}
        counter={filterCounter}
        onDelete={handleDeleteAll}
        deleteToolTip="Delete All Ranges"
        onFilter={onFilterActivated}
        filterToolTip={
          isFilterActive ? 'Show all ranges' : 'Hide ranges out of view'
        }
        onSettingClick={onSettingClick}
        leftButtons={[
          {
            disabled: !hasRanges,
            icon: <FaFileExport />,
            title: 'Preview publication string',
            onClick: saveAsHTMLHandler,
          },
          {
            component: (
              <ChangeSumModal
                onSave={changeRangesSumHandler}
                sumType="ranges"
                currentSum={currentSum}
                sumOptions={ranges?.options}
              />
            ),
          },
          {
            disabled: !hasRanges,
            icon: <FaUnlink />,
            title: 'Remove all assignments',
            onClick: handleOnRemoveAssignments,
          },
          {
            disabled: !hasRanges,
            icon: <FaSitemap />,
            title: `${booleanToString(!showMultiplicityTrees)} multiplicity trees in spectrum`,
            onClick: handleSetShowMultiplicityTrees,
            active: showMultiplicityTrees,
          },
          {
            disabled: !hasRanges,
            icon: <FaChartBar />,
            title: `${booleanToString(!showJGraph)} J Graph`,
            onClick: handleShowJGraph,
            active: showJGraph,
          },
          {
            disabled: !hasRanges,
            icon: <SvgNmrIntegrate />,
            title: `${booleanToString(!showIntegrals)} integrals`,
            onClick: handleShowIntegrals,
            active: showIntegrals,
          },
          {
            disabled: !hasRanges,
            icon: <SvgNmrIntegrate />,
            title: `${booleanToString(!showIntegralsValues)} integrals values`,
            onClick: handleShowIntegralsValues,
            active: showIntegralsValues,
          },
          {
            icon: <ImLink />,
            title: 'Fixed integration sum',
            onClick: changeSumConstantFlagHandler,
            active: ranges?.options?.isSumConstant,
          },
          {
            id: 'ranges-toggle-peaks',
            disabled: !hasRanges,
            icon: <SvgNmrPeaks />,
            title: `${booleanToString(!showPeaks)} peaks`,
            onClick: () => toggleViewProperty('showPeaks'),
            active: showPeaks,
          },
          {
            disabled: !hasRanges,
            icon: <SvgNmrPeaksTopLabels />,
            title: `${displayingMode === 'spread' ? 'Single' : 'Spread'} mode`,
            onClick: toggleDisplayingMode,
            active: displayingMode === 'spread',
          },
        ]}
      />

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
