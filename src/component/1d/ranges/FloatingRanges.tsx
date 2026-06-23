import styled from '@emotion/styled';
import type { Info1D, Range, Ranges, Signal1D } from '@zakodium/nmr-types';
import type {
  BaseRangesTablePreferences,
  BoundingBox,
} from '@zakodium/nmrium-core';
import { checkMultiplicity } from 'nmr-processing';
import { memo, useEffect, useMemo, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { FaCog, FaLink, FaTimes } from 'react-icons/fa';
import { Rnd } from 'react-rnd';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { isSignalRange } from '../../../data/utilities/RangeUtilities.js';
import type { SVGTableColumn } from '../../SVGTable.js';
import { SVGTable } from '../../SVGTable.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import { useActiveNucleusTab } from '../../hooks/useActiveNucleusTab.js';
import { useDialogToggle } from '../../hooks/useDialogToggle.ts';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import { useSVGUnitConverter } from '../../hooks/useSVGUnitConverter.js';
import useSpectraByActiveNucleus from '../../hooks/useSpectraPerNucleus.js';
import { useCheckExportStatus } from '../../hooks/useViewportSize.js';
import { extractChemicalElement } from '../../utility/extractChemicalElement.js';
import { formatNumber } from '../../utility/formatNumber.js';

import { FloatingRangeTablePreferencesModal } from './FloatingRangeTablePreferencesModal.tsx';

const ReactRnd = styled(Rnd)`
  border: 1px solid transparent;

  :hover {
    background-color: white;
    border: 1px solid #ebecf1;

    button {
      visibility: visible;
    }
  }
`;
interface SpectrumRangesInfo {
  ranges: Ranges['values'];
  info: Info1D;
}

interface RangesTableProps {
  data: SpectrumRangesInfo;
}

interface RangeItem {
  id: string;
  delta: string;
  deltaHz: string;
  multiplicity: string;
  integration: string;
  coupling: string;
  from: string;
  to: string;
  absolute: string;
  kind: string;
  assignment: string;
  nbAssignment: string;
}

function buildRangeBaseItem(
  range: Range,
  info: Info1D,
  preferences: BaseRangesTablePreferences,
) {
  const { id, from, to, integration, absolute } = range;
  const formatHz = preferences.deltaHz.format;
  return {
    id,
    from: formatNumber(from, preferences.from.format),
    to: formatNumber(to, preferences.to.format),
    absolute: formatNumber(absolute, preferences.absolute.format),
    integration: isSignalRange(range)
      ? formatNumber(integration, preferences.relative.format)
      : `[ ${formatNumber(integration, preferences.relative.format)} ]`,
    deltaText: `${formatNumber(from, preferences.from.format)} - ${formatNumber(to, preferences.to.format)}`,
    deltaHzText: `${formatNumber(from * info.originFrequency, formatHz)} - ${formatNumber(to * info.originFrequency, formatHz)}`,
    formatHz,
  };
}

function buildSignalItem(
  signal: Signal1D,
  base: ReturnType<typeof buildRangeBaseItem>,
  info: Info1D,
  preferences: BaseRangesTablePreferences,
): RangeItem {
  const {
    multiplicity,
    delta,
    kind = '',
    assignment = '',
    js = [],
    diaIDs,
  } = signal;
  const isNotMultiplet = !checkMultiplicity(multiplicity, ['m']);
  return {
    id: base.id,
    from: base.from,
    to: base.to,
    absolute: base.absolute,
    integration: base.integration,
    multiplicity,
    kind,
    assignment,
    coupling: js
      .map((j) =>
        !Number.isNaN(j.coupling)
          ? formatNumber(j.coupling, preferences.coupling.format)
          : '',
      )
      .join(','),
    delta: isNotMultiplet
      ? base.deltaText
      : formatNumber(delta, preferences.deltaPPM.format),
    deltaHz: isNotMultiplet
      ? base.deltaHzText
      : info?.originFrequency
        ? formatNumber(delta * info.originFrequency, base.formatHz)
        : '',
    nbAssignment: diaIDs?.length ? String(diaIDs.length) : '',
  };
}

function useMapRanges(data: SpectrumRangesInfo): RangeItem[] {
  const { ranges, info } = data;
  const activeTab = useActiveNucleusTab();
  const { floatingTablePreferences: preferences } = usePanelPreferences(
    'ranges',
    activeTab,
  );

  return ranges.flatMap((range) => {
    const base = buildRangeBaseItem(range, info, preferences);
    const { signals = [] } = range;

    if (signals.length === 0) {
      return [
        {
          ...base,
          delta: base.deltaText,
          deltaHz: '',
          multiplicity: 'm',
          coupling: '',
          kind: '',
          assignment: '',
          nbAssignment: '',
        },
      ];
    }

    return signals.map((signal) =>
      buildSignalItem(signal, base, info, preferences),
    );
  });
}

function isColumnVisible(
  pref: BaseRangesTablePreferences[keyof BaseRangesTablePreferences],
): boolean {
  if (typeof pref === 'boolean') return pref;
  return pref?.show;
}

function InnerSVGRangesTable(props: RangesTableProps) {
  const { data } = props;
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const rangesData = useMapRanges(data);
  const { floatingTablePreferences } = usePanelPreferences('ranges', activeTab);

  const element = extractChemicalElement(activeTab);

  const columns = useMemo((): Array<SVGTableColumn<RangeItem>> => {
    const allColumns: Array<
      { prefKey: keyof BaseRangesTablePreferences } & SVGTableColumn<RangeItem>
    > = [
      {
        prefKey: 'showSerialNumber',
        accessorFun: (row) => row.index + 1,
        header: '#',
        width: 40,
      },
      {
        prefKey: 'showAssignmentLabel',
        accessorKey: 'assignment',
        header: 'Assignment',
        width: 120,
      },
      {
        prefKey: 'deltaPPM',
        accessorKey: 'delta',
        header: 'δ (ppm)',
        width: 100,
        rowSpanGroupKey: 'id',
      },
      {
        prefKey: 'deltaHz',
        accessorKey: 'deltaHz',
        header: 'δ (Hz)',
        width: 110,
        rowSpanGroupKey: 'id',
      },
      {
        prefKey: 'from',
        accessorKey: 'from',
        header: `From`,
        width: 60,
      },
      {
        prefKey: 'to',
        accessorKey: 'to',
        header: `To`,
        width: 60,
      },
      {
        prefKey: 'relative',
        accessorKey: 'integration',
        header: `Rel. ${element}`,
        width: 60,
        rowSpanGroupKey: 'id',
      },
      {
        prefKey: 'absolute',
        accessorKey: 'absolute',
        header: 'Absolute',
        width: 80,
        rowSpanGroupKey: 'id',
      },
      {
        prefKey: 'showMultiplicity',
        accessorKey: 'multiplicity',
        header: 'Mult.',
        width: 60,
        rowSpanGroupKey: 'id',
      },
      {
        prefKey: 'coupling',
        accessorKey: 'coupling',
        header: 'J (Hz)',
        width: 120,
      },

      {
        prefKey: 'showAssignment',
        accessorKey: 'nbAssignment',
        header: <FaLink x="15px" y="8px" style={{ fontSize: 10 }} />,
        width: 40,
      },
      {
        prefKey: 'showKind',
        accessorKey: 'kind',
        header: 'Kind',
        width: 120,
      },
    ];

    return allColumns
      .filter(({ prefKey }) =>
        isColumnVisible(floatingTablePreferences[prefKey]),
      )
      .map(({ prefKey: _, ...col }) => ({
        ...col,
        headerTextProps: { fontWeight: 'bold' },
        cellBoxProps: { stroke: '#dedede', fill: 'white', fillOpacity: 0.8 },
        headerBoxProps: { stroke: '#dedede', fill: '#E5E8EB' },
      }));
  }, [floatingTablePreferences, element]);
  if (!data) return null;

  return <SVGTable<RangeItem> data={rangesData} columns={columns} />;
}

const SVGRangesTable = memo(InnerSVGRangesTable);

interface DraggablePublicationStringProps {
  data: SpectrumRangesInfo | undefined;
  bonding: BoundingBox;
  spectrumKey: string;
}

function DraggableRanges(props: DraggablePublicationStringProps) {
  const { data, bonding: externalBounding, spectrumKey } = props;
  const dispatch = useDispatch();
  const { viewerRef } = useGlobal();
  const [bounding, setBounding] = useState<BoundingBox>(externalBounding);
  const [isMoveActive, setIsMoveActive] = useState(false);
  const { percentToPixel, pixelToPercent } = useSVGUnitConverter();
  const isExportProcessStart = useCheckExportStatus();
  const { dialog, closeDialog, openDialog } = useDialogToggle({
    settingModal: false,
  });

  useEffect(() => {
    setBounding({ ...externalBounding });
  }, [externalBounding]);

  function handleResize(
    internalBounding: Pick<BoundingBox, 'height' | 'width'>,
  ) {
    const { width = 0, height = 0 } = convertToPixel(externalBounding);
    internalBounding.width += width;
    internalBounding.height += height;
    setBounding((prevBounding) => ({
      ...prevBounding,
      ...convertToPercent(internalBounding),
    }));
  }

  function handleDrag(internalBounding: Pick<BoundingBox, 'x' | 'y'>) {
    setBounding((prevBounding) => ({
      ...prevBounding,
      ...convertToPercent(internalBounding),
    }));
  }
  function handleChangeInsetBounding(bounding: Partial<BoundingBox>) {
    if (
      typeof bounding?.width === 'number' &&
      typeof bounding?.height === 'number'
    ) {
      const { width, height } = externalBounding;
      bounding.width += width;
      bounding.height += height;
    }

    dispatch({
      type: 'CHANGE_RANGES_VIEW_FLOATING_BOX_BOUNDING',
      payload: {
        spectrumKey,
        bounding: convertToPercent(bounding),
        target: 'rangesBounding',
      },
    });
  }

  function convertToPixel(bounding: Partial<BoundingBox>) {
    const { x, y, height, width } = bounding;
    const output: Partial<BoundingBox> = {};

    if (x) {
      output.x = percentToPixel(x, 'x');
    }
    if (y) {
      output.y = percentToPixel(y, 'y');
    }
    if (width) {
      output.width = width;
    }
    if (height) {
      output.height = height;
    }

    return output;
  }
  function convertToPercent(bounding: Partial<BoundingBox>) {
    const { x, y, height, width } = bounding;
    const output: Partial<BoundingBox> = {};

    if (x) {
      output.x = pixelToPercent(x, 'x');
    }
    if (y) {
      output.y = pixelToPercent(y, 'y');
    }
    if (width) {
      output.width = width;
    }
    if (height) {
      output.height = height;
    }

    return output;
  }

  function handleRemove() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showRanges', spectrumKey },
    });
  }

  const actionButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <BsArrowsMove />,
      intent: 'none',
      title: 'Move ranges table',
      style: { cursor: 'move' },
      className: 'handle',
    },
    {
      icon: <FaCog />,
      intent: 'none',
      title: 'Table preferences',
      onClick: () => {
        openDialog('settingModal');
      },
    },
    {
      icon: <FaTimes />,
      intent: 'danger',
      title: 'Hide ranges table',
      onClick: handleRemove,
    },
  ];
  if (!viewerRef || !data || data?.ranges?.length === 0) return null;

  const { x: xInPercent, y: yInPercent } = bounding;

  const x = percentToPixel(xInPercent, 'x');
  const y = percentToPixel(yInPercent, 'y');

  if (isExportProcessStart) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <SVGRangesTable data={data} />
      </g>
    );
  }

  return (
    <>
      <FloatingRangeTablePreferencesModal
        isOpen={dialog.settingModal}
        onCloseDialog={closeDialog}
      />
      <ReactRnd
        default={{ x, y, width: 'auto', height: 'auto' }}
        position={{ x, y }}
        enableResizing={false}
        minWidth={100}
        minHeight={50}
        dragHandleClassName="handle"
        enableUserSelectHack={false}
        bounds={`#${viewerRef.id}`}
        onDragStart={() => setIsMoveActive(true)}
        onResize={(e, dir, eRef, size, position) =>
          handleResize({ ...size, ...position })
        }
        onResizeStop={(e, dir, eRef, size, position) =>
          handleChangeInsetBounding({ ...size, ...position })
        }
        onDrag={(e, { x, y }) => {
          handleDrag({ x, y });
        }}
        onDragStop={(e, { x, y }) => {
          handleChangeInsetBounding({ x, y });
          setIsMoveActive(false);
        }}
        resizeHandleWrapperStyle={{ backgroundColor: 'white' }}
      >
        <ActionsButtonsPopover
          buttons={actionButtons}
          fill
          positioningStrategy="fixed"
          direction="row"
          targetProps={{ style: { width: '100%', height: '100%' } }}
          space={2}
          {...(isMoveActive && { isOpen: true })}
          x={x}
          y={y}
        >
          <SVGRangesTable data={data} />
        </ActionsButtonsPopover>
      </ReactRnd>
    </>
  );
}

function useSpectraRanges() {
  const spectra = useSpectraByActiveNucleus();
  const output: Record<string, { ranges: Ranges['values']; info: Info1D }> = {};

  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) {
      continue;
    }
    const { id: spectrumKey, ranges, info } = spectrum;

    if (!Array.isArray(ranges?.values) || ranges.values.length === 0) {
      continue;
    }

    output[spectrumKey] = { ranges: ranges.values, info };
  }

  return output;
}

export function FloatingRanges() {
  const spectraRanges = useSpectraRanges();
  const {
    view: { ranges },
  } = useChartData();

  const options = Object.entries(ranges);

  return options.map(([spectrumKey, viewOptions]) => {
    const { showRanges, rangesBounding } = viewOptions;
    if (!showRanges) return null;

    return (
      <DraggableRanges
        key={spectrumKey}
        spectrumKey={spectrumKey}
        bonding={rangesBounding}
        data={spectraRanges[spectrumKey]}
      />
    );
  });
}
