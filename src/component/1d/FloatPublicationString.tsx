import styled from '@emotion/styled';
import type { BoundingBox, TextStyle } from '@zakodium/nmrium-core';
import { useEffect, useMemo, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { Rnd } from 'react-rnd';
import { SVGStyledText } from 'react-science/ui';

import { isSpectrum1D } from '../../data/data1d/Spectrum1D/index.js';
import { useChartData } from '../context/ChartContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useGlobal } from '../context/GlobalContext.js';
import type { ActionsButtonsPopoverProps } from '../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../elements/ActionsButtonsPopover.js';
import { useSVGUnitConverter } from '../hooks/useSVGUnitConverter.js';
import { useTextMetrics } from '../hooks/useTextMetrics.js';
import { useCheckExportStatus } from '../hooks/useViewportSize.js';
import { useACSSettings } from '../hooks/use_acs_settings.js';
import { usePublicationStrings } from '../hooks/use_publication_strings.js';

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

interface UseWrapSVGTextParams {
  text: string;
  width: number;
  fontSize: number;
  fontStyle: string | undefined;
  fontWeight: string | undefined;
}

function useWrapSVGText(params: UseWrapSVGTextParams) {
  const { text, width, fontSize, fontStyle, fontWeight } = params;
  const { getTextWidth } = useTextMetrics({
    labelSize: fontSize,
    labelStyle: fontStyle,
    labelWeight: fontWeight,
  });

  const formattedText = text
    .replaceAll(/<sup>(?<n>.*?)<\/sup>/g, '++$1++ ')
    .replaceAll(/<i>(?<j>.*?)<\/i>/g, '**$1**');

  const lineHeight = fontSize * 1.6;

  const lines: string[][] = [];
  let line: string[] = [];
  let lineWidth = 0;

  const spaceWidth = getTextWidth(' ');
  const words = formattedText.split(' ');

  for (const word of words) {
    const wordWidth = getTextWidth(word);
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
  textStyle: TextStyle;
  fontSize?: number;
  width: number;
  padding?: number;
}

function PublicationText(props: PublicationTextProps) {
  const { text, width } = props;
  const textStyle = {
    ...props.textStyle,
    fontSize: props.textStyle.fontSize ?? props.fontSize ?? 12,
  };
  const { fontSize = textStyle.fontSize, padding = 10 } = props;
  const boxWidth = width - padding * 2;

  const { lineHeight, lines } = useWrapSVGText({
    width: boxWidth,
    fontSize,
    fontStyle: textStyle.fontStyle,
    fontWeight: textStyle.fontWeight,
    text,
  });

  return (
    <g transform={`translate(${padding} ${padding})`}>
      {lines.map((line, lineIndex) => (
        <SVGStyledText
          // eslint-disable-next-line react/no-array-index-key
          key={lineIndex}
          {...textStyle}
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
        </SVGStyledText>
      ))}
    </g>
  );
}

interface DraggablePublicationStringProps {
  value: string;
  bonding: BoundingBox;
  spectrumKey: string;
  nucleus: string | undefined;
}

function DraggablePublicationString(props: DraggablePublicationStringProps) {
  const { value, bonding: externalBounding, spectrumKey, nucleus } = props;
  const dispatch = useDispatch();
  const { viewerRef } = useGlobal();
  const [bounding, setBounding] = useState<BoundingBox>(externalBounding);
  const [isMoveActive, setIsMoveActive] = useState(false);
  const { percentToPixel, pixelToPercent } = useSVGUnitConverter();
  const isExportProcessStart = useCheckExportStatus();
  const acsOptions = useACSSettings(nucleus);

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
  if (!viewerRef || !value) return null;

  const { width, height, x: xInPercent, y: yInPercent } = bounding;

  const x = percentToPixel(xInPercent, 'x');
  const y = percentToPixel(yInPercent, 'y');

  if (isExportProcessStart) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <PublicationText
          text={value}
          width={width}
          textStyle={acsOptions.textStyle}
        />
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
        position="top-left"
        direction="row"
        targetProps={{ style: { width: '100%', height: '100%' } }}
        space={2}
        {...(isMoveActive && { isOpen: true })}
        x={x}
        y={y}
      >
        <svg width={width} height={'auto'} xmlns="http://www.w3.org/2000/svg">
          <PublicationText
            text={value}
            width={width}
            textStyle={acsOptions.textStyle}
          />
        </svg>
      </ActionsButtonsPopover>
    </ReactRnd>
  );
}

export function FloatPublicationString() {
  const publicationString = usePublicationStrings();
  const {
    data: spectra,
    view: { ranges },
  } = useChartData();
  const options = useMemo(() => Object.entries(ranges), [ranges]);
  const spectraToNucleusMap = useMemo(() => {
    const map = new Map<string, string>();

    for (const spectrum of spectra) {
      if (!isSpectrum1D(spectrum)) continue;
      const { nucleus } = spectrum.info;
      map.set(spectrum.id, nucleus);
    }

    return map;
  }, [spectra]);

  return options.map(([spectrumKey, viewOptions]) => {
    const { showPublicationString, publicationStringBounding } = viewOptions;
    if (!showPublicationString) return null;

    return (
      <DraggablePublicationString
        key={spectrumKey}
        spectrumKey={spectrumKey}
        nucleus={spectraToNucleusMap.get(spectrumKey)}
        bonding={publicationStringBounding}
        value={publicationString[spectrumKey]}
      />
    );
  });
}
