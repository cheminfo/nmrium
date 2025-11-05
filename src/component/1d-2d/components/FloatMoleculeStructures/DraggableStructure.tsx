import styled from '@emotion/styled';
import type { MoleculeView } from '@zakodium/nmrium-core';
import { useEffect, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { BsArrowsMove } from 'react-icons/bs';
import { FaTimes } from 'react-icons/fa';
import { MdFormatColorText } from 'react-icons/md';
import type { MolfileSvgRendererProps } from 'react-ocl';
import { MolfileSvgRenderer } from 'react-ocl';
import OCLnmr from 'react-ocl-nmr';
import { Rnd } from 'react-rnd';

import type {
  MoleculeBoundingRect,
  StateMoleculeExtended,
} from '../../../../data/molecules/Molecule.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { useGlobal } from '../../../context/GlobalContext.js';
import type { ActionsButtonsPopoverProps } from '../../../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../../../elements/ActionsButtonsPopover.js';
import { useHighlightColor } from '../../../hooks/useHighlightColor.js';
import { useSVGUnitConverter } from '../../../hooks/useSVGUnitConverter.js';
import { useCheckExportStatus } from '../../../hooks/useViewportSize.js';
import { useMoleculeEditor } from '../../../modal/MoleculeStructureEditorModal.js';
import useAtomAssignment from '../../../panels/MoleculesPanel/useAtomAssignment.js';
import { booleanToString } from '../../../utility/booleanToString.ts';

interface DraggableMoleculeProps extends DraggableStructureProps {
  width: number;
  height: number;
  renderAsSVG?: boolean;
  isMoleculeLabelVisible: boolean;
}

interface DraggableStructureProps {
  moleculeView: MoleculeView;
  index?: number;
  molecule: StateMoleculeExtended;
}

const ReactRnd = styled(Rnd)`
  border: 1px solid transparent;

  .content {
    height: 100%;
    width: 100%;
  }

  :hover {
    background-color: white;
    border: 1px solid #ebecf1;
  }
`;

export function DraggableStructure(props: DraggableStructureProps) {
  const { molecule, moleculeView } = props;
  const { viewerRef } = useGlobal();

  const isExportProcessStart = useCheckExportStatus();
  const dispatch = useDispatch();
  const { modal, openMoleculeEditor } = useMoleculeEditor();
  const { percentToPixel, pixelToPercent } = useSVGUnitConverter();
  const [bounding, setBounding] = useState<MoleculeBoundingRect>(
    moleculeView.floating.bounding,
  );
  const [isMoveActive, setIsMoveActive] = useState(false);
  const [isMoleculeLabelVisible, setIsMoleculeLabelVisible] = useState(false);

  useEffect(() => {
    setBounding({ ...moleculeView.floating.bounding });
  }, [moleculeView.floating.bounding]);

  function floatMoleculeHandler() {
    dispatch({
      type: 'FLOAT_MOLECULE_OVER_SPECTRUM',
      payload: { id: molecule.id },
    });
  }

  function dragFloatMoleculeHandler(bounding: Partial<MoleculeBoundingRect>) {
    if (
      typeof bounding?.width === 'number' &&
      typeof bounding?.height === 'number'
    ) {
      const { width, height } = moleculeView.floating.bounding;
      bounding.width += width;
      bounding.height += height;
    }

    dispatch({
      type: 'CHANGE_FLOAT_MOLECULE_POSITION',
      payload: { id: molecule.id, bounding: bounding as MoleculeBoundingRect },
    });
  }

  function handleDrag(internalBounding: Pick<MoleculeBoundingRect, 'x' | 'y'>) {
    setBounding((prevBounding) => ({
      ...prevBounding,
      ...convertPositionToPercent(internalBounding),
    }));
  }

  function convertPositionToPercent({
    x,
    y,
  }: Pick<MoleculeBoundingRect, 'x' | 'y'>) {
    return { x: pixelToPercent(x, 'x'), y: pixelToPercent(y, 'y') };
  }

  if (!viewerRef) return null;

  const actionsButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <BsArrowsMove />,
      intent: 'none',
      title: 'Move molecule',
      style: { cursor: 'move' },
      className: 'handle',
    },
    {
      icon: <FaTimes />,
      intent: 'danger',
      title: 'Hide molecule',
      onClick: floatMoleculeHandler,
    },
    {
      elementType: 'separator',
    },
    {
      icon: <MdFormatColorText />,
      title: `${booleanToString(!isMoleculeLabelVisible)} molecule label`,
      onClick: () => setIsMoleculeLabelVisible((flag) => !flag),
      active: isMoleculeLabelVisible,
    },
  ];

  const { x: xInPercent, y: yInPercent, width, height } = bounding;

  const x = percentToPixel(xInPercent, 'x');
  const y = percentToPixel(yInPercent, 'y');

  if (isExportProcessStart) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <DraggableMolecule
          renderAsSVG
          {...{ width, height, isMoleculeLabelVisible }}
          {...props}
        />
      </g>
    );
  }

  return (
    <ReactRnd
      default={{ x, y, width, height }}
      position={{ x, y }}
      minWidth={90}
      minHeight={100}
      dragHandleClassName="handle"
      enableUserSelectHack={false}
      bounds={`#${viewerRef.id}`}
      style={{ zIndex: 1 }}
      className="draggable-molecule"
      onDragStart={() => setIsMoveActive(true)}
      onResizeStop={(e, dir, eRef, { width, height }) =>
        dragFloatMoleculeHandler({ width, height })
      }
      onDrag={(e, { x, y }) => {
        handleDrag({ x, y });
      }}
      onDragStop={(e, { x, y }) => {
        dragFloatMoleculeHandler(convertPositionToPercent({ x, y }));
        setIsMoveActive(false);
      }}
      resizeHandleWrapperStyle={{ backgroundColor: 'white' }}
    >
      <ActionsButtonsPopover
        buttons={actionsButtons}
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
        <div
          className="content"
          onDoubleClick={() => openMoleculeEditor(molecule)}
        >
          <ResponsiveChart>
            {({ width, height }) => {
              return (
                <DraggableMolecule
                  {...{ width, height, isMoleculeLabelVisible }}
                  {...props}
                />
              );
            }}
          </ResponsiveChart>
        </div>
      </ActionsButtonsPopover>

      {modal}
    </ReactRnd>
  );
}

function DraggableMolecule(props: DraggableMoleculeProps) {
  const {
    molecule,
    index,
    moleculeView,
    width,
    height,
    renderAsSVG = false,
    isMoleculeLabelVisible,
  } = props;
  const {
    currentDiaIDsToHighlight,
    handleOnAtomHover,
    handleOnClickAtom,
    assignedDiaIDsMerged,
  } = useAtomAssignment();
  const highlightColor = useHighlightColor();
  const dispatch = useDispatch();

  const atomHighlightColor =
    currentDiaIDsToHighlight?.length > 0 ? '#ff000080' : highlightColor;
  const baseProps: MolfileSvgRendererProps = {
    id: `molSVG${index || ''}`,
    height,
    width,
    label: isMoleculeLabelVisible ? molecule.label : '',
    labelFontSize: 15,
    labelColor: 'rgba(138, 59, 59, 1)',
    molfile: molecule.molfile,
    atomHighlightColor,
    atomHighlightOpacity: 1,
    showAtomNumber: moleculeView.atomAnnotation === "atom-numbers",
    showMapping: moleculeView.atomAnnotation === "custom-labels"
  };

  if (renderAsSVG) {
    return <MolfileSvgRenderer {...baseProps} />;
  }

  return (
    <OCLnmr
      {...baseProps}
      setSelectedAtom={handleOnClickAtom}
      highlights={
        currentDiaIDsToHighlight?.length > 0
          ? currentDiaIDsToHighlight
          : assignedDiaIDsMerged
      }
      atomHighlightStrategy="prefer-editor-props"
      setHoverAtom={handleOnAtomHover}
      setMolfile={(molfile) => {
        dispatch({
          type: 'SET_MOLECULE',
          payload: {
            molfile,
            id: molecule.id,
            label: molecule.label,
          },
        });
      }}
    />
  );
}
