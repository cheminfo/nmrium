import {
  SvgNmrIntegrate,
  SvgNmrPeaks,
  SvgNmrPeaksTopLabels,
} from 'cheminfo-font';
import fileSaver from 'file-saver';
import type { RangesViewState } from 'nmr-load-save';
import type { Info1D, Ranges } from 'nmr-processing';
import { rangesToACS, rangesToTSV } from 'nmr-processing';
import { useState } from 'react';
import {
  FaChartBar,
  FaCopy,
  FaDownload,
  FaFileExport,
  FaSitemap,
  FaUnlink,
} from 'react-icons/fa';
import { ImLink } from 'react-icons/im';
import { LuMessageSquareText } from 'react-icons/lu';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useAssignmentData } from '../../assignment/AssignmentsContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { useAlert } from '../../elements/Alert.js';
import type { ToolbarPopoverMenuItem } from '../../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import CopyClipboardModal from '../../modal/CopyClipboardModal.js';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal.js';
import { booleanToString } from '../../utility/booleanToString.js';
import type { FilterType } from '../../utility/filterType.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';

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

interface RangesHeaderProps {
  ranges: Ranges;
  info: Info1D;
  activeTab: string;
  isFilterActive: boolean;
  onUnlink: () => void;
  onFilterActivated: () => void;
  onSettingClick: () => void;
  filterCounter: number;
}

function RangesHeader(props: RangesHeaderProps) {
  const {
    ranges,
    info,
    activeTab,
    isFilterActive,
    onUnlink,
    onFilterActivated,
    onSettingClick,
    filterCounter,
  } = props;
  const dispatch = useDispatch();
  const alert = useAlert();
  const toaster = useToaster();
  const assignmentData = useAssignmentData();

  // TODO: make sure ranges are not a lie and remove the optional chaining.
  const currentSum = ranges?.options?.sum ?? null;
  const rangesPreferences = usePanelPreferences('ranges', activeTab);
  const [acs, setACS] = useState<string>();

  const {
    showMultiplicityTrees,
    showJGraph,
    showIntegrals,
    showIntegralsValues,
    showPeaks,
    displayingMode,
    showAssignmentsLabels,
    showPublicationString,
  } = useActiveSpectrumRangesViewState();

  function changeRangesSumHandler(options) {
    dispatch({ type: 'CHANGE_RANGE_SUM', payload: { options } });
  }

  function removeAssignments() {
    onUnlink();
  }

  function handleOnRemoveAssignments() {
    alert.showAlert({
      message: 'All assignments will be removed. Are you sure?',
      buttons: [
        { text: 'Yes', onClick: removeAssignments, intent: 'danger' },
        { text: 'No' },
      ],
    });
  }

  function handleDeleteAll() {
    alert.showAlert({
      message: 'All ranges will be deleted. Are You sure?',
      buttons: [
        {
          text: 'Yes',
          onClick: () => {
            dispatch({
              type: 'DELETE_RANGE',
              payload: { assignmentData },
            });
          },
          intent: 'danger',
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
  function handleShowPublicationString() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showPublicationString' },
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
      setACS(result);
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
    fileSaver.saveAs(blob, `${info.name}.tsv`);
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
      <CopyClipboardModal
        text={acs}
        title="Publication string"
        onCopyClick={saveToClipboardHandler}
        onClose={() => setACS('')}
      />
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
            tooltip:
              displayingMode === 'spread'
                ? 'Top of the peak'
                : 'Top of the spectrum',
            onClick: toggleDisplayingMode,
            active: displayingMode === 'spread',
          },
          {
            disabled: !hasRanges,
            icon: <LuMessageSquareText />,
            tooltip: `${booleanToString(!showAssignmentsLabels)} assignments labels`,
            onClick: handleShowAssignmentsLabel,
            active: showAssignmentsLabels,
          },
          {
            disabled: !hasRanges,
            icon: <FaCopy />,
            tooltip: `${booleanToString(!showPublicationString)} publication string`,
            onClick: handleShowPublicationString,
            active: showPublicationString,
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
