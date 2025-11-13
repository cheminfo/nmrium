import styled from '@emotion/styled';
import type { MoleculeView } from '@zakodium/nmrium-core';
import { useEffect, useState } from 'react';
import { ResponsiveChart } from 'react-d3-utils';
import { BsArrowsMove } from 'react-icons/bs';
import { FaRegBookmark, FaTimes } from 'react-icons/fa';
import { MdFormatColorText, MdNumbers } from 'react-icons/md';
import { Rnd } from 'react-rnd';

import type {
  MoleculeBoundingRect,
  StateMoleculeExtended,
} from '../../../../data/molecules/Molecule.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { useGlobal } from '../../../context/GlobalContext.js';
import type { ActionsButtonsPopoverProps } from '../../../elements/ActionsButtonsPopover.js';
import { ActionsButtonsPopover } from '../../../elements/ActionsButtonsPopover.js';
import { useSVGUnitConverter } from '../../../hooks/useSVGUnitConverter.js';
import { useCheckExportStatus } from '../../../hooks/useViewportSize.js';
import { useMoleculeEditor } from '../../../modal/MoleculeStructureEditorModal.js';
import { MoleculeStructure } from '../../../panels/MoleculesPanel/MoleculeStructure.tsx';
import { useMoleculeAnnotationCore } from '../../../panels/hooks/useMoleculeAnnotationCore.ts';
import { booleanToString } from '../../../utility/booleanToString.ts';

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

  const {
    handleChangeAtomAnnotation,
    isAnnotation,
    handleToggleMoleculeLabel,
  } = useMoleculeAnnotationCore(molecule.id, moleculeView);

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
      title: `${booleanToString(!moleculeView.showLabel)} molecule label`,
      onClick: handleToggleMoleculeLabel,
      active: moleculeView.showLabel,
    },
    {
      elementType: 'separator',
    },
    {
      icon: <MdNumbers />,
      title: `${booleanToString(!isAnnotation('atom-numbers'))} atom number`,
      onClick: () => handleChangeAtomAnnotation('atom-numbers'),
      active: isAnnotation('atom-numbers'),
    },
    {
      icon: <FaRegBookmark />,
      title: `${booleanToString(!isAnnotation('custom-labels'))} custom labels`,
      onClick: () => handleChangeAtomAnnotation('custom-labels'),
      active: isAnnotation('custom-labels'),
    },
  ];
  const { x: xInPercent, y: yInPercent, width, height } = bounding;

  const x = percentToPixel(xInPercent, 'x');
  const y = percentToPixel(yInPercent, 'y');

  if (isExportProcessStart) {
    return (
      <g transform={`translate(${x} ${y})`}>
        <MoleculeStructure renderAsSVG {...{ width, height }} {...props} />
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
              return <MoleculeStructure {...{ width, height }} {...props} />;
            }}
          </ResponsiveChart>
        </div>
      </ActionsButtonsPopover>

      {modal}
    </ReactRnd>
  );
}
