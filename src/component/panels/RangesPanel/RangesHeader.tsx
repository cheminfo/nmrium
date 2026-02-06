import type { Info1D, Ranges } from '@zakodium/nmr-types';
import type { RangesViewState } from '@zakodium/nmrium-core';
import {
  SvgNmrIntegrate,
  SvgNmrPeaks,
  SvgNmrPeaksTopLabels,
} from 'cheminfo-font';
import { rangesToTSV } from 'nmr-processing';
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

import { useDispatch } from '../../context/DispatchContext.js';
import { useAlert } from '../../elements/Alert.js';
import type {
  ToolbarPopoverMenuDivider,
  ToolbarPopoverMenuItem,
} from '../../elements/ToolbarPopoverItem.js';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { useDialogToggle } from '../../hooks/useDialogToggle.js';
import useSpectrum from '../../hooks/useSpectrum.ts';
import { useActiveACSSettings } from '../../hooks/use_acs_settings.ts';
import { PublicationStringModal } from '../../modal/PublicationStringModal.js';
import ChangeSumModal from '../../modal/changeSum/ChangeSumModal.js';
import { booleanToString } from '../../utility/booleanToString.js';
import type { FilterType } from '../../utility/filterType.js';
import { saveAs } from '../../utility/save_as.ts';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';

type ExportRangesType = 'publicationString' | 'rangesToTSV';
interface ExportData {
  id: ExportRangesType;
}
type ExportItem =
  | ToolbarPopoverMenuItem<ExportData>
  | ToolbarPopoverMenuDivider;

const EXPORT_MENU: ExportItem[] = [
  {
    key: 'export-divider',
    menuItemType: 'divider',
    title: 'Export',
  },
  {
    icon: <FaCopy />,
    text: 'Copy publication string',
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
    isFilterActive,
    onUnlink,
    onFilterActivated,
    onSettingClick,
    filterCounter,
  } = props;
  const dispatch = useDispatch();
  const alert = useAlert();
  const currentACSOptions = useActiveACSSettings();
  const spectrum = useSpectrum();
  const { openDialog, dialog, closeDialog } = useDialogToggle({
    publicationStringModal: false,
  });

  // TODO: make sure ranges are not a lie and remove the optional chaining.
  const currentSum = ranges?.options?.sum ?? null;

  const {
    showMultiplicityTrees,
    showJGraph,
    showIntegrals,
    showIntegralsValues,
    showPeaks,
    displayingMode,
    showAssignmentsLabels,
    showPublicationString,
    showRanges,
  } = useActiveSpectrumRangesViewState();

  function changeRangesSumHandler(options: any) {
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
              payload: {},
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
  function handleShowRanges() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showRanges' },
    });
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
    const name = info.name || 'experiment';
    saveAs({ blob, name, extension: '.tsv' });
  }

  function exportHandler(data?: ExportData) {
    switch (data?.id) {
      case 'publicationString': {
        openDialog('publicationStringModal');
        break;
      }
      case 'rangesToTSV':
        handleRangesToTSV();
        break;
      default:
        break;
    }
  }

  const hasRanges = Array.isArray(ranges?.values) && ranges.values.length > 0;
  const total = ranges?.values?.length || 0;

  const lefButtons = [
    {
      component: (
        <ToolbarPopoverItem<ExportData>
          disabled={!hasRanges}
          icon={<FaFileExport />}
          tooltip="Export"
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
        displayingMode === 'spread' ? 'Top of the peak' : 'Top of the spectrum',
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
      tooltip: booleanToString(!showPublicationString, {
        trueLabel: 'Display publication string',
        falseLabel: 'Hide publication string',
      }),
      onClick: handleShowPublicationString,
      active: showPublicationString,
    },
    {
      disabled: !hasRanges,
      icon: <SvgNmrPeaksTopLabels />,
      tooltip: `${booleanToString(!showRanges, { trueLabel: 'Display' })} table`,
      onClick: handleShowRanges,
      active: showRanges,
    },
  ];

  return (
    <div>
      <PublicationStringModal
        isOpen={dialog.publicationStringModal}
        onClose={closeDialog}
        acsExportOptions={currentACSOptions}
        spectrum={spectrum}
        publicationStringVisibility={{
          isShown: showPublicationString,
          toggle: handleShowPublicationString,
        }}
        saveLabel="Copy and apply"
        copyOnSave
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
        leftButtons={lefButtons}
      />
    </div>
  );
}

export default RangesHeader;
