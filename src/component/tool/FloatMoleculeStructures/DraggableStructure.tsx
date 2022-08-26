/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import OCL from 'openchemlib/full';
import { useCallback } from 'react';
import OCLnmr from 'react-ocl-nmr';

import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import { Ranges } from '../../../data/types/data1d';
import { Zones } from '../../../data/types/data2d';
import { useDispatch } from '../../context/DispatchContext';
import { useGlobal } from '../../context/GlobalContext';
import SVGDraggable from '../../elements/draggble/SVGDraggable';
import { Position } from '../../elements/draggble/useDraggable';
import { useMoleculeEditor } from '../../modal/MoleculeStructureEditorModal';
import useAtomAssignment from '../../panels/MoleculesPanel/useAtomAssignment';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import {
  CHANGE_FLOAT_MOLECULE_POSITION,
  FLOAT_MOLECULE_OVER_SPECTRUM,
  SET_MOLECULE,
} from '../../reducer/types/Types';

import ActionsButton from './ActionsButton';

interface DraggableStructureProps {
  zones: Zones;
  ranges: Ranges;
  molecule: StateMoleculeExtended;
  position?: Position;
  activeTab: string;
  displayerMode: DISPLAYER_MODE;
  index?: number;
}

const style = css`
  border: 1px solid transparent;
  button {
    visibility: hidden;
  }

  &:hover {
    border: 1px solid #ebecf1;
    background-color: white;
    button {
      visibility: visible;
    }
  }
`;
export const DRAGGABLE_STRUCTURE_INITIAL_POSITION = { x: 100, y: 50 };
export function DraggableStructure(props: DraggableStructureProps) {
  const {
    zones,
    ranges,
    molecule,
    activeTab,
    displayerMode,
    index,
    position = DRAGGABLE_STRUCTURE_INITIAL_POSITION,
  } = props;
  const { viewerRef } = useGlobal();
  const dispatch = useDispatch();
  const openMoleculeEditor = useMoleculeEditor();

  const {
    currentDiaIDsToHighlight,
    handleOnAtomHover,
    handleOnClickAtom,
    assignedDiaIDsMerged,
  } = useAtomAssignment({ zones, ranges, activeTab, displayerMode });

  const floatMoleculeHandler = useCallback(() => {
    dispatch({
      type: FLOAT_MOLECULE_OVER_SPECTRUM,
      payload: { id: molecule.id },
    });
  }, [dispatch, molecule]);
  const dragFloatMoleculeHandler = useCallback(
    (position: Position) => {
      dispatch({
        type: CHANGE_FLOAT_MOLECULE_POSITION,
        payload: { id: molecule.id, position },
      });
    },
    [dispatch, molecule],
  );
  return (
    <SVGDraggable
      key={molecule.id}
      width={150}
      height={100}
      initialPosition={position}
      dragHandleClassName="handle"
      parentElement={viewerRef}
      onEnd={dragFloatMoleculeHandler}
    >
      {(width, height) => (
        <foreignObject
          width={width}
          height={height + 30}
          data-replace-float-structure="true"
          css={style}
          onDoubleClick={() => openMoleculeEditor(molecule)}
        >
          <ActionsButton onFloatBtnClick={floatMoleculeHandler} />
          <OCLnmr
            OCL={OCL}
            autoCrop
            id={`molSVG${index || ''}`}
            width={width - 20}
            height={height}
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
                type: SET_MOLECULE,
                payload: {
                  molfile,
                  id: molecule.id,
                  label: molecule.label,
                },
              });
            }}
          />
        </foreignObject>
      )}
    </SVGDraggable>
  );
}
