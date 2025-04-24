import styled from '@emotion/styled';
import { checkMultiplicity } from 'nmr-processing';
import type { Ranges } from 'nmr-processing';
import type { BoundingBox } from 'nmrium-core';
import { memo, useEffect, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { Rnd } from 'react-rnd';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { checkRangeKind } from '../../data/utilities/RangeUtilities.js';
import { SVGTable } from '../SVGTable.js';
import type { SVGTableColumn } from '../SVGTable.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useGlobal } from '../context/GlobalContext.js';
import { ActionsButtonsPopover } from '../elements/ActionsButtonsPopover.js';
import type { ActionsButtonsPopoverProps } from '../elements/ActionsButtonsPopover.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import { useSVGUnitConverter } from '../hooks/useSVGUnitConverter.js';
import useSpectraByActiveNucleus from '../hooks/useSpectraPerNucleus.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.js';
import { extractChemicalElement } from '../utility/extractChemicalElement.js';
import { formatNumber } from '../utility/formatNumber.js';

const ReactRnd = styled(Rnd)`
  border: 1px solid transparent;

  &:hover {
    border: 1px solid #ebecf1;
    background-color: white;

    button {
      visibility: visible;
    }
  }
`;

interface RangesTableProps {
  ranges: Ranges['values'];
}

interface RangeItem {
  id: string;
  delta: string;
  multiplicity: string;
  integration: string;
  coupling: string;
}

function useMapRanges(ranges: Ranges['values']) {
  const output: RangeItem[] = [];
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const preferences = usePanelPreferences('ranges', activeTab);
  for (const range of ranges) {
    const { id, from, to, integration, signals = [] } = range;
    const relativeFlag = checkRangeKind(range);
    const formattedValue = formatNumber(
      integration,
      preferences.relative.format,
    );
    const integrationValue = relativeFlag
      ? formattedValue
      : `[ ${formattedValue} ]`;

    const rangeText = `${formatNumber(from, preferences.from.format)} - ${formatNumber(
      to,
      preferences.to.format,
    )}`;
    if (signals.length > 0) {
      for (const signal of signals) {
        const { multiplicity, delta, js = [] } = signal;
        const coupling = js
          .map((jsItem) =>
            !Number.isNaN(Number(jsItem.coupling))
              ? formatNumber(jsItem.coupling, preferences.coupling.format)
              : '',
          )
          .join(',');
        const signalDelta = !checkMultiplicity(multiplicity, ['m'])
          ? rangeText
          : formatNumber(delta, preferences.deltaPPM.format);
        output.push({
          id,
          delta: signalDelta,
          multiplicity,
          integration: integrationValue,
          coupling,
        });
      }
    } else {
      output.push({
        id,
        delta: rangeText,
        multiplicity: 'm',
        integration: integrationValue,
        coupling: '',
      });
    }
  }
  return output;
}
function InnerSVGRangesTable(props: RangesTableProps) {
  const { ranges } = props;
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const data = useMapRanges(ranges);

  if (!data) return null;

  const element = extractChemicalElement(activeTab);

  const columns: Array<SVGTableColumn<RangeItem>> = [
    {
      accessorKey: 'delta',
      header: 'δ (ppm)',
      width: 100,
      rowSpanGroupKey: 'id',
      headerTextProps: { fontWeight: 'bold' },
      cellBoxProps: { stroke: '#dedede', fill: 'white', fillOpacity: 0.8 },
      headerBoxProps: { stroke: '#dedede', fill: '#E5E8EB' },
    },
    {
      accessorKey: 'integration',
      header: `Rel. ${element}`,
      width: 60,
      rowSpanGroupKey: 'id',
      headerTextProps: { fontWeight: 'bold' },
      cellBoxProps: { stroke: '#dedede', fill: 'white', fillOpacity: 0.8 },
      headerBoxProps: { stroke: '#dedede', fill: '#E5E8EB' },
    },
    {
      accessorKey: 'multiplicity',
      header: 'Mult.',
      width: 60,
      rowSpanGroupKey: 'id',
      headerTextProps: { fontWeight: 'bold' },
      cellBoxProps: { stroke: '#dedede', fill: 'white', fillOpacity: 0.8 },
      headerBoxProps: { stroke: '#dedede', fill: '#E5E8EB' },
    },
    {
      accessorKey: 'coupling',
      header: 'J (Hz)',
      width: 120,
      headerTextProps: { fontWeight: 'bold' },
      cellBoxProps: { stroke: '#dedede', fill: 'white', fillOpacity: 0.8 },
      headerBoxProps: { stroke: '#dedede', fill: '#E5E8EB' },
    },
  ];

  return <SVGTable<RangeItem> data={data} columns={columns} />;
}

const SVGRangesTable = memo(InnerSVGRangesTable);

interface DraggablePublicationStringProps {
  ranges: Ranges['values'];
  bonding: BoundingBox;
  spectrumKey: string;
}

function DraggableRanges(props: DraggablePublicationStringProps) {
  const { ranges, bonding: externalBounding, spectrumKey } = props;
  const dispatch = useDispatch();
  const { viewerRef } = useGlobal();
  const [bounding, setBounding] = useState<BoundingBox>(externalBounding);
  const [isMoveActive, setIsMoveActive] = useState(false);
  const { percentToPixel, pixelToPercent } = useSVGUnitConverter();
  const isExportProcessStart = useCheckExportStatus();

  useEffect(() => {
    setBounding({ ...externalBounding });
  }, [externalBounding]);

  function handleResize(
    internalBounding: Pick<BoundingBox, 'height' | 'width'>,
  ) {
    const { width, height } = convertToPixel(externalBounding);
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

    return output as BoundingBox;
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
      icon: <FaTimes />,
      intent: 'danger',
      title: 'Hide ranges table',
      onClick: handleRemove,
    },
  ];
  if (!viewerRef || !ranges || ranges.length === 0) return null;

  const { x: xInPercent, y: yInPercent } = bounding;

  const x = percentToPixel(xInPercent, 'x');
  const y = percentToPixel(yInPercent, 'y');

  if (isExportProcessStart) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <SVGRangesTable ranges={ranges} />
      </g>
    );
  }

  return (
    <ReactRnd
      default={{ x, y, width: 'auto', height: 'auto' }}
      position={{ x, y }}
      enableResizing={false}
      minWidth={100}
      minHeight={50}
      dragHandleClassName="handle"
      enableUserSelectHack={false}
      bounds={viewerRef}
      style={{ zIndex: 1 }}
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
        position="top-left"
        direction="row"
        targetProps={{ style: { width: '100%', height: '100%' } }}
        space={2}
        {...(isMoveActive && { isOpen: true })}
        modifiers={{
          offset: {
            data: { x, y },
          },
        }}
      >
        <SVGRangesTable ranges={ranges} />
      </ActionsButtonsPopover>
    </ReactRnd>
  );
}

function useSpectraRanges() {
  const spectra = useSpectraByActiveNucleus();
  const output: Record<string, Ranges['values']> = {};

  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) {
      continue;
    }
    const { id: spectrumKey, ranges } = spectrum;

    if (!Array.isArray(ranges?.values) || ranges.values.length === 0) {
      continue;
    }

    output[spectrumKey] = ranges.values;
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
        ranges={spectraRanges[spectrumKey]}
      />
    );
  });
}
