import styled from '@emotion/styled';
import type { BoundingBox, Spectrum, TextStyle } from '@zakodium/nmrium-core';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { FaEdit, FaTimes } from 'react-icons/fa';
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
import { PublicationStringModal } from '../modal/PublicationStringModal.js';

const MARKERS: Record<string, React.SVGProps<SVGTSpanElement>> = {
  '++': { baselineShift: 'super' },
  '--': { baselineShift: 'sub' },
  '**': { fontStyle: 'italic' },
};

function getMarker(word: string) {
  return Object.keys(MARKERS).find(
    (marker) => word.startsWith(marker) && word.endsWith(marker),
  );
}

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
  style: TextStyle;
  width: number;
}

function useWrapSVGText(params: UseWrapSVGTextParams) {
  const { text, width, style } = params;

  const debugCanvas = false;
  const labelSize = style.fontSize ?? 12;
  // ctx used only for debug canvas purpose.
  // eslint-disable-next-line @typescript-eslint/no-deprecated
  const { getTextWidth, ctx } = useTextMetrics({
    labelSize,
    labelStyle: style.fontStyle,
    labelWeight: style.fontWeight,
    debugCanvasWidth: debugCanvas ? width : undefined,
  });
  const formattedText = text
    .replaceAll(/<sup>(?<n>.*?)<\/sup>/g, ' ++$1++ ')
    .replaceAll(/<sub>(?<k>.*?)<\/sub>/g, ' --$1-- ')
    .replaceAll(/<i>(?<j>.*?)<\/i>/g, ' **$1** ')
    .trim();

  const lineHeight = labelSize * 1.6;

  const lines: string[][] = [];
  let line: string[] = [];
  let lineWidth = 0;

  const spaceWidth = getTextWidth(' ');
  const words = formattedText.split(/\s+/);

  for (const word of words) {
    const marker = getMarker(word);
    const cleanWord = marker ? word.replaceAll(marker, '') : word;
    const wordWidth = getTextWidth(cleanWord);
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

  useEffect(() => {
    if (!debugCanvas) return;
    if (!ctx) return;

    ctx.clearRect(0, 0, ctx.canvas.width, ctx.canvas.height);
    let y = lineHeight;
    for (const line of lines) {
      let x = 0;
      for (const word of line) {
        const marker = getMarker(word);
        const finalWord = marker ? word.replaceAll(marker, '') : word;

        if (marker === '++') {
          ctx.fillText(finalWord, x, y - lineHeight * 0.3);
        } else if (marker === '--') {
          ctx.fillText(finalWord, x, y + lineHeight * 0.3);
        } else {
          ctx.fillText(finalWord, x, y);
        }

        x += getTextWidth(finalWord);
      }
      y += lineHeight;
    }
    ctx.fillStyle = 'black';
  });

  return { lines, lineHeight };
}

interface PublicationTextProps {
  text: string;
  textStyle?: TextStyle;
  width: number;
}

function PublicationText(props: PublicationTextProps) {
  const { text, textStyle = {}, width } = props;
  const padding = 10;
  const boxWidth = width - padding * 2;

  const textStyleWithSize = {
    ...textStyle,
    fontSize: textStyle.fontSize ?? 12,
  };
  const { lineHeight, lines } = useWrapSVGText({
    width: boxWidth,
    style: textStyleWithSize,
    text,
  });

  return (
    <g transform={`translate(${padding} ${padding})`}>
      {lines.map((line, lineIndex) => (
        <SVGStyledText
          // eslint-disable-next-line react/no-array-index-key
          key={lineIndex}
          {...textStyleWithSize}
          fontFamily="Arial"
          y={lineIndex * lineHeight}
          dominantBaseline="hanging"
        >
          {line.map((word, wordIndex) => {
            const marker = getMarker(word);

            if (marker) {
              const props = MARKERS[marker];
              const isBaselineShift = 'baselineShift' in props;
              const fontSize = isBaselineShift
                ? Math.floor((5 / 6) * textStyleWithSize.fontSize)
                : undefined;

              return (
                <tspan
                  // eslint-disable-next-line react/no-array-index-key
                  key={wordIndex}
                  fontSize={fontSize}
                  {...props}
                >
                  {word.replaceAll(marker, '')}
                </tspan>
              );
            }

            const addSpace =
              !line[wordIndex + 1]?.startsWith('--') ||
              /\s$/.test(word) ||
              /[^a-zA-Z0-9]$/.test(word);
            return (
              // eslint-disable-next-line react/no-array-index-key
              <tspan key={wordIndex}>{addSpace ? `${word} ` : word}</tspan>
            );
          })}
        </SVGStyledText>
      ))}
    </g>
  );
}

interface DraggablePublicationStringProps {
  value: string;
  bounding: BoundingBox;
  nucleus: string;
  spectrum: Spectrum;
}

function useBoundingBox(externalBoundingPercent: BoundingBox) {
  const { percentToPixel, pixelToPercent } = useSVGUnitConverter();

  const convertToPixel = useCallback(
    (bounding: Partial<BoundingBox>) => {
      const { x, y, height, width } = bounding;
      const output: Partial<BoundingBox> = {};

      if (typeof x === 'number') {
        output.x = percentToPixel(x, 'x');
      }
      if (typeof y === 'number') {
        output.y = percentToPixel(y, 'y');
      }
      if (typeof width === 'number') {
        output.width = width;
      }
      if (typeof height === 'number') {
        output.height = height;
      }

      return output;
    },
    [percentToPixel],
  );

  const convertToPercent = useCallback(
    (bounding: Partial<BoundingBox>) => {
      const { x, y, height, width } = bounding;
      const output: Partial<BoundingBox> = {};

      if (typeof x === 'number') {
        output.x = pixelToPercent(x, 'x');
      }
      if (typeof y === 'number') {
        output.y = pixelToPercent(y, 'y');
      }
      if (typeof width === 'number') {
        output.width = width;
      }
      if (typeof height === 'number') {
        output.height = height;
      }

      return output;
    },
    [pixelToPercent],
  );

  const [bounding, setBounding] = useState<BoundingBox>(() => {
    return convertToPixel(externalBoundingPercent) as BoundingBox;
  });

  useEffect(() => {
    setBounding(convertToPixel(externalBoundingPercent) as BoundingBox);
  }, [convertToPixel, externalBoundingPercent]);

  return {
    bounding,
    setBounding,
    convertToPixel,
    convertToPercent,
  };
}

function DraggablePublicationString(props: DraggablePublicationStringProps) {
  const {
    value,
    bounding: externalBoundingInPercent,
    nucleus,
    spectrum,
  } = props;
  const spectrumKey = spectrum.id;

  const dispatch = useDispatch();
  const { viewerRef } = useGlobal();
  const [isMoveActive, setIsMoveActive] = useState(false);
  const isExportProcessStart = useCheckExportStatus();
  const acsOptions = useACSSettings(nucleus);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const { bounding, setBounding, convertToPercent } = useBoundingBox(
    externalBoundingInPercent,
  );

  function handleResize(bounding: Pick<BoundingBox, 'height' | 'width'>) {
    setBounding((prevBounding) => {
      return {
        ...prevBounding,
        width: bounding.width,
        height: bounding.height,
      };
    });
  }

  function handleDrag(newPosition: Pick<BoundingBox, 'x' | 'y'>) {
    setBounding((prevBounding) => ({
      ...prevBounding,
      ...newPosition,
    }));
  }

  function handleChangeInsetBounding(bounding: Partial<BoundingBox>) {
    setBounding((prev) => ({ ...prev, ...bounding }));

    dispatch({
      type: 'CHANGE_RANGES_VIEW_FLOATING_BOX_BOUNDING',
      payload: {
        spectrumKey,
        bounding: convertToPercent(bounding),
        target: 'publicationStringBounding',
      },
    });
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
      icon: <FaEdit />,
      intent: 'primary',
      title: 'Configure publication string',
      onClick: () => {
        setIsDialogOpen(true);
      },
    },
    {
      icon: <FaTimes />,
      intent: 'danger',
      title: 'Hide publication string',
      onClick: handleRemove,
    },
  ];
  if (!viewerRef || !value) return null;

  const { width, height, x = 0, y = 0 } = bounding;

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
    <>
      <ReactRnd
        position={{ x, y }}
        size={{ width: width || 'auto', height: height || 'auto' }}
        minWidth={100}
        minHeight={50}
        dragHandleClassName="handle"
        enableUserSelectHack={false}
        bounds={`#${viewerRef.id}`}
        onResize={(e, dir, eRef, size, position) => {
          handleResize({
            ...position,
            height: eRef.clientHeight,
            width: eRef.clientWidth,
          });
        }}
        onResizeStop={(e, dir, eRef, size, position) => {
          handleChangeInsetBounding({
            ...position,
            height: eRef.clientHeight,
            width: eRef.clientWidth,
          });
        }}
        onDragStart={() => setIsMoveActive(true)}
        onDrag={(e, data) => {
          handleDrag({ x: data.x, y: data.y });
        }}
        onDragStop={(e, data) => {
          handleChangeInsetBounding({ x: data.x, y: data.y });
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
          <svg
            width={width || 'auto'}
            height={height || 'auto'}
            xmlns="http://www.w3.org/2000/svg"
          >
            <PublicationText
              text={value}
              width={width}
              textStyle={acsOptions.textStyle}
            />
          </svg>
        </ActionsButtonsPopover>
      </ReactRnd>
      <PublicationStringModal
        isOpen={isDialogOpen}
        onClose={() => setIsDialogOpen(false)}
        acsExportOptions={acsOptions}
        spectrum={spectrum}
        allowTextStyle
      />
    </>
  );
}

export function FloatPublicationString() {
  const publicationString = usePublicationStrings();
  const {
    data: spectra,
    view: { ranges },
  } = useChartData();
  const spectraMap = useMemo(() => {
    const map = new Map<string, Spectrum>();

    for (const spectrum of spectra) {
      map.set(spectrum.id, spectrum);
    }

    return map;
  }, [spectra]);
  const options = useMemo(() => {
    return Object.entries(ranges).map(([spectrumKey, viewOptions]) => ({
      spectrum: spectraMap.get(spectrumKey),
      viewOptions,
    }));
  }, [ranges, spectraMap]);

  return options.map((options) => {
    const { viewOptions, spectrum } = options;

    const { showPublicationString, publicationStringBounding } = viewOptions;
    if (!showPublicationString) return null;
    if (!isSpectrum1D(spectrum)) return null;

    const {
      id,
      info: { nucleus },
    } = spectrum;

    return (
      <DraggablePublicationString
        key={id}
        spectrum={spectrum}
        nucleus={nucleus}
        bounding={publicationStringBounding}
        value={publicationString[id]}
      />
    );
  });
}
