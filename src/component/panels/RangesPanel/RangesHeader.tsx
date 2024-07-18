import {
  SvgNmrIntegrate,
  SvgNmrPeaks,
  SvgNmrPeaksTopLabels,
} from 'cheminfo-font';
import { saveAs } from 'file-saver';
import lodashGet from 'lodash/get';
import { RangesViewState } from 'nmr-load-save';
import { rangesToACS, rangesToTSV } from 'nmr-processing';
import {
  FaFileExport,
  FaUnlink,
  FaSitemap,
  FaChartBar,
  FaCopy,
  FaDownload,
} from 'react-icons/fa';
import { ImLink } from 'react-icons/im';
import { LuSubtitles } from 'react-icons/lu';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import {
  ToolbarPopoverItem,
  ToolbarPopoverMenuItem,
} from '../../elements/ToolbarPopoverItem';
import { useModal } from '../../elements/popup/Modal';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal';
import { booleanToString } from '../../utility/booleanToString';
import { FilterType } from '../../utility/filterType';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

type ExportRangesType = 'publicationString' | 'rangesToTSV';
interface ExportData {
  id: ExportRangesType;
}
type ExportItem = ToolbarPopoverMenuItem<ExportData>;

const EXPORT_MENU: ExportItem[] = [
  {
    icon: <FaCopy />,
    text: 'Preview publication string',
    data: {
      id: 'publicationString',
    },
  },
  {
    icon: <FaDownload />,
    text: 'Export ranges as TSV',
    data: {
      id: 'rangesToTSV',
    },
  },
] as const;

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
    showAssignmentsLabels,
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
  function handleShowAssignmentsLabel() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showAssignmentsLabels' },
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

  function handleRangesToTSV() {
    const tsv = rangesToTSV(ranges.values);
    const blob = new Blob([tsv], { type: 'text/plain' });
    saveAs(blob, `${info.name}.tsv`);
  }

  function exportHandler(data?: ExportData) {
    switch (data?.id) {
      case 'publicationString':
        saveAsHTMLHandler();
        break;
      case 'rangesToTSV':
        handleRangesToTSV();
        break;
      default:
        break;
    }
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
            component: (
              <ToolbarPopoverItem<ExportData>
                disabled={!hasRanges}
                icon={<FaFileExport />}
                tooltip="Export as"
                options={EXPORT_MENU}
                onClick={exportHandler}
              />
            ),
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
            icon: <ImLink />,
            tooltip: 'Fixed integration sum',
            onClick: changeSumConstantFlagHandler,
            active: ranges?.options?.isSumConstant,
          },
          {
            disabled: !hasRanges,
            icon: <FaUnlink />,
            tooltip: 'Remove all assignments',
            onClick: handleOnRemoveAssignments,
          },
          {
            disabled: !hasRanges,
            icon: <FaSitemap />,
            tooltip: `${booleanToString(!showMultiplicityTrees)} multiplicity trees in spectrum`,
            onClick: handleSetShowMultiplicityTrees,
            active: showMultiplicityTrees,
          },
          {
            disabled: !hasRanges,
            icon: <FaChartBar />,
            tooltip: `${booleanToString(!showJGraph)} J Graph`,
            onClick: handleShowJGraph,
            active: showJGraph,
          },
          {
            disabled: !hasRanges,
            icon: <SvgNmrIntegrate />,
            tooltip: `${booleanToString(!showIntegrals)} integrals`,
            onClick: handleShowIntegrals,
            active: showIntegrals,
          },
          {
            disabled: !hasRanges,
            icon: <SvgNmrIntegrate />,
            tooltip: `${booleanToString(!showIntegralsValues)} integrals values`,
            onClick: handleShowIntegralsValues,
            active: showIntegralsValues,
          },

          {
            id: 'ranges-toggle-peaks',
            disabled: !hasRanges,
            icon: <SvgNmrPeaks />,
            tooltip: `${booleanToString(!showPeaks)} peaks`,
            onClick: () => toggleViewProperty('showPeaks'),
            active: showPeaks,
          },
          {
            disabled: !hasRanges,
            icon: <SvgNmrPeaksTopLabels />,
            tooltip: `${displayingMode === 'spread' ? 'Single' : 'Spread'} mode`,
            onClick: toggleDisplayingMode,
            active: displayingMode === 'spread',
          },
          {
            disabled: !hasRanges,
            icon: <LuSubtitles />,
            tooltip: `${booleanToString(!showAssignmentsLabels)} assignments labels`,
            onClick: handleShowAssignmentsLabel,
            active: showAssignmentsLabels,
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
