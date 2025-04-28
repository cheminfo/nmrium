import styled from '@emotion/styled';
import type { BoundingBox } from '@zakodium/nmrium-core';
import { rangesToACS } from 'nmr-processing';
import { useEffect, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { Rnd } from 'react-rnd';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/isSpectrum1D.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useGlobal } from '../context/GlobalContext.js';
import { ActionsButtonsPopover } from '../elements/ActionsButtonsPopover.js';
import type { ActionsButtonsPopoverProps } from '../elements/ActionsButtonsPopover.js';
import { usePanelPreferences } from '../hooks/usePanelPreferences.js';
import { useSVGUnitConverter } from '../hooks/useSVGUnitConverter.js';
import useSpectraByActiveNucleus from '../hooks/useSpectraPerNucleus.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.js';

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

function calculateWorldWidth(word, fontSize, fontFamily = 'Arial') {
  const canvas = document.createElement('canvas');
  const context = canvas.getContext('2d');
  if (!context) return 0;

  context.font = `${fontSize}px ${fontFamily}`;
  return Math.round(context.measureText(word).width);
}

function wrapSVGText({ text, width, fontSize }) {
  const formattedText = text
    .replaceAll(/<sup>(?<n>.*?)<\/sup>/g, '++$1++ ')
    .replaceAll(/<i>(?<j>.*?)<\/i>/g, '**$1**');

  const lineHeight = fontSize * 1.6;

  const lines: string[][] = [];
  let line: string[] = [];
  let lineWidth = 0;

  const spaceWidth = calculateWorldWidth(' ', fontSize);
  const words = formattedText.split(' ');

  for (const word of words) {
    const wordWidth = calculateWorldWidth(word, fontSize);
    if (lineWidth + wordWidth > width) {
      lines.push(line);
      line = [word];
      lineWidth = wordWidth;
    } else {
      line.push(word);
      lineWidth += wordWidth + spaceWidth;
    }
  }
  if (line.length > 0) lines.push(line);

  return { lines, lineHeight };
}

interface PublicationTextProps {
  text: string;
  fontSize?: number;
  width: number;
  padding?: number;
}

function PublicationText(props: PublicationTextProps) {
  const { fontSize = 12, padding = 10, width, text } = props;
  const boxWidth = width - padding * 2;
  const { lineHeight, lines } = wrapSVGText({
    width: boxWidth,
    fontSize,
    text,
  });
  return (
    <g transform={`translate(${padding} ${padding})`}>
      {lines.map((line, lineIndex) => (
        <text
          // eslint-disable-next-line react/no-array-index-key
          key={lineIndex}
          fontSize={fontSize}
          fontFamily="Arial"
          y={lineIndex * lineHeight}
          dominantBaseline="hanging"
        >
          {line.map((word, wordIndex) => {
            if (word.startsWith('++') && word.endsWith('++')) {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <tspan key={wordIndex} baselineShift="super" fontSize={10}>
                  {word.replaceAll('++', '')}
                </tspan>
              );
            } else if (word.startsWith('**') && word.endsWith('**')) {
              return (
                // eslint-disable-next-line react/no-array-index-key
                <tspan key={wordIndex} fontStyle="italic">
                  {word.replaceAll('**', '')}
                </tspan>
              );
            } else {
              // eslint-disable-next-line react/no-array-index-key
              return <tspan key={wordIndex}>{word} </tspan>;
            }
          })}
        </text>
      ))}
    </g>
  );
}

interface DraggablePublicationStringProps {
  value: string;
  bonding: BoundingBox;
  spectrumKey: string;
}

function DraggablePublicationString(props: DraggablePublicationStringProps) {
  const { value, bonding: externalBounding, spectrumKey } = props;
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
        target: 'publicationStringBounding',
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
      payload: { key: 'showPublicationString', spectrumKey },
    });
  }

  const actionButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <BsArrowsMove />,

      intent: 'none',
      title: 'Move publication string',
      style: { cursor: 'move' },
      className: 'handle',
    },
    {
      icon: <FaTimes />,
      intent: 'danger',
      title: 'Hide publication string',
      onClick: handleRemove,
    },
  ];
  if (!viewerRef) return null;

  const { width, height, x: xInPercent, y: yInPercent } = bounding;

  const x = percentToPixel(xInPercent, 'x');
  const y = percentToPixel(yInPercent, 'y');

  if (isExportProcessStart) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <PublicationText text={value} width={width} />
      </g>
    );
  }

  return (
    <ReactRnd
      default={{ x, y, width: width || 'auto', height: height || 'auto' }}
      position={{ x, y }}
      size={{ width: width || 'auto', height: height || 'auto' }}
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
        <svg width={width} height={'auto'} xmlns="http://www.w3.org/2000/svg">
          <PublicationText text={value} width={width} />
        </svg>
      </ActionsButtonsPopover>
    </ReactRnd>
  );
}

function usePublicationString() {
  const spectra = useSpectraByActiveNucleus();
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  const output: Record<string, string> = {};

  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) {
      continue;
    }
    const { id: spectrumKey, info, ranges } = spectrum;

    if (!Array.isArray(ranges?.values) || ranges.values.length === 0) {
      continue;
    }

    const { originFrequency: observedFrequency, nucleus } = info;

    const value = rangesToACS(ranges.values, {
      nucleus, // '19f'
      deltaFormat: rangesPreferences.deltaPPM.format,
      couplingFormat: rangesPreferences.coupling.format,
      observedFrequency, //400
    });

    output[spectrumKey] = value;
  }

  return output;
}

export function FloatPublicationString() {
  const publicationString = usePublicationString();
  const {
    view: { ranges },
  } = useChartData();
  const options = Object.entries(ranges);

  return options.map(([spectrumKey, viewOptions]) => {
    const { showPublicationString, publicationStringBounding } = viewOptions;
    if (!showPublicationString) return null;

    return (
      <DraggablePublicationString
        key={spectrumKey}
        spectrumKey={spectrumKey}
        bonding={publicationStringBounding}
        value={publicationString[spectrumKey]}
      />
    );
  });
}
