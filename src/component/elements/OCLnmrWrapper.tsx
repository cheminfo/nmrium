import type { MoleculeView } from '@zakodium/nmrium-core';
import type { MolfileSvgRendererProps } from 'react-ocl';
import { MolfileSvgRenderer } from 'react-ocl';
import type { OCLnmrProps } from 'react-ocl-nmr';
import OCLnmr from 'react-ocl-nmr';

import type { StateMoleculeExtended } from '../../data/molecules/Molecule.ts';
import { useDispatch } from '../context/DispatchContext.tsx';
import { useHighlightColor } from '../hooks/useHighlightColor.ts';
import useAtomAssignment, {
  useExtractAtomAssignmentLabel,
} from '../panels/MoleculesPanel/useAtomAssignment.tsx';

interface OCLnmrWrapperProps extends Pick<OCLnmrProps, 'width' | 'height'> {
  moleculeView: MoleculeView;
  renderAsSVG?: boolean;
  molecule: StateMoleculeExtended;
  showMoleculeLabel?: boolean;
}

export function OCLnmrWrapper(props: OCLnmrWrapperProps) {
  const {
    molecule,
    moleculeView,
    width,
    height,
    renderAsSVG = false,
    showMoleculeLabel,
  } = props;
  const {
    currentDiaIDsToHighlight,
    handleOnAtomHover,
    handleOnClickAtom,
    assignedDiaIDsMerged,
  } = useAtomAssignment();
  const highlightColor = useHighlightColor();
  const dispatch = useDispatch();
  const { onAtomHover, getAssignmentLabelByHover, getLastHoverAtom } =
    useExtractAtomAssignmentLabel();

  const atomHighlightColor =
    currentDiaIDsToHighlight?.length > 0 ? '#ff000080' : highlightColor;
  const baseProps: MolfileSvgRendererProps = {
    id: molecule.id,
    height,
    width,
    label: (showMoleculeLabel ?? moleculeView.showLabel) ? molecule.label : '',
    labelFontSize: 15,
    labelColor: 'rgba(138, 59, 59, 1)',
    molfile: molecule.molfile,
    atomHighlightColor,
    atomHighlightOpacity: 1,
    showAtomNumber: moleculeView.atomAnnotation === 'atom-numbers',
    noAtomCustomLabels: moleculeView.atomAnnotation !== 'custom-labels',
    noCarbonLabelWithCustomLabel: true,
  };

  if (renderAsSVG) {
    return <MolfileSvgRenderer {...baseProps} />;
  }

  return (
    <OCLnmr
      {...baseProps}
      setSelectedAtom={(atom, event) =>
        handleOnClickAtom(atom, event, molecule.id)
      }
      highlights={
        currentDiaIDsToHighlight?.length > 0
          ? currentDiaIDsToHighlight
          : assignedDiaIDsMerged
      }
      atomHighlightStrategy="prefer-editor-props"
      setHoverAtom={(atom) => {
        handleOnAtomHover(atom);
        if (atom) {
          onAtomHover(atom);
        }
      }}
      setMolfile={(molfile) => {
        const diaObject = getLastHoverAtom();
        const assignmentObj = getAssignmentLabelByHover(molecule.id, molfile);

        if (assignmentObj && diaObject) {
          dispatch({
            type: 'CHANGE_ASSIGNMENT_LABEL_BY_DIAIDS',
            payload: {
              diaIDs: [diaObject.idCode].concat(
                diaObject.attachedHydrogensIDCodes,
              ),
              assignment: assignmentObj.assignment,
              previousAssignment: assignmentObj.previousAssignment,
            },
          });
        }

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
