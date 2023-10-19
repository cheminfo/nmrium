/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Ranges, Zones } from 'nmr-processing';
import OCL from 'openchemlib/full';
import { ResponsiveChart } from 'react-d3-utils';
import OCLnmr from 'react-ocl-nmr';
import { Rnd } from 'react-rnd';

import {
  MoleculeBoundingRect,
  MoleculeView,
  StateMoleculeExtended,
} from '../../../../data/molecules/Molecule';
import { useDispatch } from '../../../context/DispatchContext';
import { useGlobal } from '../../../context/GlobalContext';
import { useMoleculeEditor } from '../../../modal/MoleculeStructureEditorModal';
import useAtomAssignment from '../../../panels/MoleculesPanel/useAtomAssignment';
import { DisplayerMode } from '../../../reducer/Reducer';

import ActionsButton from './ActionsButton';

interface DraggableStructureProps {
  zones: Zones;
  ranges: Ranges;
  molecule: StateMoleculeExtended;
  moleculeView: MoleculeView;
  activeTab: string;
  displayerMode: DisplayerMode;
  index?: number;
}

const AUTO_CROP_MARGIN = 30;

const style = css`
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
  const {
    zones,
    ranges,
    molecule,
    activeTab,
    displayerMode,
    index,
    moleculeView,
  } = props;
  const { viewerRef } = useGlobal();
  const dispatch = useDispatch();
  const { modal, openMoleculeEditor } = useMoleculeEditor();
  const {
    currentDiaIDsToHighlight,
    handleOnAtomHover,
    handleOnClickAtom,
    assignedDiaIDsMerged,
  } = useAtomAssignment({ zones, ranges, activeTab, displayerMode });

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

  return (
    <Rnd
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
      css={style}
    >
      <div
        className="content"
        onDoubleClick={() => openMoleculeEditor(molecule)}
      >
        <ActionsButton onFloatBtnClick={floatMoleculeHandler} />
        <ResponsiveChart>
          {({ width, height }) => {
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
                  currentDiaIDsToHighlight?.length > 0 ? 'red' : '#FFD700'
                }
                atomHighlightOpacity={0.35}
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
          }}
        </ResponsiveChart>
      </div>
      {modal}
    </Rnd>
  );
}
