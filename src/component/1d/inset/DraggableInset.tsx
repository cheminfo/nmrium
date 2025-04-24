import styled from '@emotion/styled';
import {
  SvgNmrIntegrate,
  SvgNmrPeaks,
  SvgNmrPeaksTopLabels,
} from 'cheminfo-font';
import type {
  IntegralsViewState,
  PeaksViewState,
  RangesViewState,
} from 'nmrium-core';
import { useEffect, useState } from 'react';
import { BsArrowsMove } from 'react-icons/bs';
import { FaSitemap, FaTimes } from 'react-icons/fa';
import { LuMessageSquareText } from 'react-icons/lu';
import { Rnd } from 'react-rnd';

import { SVGRootContainer } from '../../1d-2d/components/SVGRootContainer.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useGlobal } from '../../context/GlobalContext.js';
import { ActionsButtonsPopover } from '../../elements/ActionsButtonsPopover.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { useSVGUnitConverter } from '../../hooks/useSVGUnitConverter.js';
import { useCheckExportStatus } from '../../hooks/useViewportSize.js';
import { booleanToString } from '../../utility/booleanToString.js';
import type { FilterType } from '../../utility/filterType.js';
import { Viewer1D } from '../Viewer1D.js';

import { InsetProvider } from './InsetProvider.js';
import { InsetViewerRoot } from './InsetViewerRoot.js';
import type { Inset, InsetView } from './SpectraInsets.js';

interface InsetBounding {
  x: number;
  y: number;
  width: number;
  height: number;
}

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

export function DraggableInset(props: Inset) {
  const dispatch = useDispatch();
  const {
    id,
    bounding: externalBounding,
    xDomain,
    yDomain,
    spectrumKey,
    view,
  } = props;
  const { viewerRef } = useGlobal();
  const [bounding, setBounding] = useState<InsetBounding>(externalBounding);
  const [isMoveActive, setIsMoveActive] = useState(false);
  const { percentToPixel, pixelToPercent } = useSVGUnitConverter();
  const isExportProcessStart = useCheckExportStatus();

  useEffect(() => {
    setBounding({ ...externalBounding });
  }, [externalBounding]);

  function handleResize(
    internalBounding: Pick<InsetBounding, 'height' | 'width'>,
  ) {
    const { width, height } = convertToPixel(externalBounding);
    internalBounding.width += width;
    internalBounding.height += height;
    setBounding((prevBounding) => ({
      ...prevBounding,
      ...convertToPercent(internalBounding),
    }));
  }

  function handleDrag(internalBounding: Pick<InsetBounding, 'x' | 'y'>) {
    setBounding((prevBounding) => ({
      ...prevBounding,
      ...convertToPercent(internalBounding),
    }));
  }

  function handleChangeInsetBounding(bounding: Partial<InsetBounding>) {
    if (
      typeof bounding?.width === 'number' &&
      typeof bounding?.height === 'number'
    ) {
      const { width, height } = convertToPixel(externalBounding);
      bounding.width += width;
      bounding.height += height;
    }

    dispatch({
      type: 'CHANGE_INSET_BOUNDING',
      payload: { insetKey: id, bounding: convertToPercent(bounding) },
    });
  }

  function convertToPixel(bounding: Partial<InsetBounding>) {
    const { x, y, height, width } = bounding;
    const output: Partial<InsetBounding> = {};

    if (x) {
      output.x = percentToPixel(x, 'x');
    }
    if (y) {
      output.y = percentToPixel(y, 'y');
    }
    if (width) {
      output.width = percentToPixel(width, 'x');
    }
    if (height) {
      output.height = percentToPixel(height, 'y');
    }

    return output as InsetBounding;
  }
  function convertToPercent(bounding: Partial<InsetBounding>) {
    const { x, y, height, width } = bounding;
    const output: Partial<InsetBounding> = {};

    if (x) {
      output.x = pixelToPercent(x, 'x');
    }
    if (y) {
      output.y = pixelToPercent(y, 'y');
    }
    if (width) {
      output.width = pixelToPercent(width, 'x');
    }
    if (height) {
      output.height = pixelToPercent(height, 'y');
    }

    return output;
  }

  const actionButtons = useActionButtons(id, view);

  if (!viewerRef) return null;

  const {
    width: widthInPercent,
    height: heightInPercent,
    x: xInPercent,
    y: yInPercent,
  } = bounding;

  const x = percentToPixel(xInPercent, 'x');
  const y = percentToPixel(yInPercent, 'y');
  const width = percentToPixel(widthInPercent, 'x');
  const height = percentToPixel(heightInPercent, 'y');

  if (isExportProcessStart) {
    return (
      <InsetProvider
        id={id}
        width={width}
        height={height}
        xDomain={xDomain}
        yDomain={yDomain}
        spectrumKey={spectrumKey}
        view={view}
      >
        <SVGRootContainer x={x} y={y}>
          <Viewer1D renderSvgContentOnly />
        </SVGRootContainer>
      </InsetProvider>
    );
  }
  return (
    <ReactRnd
      default={{ x, y, width, height }}
      position={{ x, y }}
      size={{ width, height }}
      minWidth={100}
      minHeight={100}
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
        <InsetViewerRoot>
          <InsetProvider
            id={id}
            width={width}
            height={height}
            xDomain={xDomain}
            yDomain={yDomain}
            spectrumKey={spectrumKey}
            view={view}
          >
            <Viewer1D />
          </InsetProvider>
        </InsetViewerRoot>
      </ActionsButtonsPopover>
    </ReactRnd>
  );
}

function useActionButtons(insetKey: string, view: InsetView) {
  const dispatch = useDispatch();

  function handleRemove() {
    dispatch({
      type: 'DELETE_INSET',
      payload: { insetKey },
    });
  }

  function handleTogglePeaksViewProperty(
    key: keyof FilterType<PeaksViewState, boolean>,
  ) {
    dispatch({
      type: 'TOGGLE_INSET_PEAKS_VIEW_PROPERTY',
      payload: { insetKey, key },
    });
  }

  function handleToggleRangesViewProperty(
    key: keyof FilterType<RangesViewState, boolean>,
  ) {
    dispatch({
      type: 'TOGGLE_INSET_RANGES_VIEW_PROPERTY',
      payload: { insetKey, key },
    });
  }
  function handleToggleIntegralsViewProperty(
    key: keyof FilterType<IntegralsViewState, boolean>,
  ) {
    dispatch({
      type: 'TOGGLE_INSET_INTEGRALS_VIEW_PROPERTY',
      payload: { insetKey, key },
    });
  }
  function handleToggleInsetsDisplayingPeaksMode(target: 'peaks' | 'ranges') {
    dispatch({
      type: 'TOGGLE_INSET_PEAKS_DISPLAYING_MODE',
      payload: { insetKey, target },
    });
  }

  const actionsButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <BsArrowsMove />,

      intent: 'none',
      title: 'Move inset',
      style: { cursor: 'move' },
      className: 'handle',
    },
    {
      icon: <FaTimes />,
      intent: 'danger',
      title: 'Remove inset',
      onClick: handleRemove,
    },
    { elementType: 'separator' },

    {
      icon: <SvgNmrPeaks />,
      title: `${booleanToString(!view.peaks.showPeaks)} peaks`,
      onClick: () => handleTogglePeaksViewProperty('showPeaks'),
      active: view.peaks.showPeaks,
    },
    {
      icon: <SvgNmrPeaksTopLabels />,
      title:
        view.peaks.displayingMode === 'spread'
          ? 'Top of the peak'
          : 'Top of the spectrum',
      onClick: () => handleToggleInsetsDisplayingPeaksMode('peaks'),
      active: view.peaks.displayingMode === 'spread',
    },
    { elementType: 'separator' },

    {
      icon: <FaSitemap />,
      title: `${booleanToString(!view.ranges.showMultiplicityTrees)} multiplicity trees in spectrum`,
      onClick: () => handleToggleRangesViewProperty('showMultiplicityTrees'),
      active: view.ranges.showMultiplicityTrees,
    },
    {
      icon: <SvgNmrIntegrate />,
      title: `${booleanToString(!view.ranges.showIntegrals)} integrals`,
      onClick: () => handleToggleRangesViewProperty('showIntegrals'),
      active: view.ranges.showIntegrals,
    },
    {
      icon: <SvgNmrIntegrate />,
      title: `${booleanToString(!view.ranges.showIntegralsValues)} integrals values`,
      onClick: () => handleToggleRangesViewProperty('showIntegralsValues'),
      active: view.ranges.showIntegralsValues,
    },

    {
      id: 'ranges-toggle-peaks',
      icon: <SvgNmrPeaks />,
      title: `${booleanToString(!view.ranges.showPeaks)} peaks`,
      onClick: () => handleToggleRangesViewProperty('showPeaks'),
      active: view.ranges.showPeaks,
    },
    {
      icon: <SvgNmrPeaksTopLabels />,
      title:
        view.ranges.displayingMode === 'spread'
          ? 'Top of the peak'
          : 'Top of the spectrum',
      onClick: () => handleToggleInsetsDisplayingPeaksMode('ranges'),
      active: view.ranges.displayingMode === 'spread',
    },
    {
      icon: <LuMessageSquareText />,
      title: `${booleanToString(!view.ranges.showAssignmentsLabels)} assignments labels`,
      onClick: () => handleToggleRangesViewProperty('showAssignmentsLabels'),
      active: view.ranges.showAssignmentsLabels,
    },
    { elementType: 'separator' },
    {
      icon: <SvgNmrIntegrate />,
      title: `${booleanToString(!view.integrals.showIntegralsValues)} integrals values`,
      onClick: () => handleToggleIntegralsViewProperty('showIntegralsValues'),
      active: view.integrals.showIntegralsValues,
    },
  ];

  return actionsButtons;
}
