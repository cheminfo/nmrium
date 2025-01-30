import styled from '@emotion/styled';
import type { Ranges, Zones } from 'nmr-processing';
import OCL from 'openchemlib/full';
import { ResponsiveChart } from 'react-d3-utils';
import OCLnmr from 'react-ocl-nmr';
import { Rnd } from 'react-rnd';

import type {
  MoleculeBoundingRect,
  MoleculeView,
  StateMoleculeExtended,
} from '../../../../data/molecules/Molecule.js';
import { useDispatch } from '../../../context/DispatchContext.js';
import { useGlobal } from '../../../context/GlobalContext.js';
import { useHighlightColor } from '../../../hooks/useHighlightColor.js';
import { useCheckExportStatus } from '../../../hooks/useViewportSize.js';
import { useMoleculeEditor } from '../../../modal/MoleculeStructureEditorModal.js';
import useAtomAssignment from '../../../panels/MoleculesPanel/useAtomAssignment.js';
import type { DisplayerMode } from '../../../reducer/Reducer.js';

import ActionsButton from './ActionsButton.js';

interface DraggableMoleculeProps extends DraggableStructureProps {
  width: number;
  height: number;
}

interface DraggableStructureProps {
  moleculeView: MoleculeView;
  zones: Zones;
  ranges: Ranges;
  activeTab: string;
  displayerMode: DisplayerMode;
  index?: number;
  molecule: StateMoleculeExtended;
}

const AUTO_CROP_MARGIN = 30;

const ReactRnd = styled(Rnd)`
  border: 1px solid transparent;

  button {
    visibility: hidden;
  }

  .content {
    width: 100%;
    height: 100%;
  }

  &:hover {
    border: 1px solid #ebecf1;
    background-color: white;

    button {
      visibility: visible;
    }
  }
`;

export function DraggableStructure(props: DraggableStructureProps) {
  const { molecule, moleculeView } = props;
  const { viewerRef } = useGlobal();
  const isExportProcessStart = useCheckExportStatus();
  const dispatch = useDispatch();
  const { modal, openMoleculeEditor } = useMoleculeEditor();

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

  if (!viewerRef) return null;

  if (isExportProcessStart) {
    const { width, height, x, y } = moleculeView.floating.bounding;
    return (
      <g transform={`translate(${x} ${y})`}>
        <DraggableMolecule {...{ width, height }} {...props} />
      </g>
    );
  }

  return (
    <ReactRnd
      default={moleculeView.floating.bounding}
      minWidth={90 + AUTO_CROP_MARGIN * 2}
      minHeight={100 + AUTO_CROP_MARGIN * 2}
      dragHandleClassName="handle"
      enableUserSelectHack={false}
      bounds={viewerRef}
      style={{ zIndex: 1 }}
      className="draggable-molecule"
      onResizeStop={(e, dir, eRef, { width, height }) =>
        dragFloatMoleculeHandler({ width, height })
      }
      onDragStop={(e, { x, y }) => {
        dragFloatMoleculeHandler({ x, y });
      }}
      resizeHandleWrapperStyle={{ backgroundColor: 'white' }}
    >
      <div
        className="content"
        onDoubleClick={() => openMoleculeEditor(molecule)}
      >
        <ActionsButton onFloatBtnClick={floatMoleculeHandler} />
        <ResponsiveChart>
          {({ width, height }) => {
            return <DraggableMolecule {...{ width, height }} {...props} />;
          }}
        </ResponsiveChart>
      </div>
      {modal}
    </ReactRnd>
  );
}

function DraggableMolecule(props: DraggableMoleculeProps) {
  const {
    zones,
    ranges,
    activeTab,
    displayerMode,
    molecule,
    index,
    moleculeView,
    width,
    height,
  } = props;
  const {
    currentDiaIDsToHighlight,
    handleOnAtomHover,
    handleOnClickAtom,
    assignedDiaIDsMerged,
  } = useAtomAssignment({ zones, ranges, activeTab, displayerMode });
  const highlightColor = useHighlightColor();
  const dispatch = useDispatch();

  return (
    <OCLnmr
      OCL={OCL}
      id={`molSVG${index || ''}`}
      autoCrop
      autoCropMargin={AUTO_CROP_MARGIN}
      height={height - AUTO_CROP_MARGIN * 2}
      width={width - AUTO_CROP_MARGIN * 2}
      label={molecule.label}
      labelFontSize={15}
      labelColor="rgb(0,0,0)"
      molfile={molecule.molfile}
      setSelectedAtom={handleOnClickAtom}
      atomHighlightColor={
        currentDiaIDsToHighlight?.length > 0 ? '#ff000080' : highlightColor
      }
      atomHighlightOpacity={1}
      highlights={
        currentDiaIDsToHighlight?.length > 0
          ? currentDiaIDsToHighlight
          : assignedDiaIDsMerged
      }
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
      showAtomNumber={moleculeView.showAtomNumber}
    />
  );
}
