import type { MoleculeView } from '@zakodium/nmrium-core';
import { Molecule } from 'openchemlib';
import type { GroupedDiaID } from 'openchemlib-utils';
import { useRef } from 'react';
import type { MolfileSvgRendererProps } from 'react-ocl';
import { MolfileSvgRenderer } from 'react-ocl';
import type { OCLnmrProps } from 'react-ocl-nmr';
import OCLnmr from 'react-ocl-nmr';

import type { StateMoleculeExtended } from '../../../data/molecules/Molecule.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useTopicMolecule } from '../../context/TopicMoleculeContext.tsx';
import { useHighlightColor } from '../../hooks/useHighlightColor.js';

import useAtomAssignment from './hooks/useAtomAssignment.js';
import { useExtractAtomAssignmentLabel } from './hooks/useExtractAtomAssignmentLabel.js';

interface MoleculeStructureProps extends Pick<OCLnmrProps, 'width' | 'height'> {
  moleculeView: MoleculeView;
  renderAsSVG?: boolean;
  molecule: StateMoleculeExtended;
  showMoleculeLabel?: boolean;
  index?: number;
}

function getCustomLabels(groups: GroupedDiaID[]) {
  return groups.flatMap((g) => g.customLabels).join(',');
}
function useCustomLabelChange() {
  const topicMolecule = useTopicMolecule();

  return (newMolfile: string, moleculeId: string) => {
    const molecule = topicMolecule?.[moleculeId];

    if (!molecule) return false;

    const currentGroupedAtomIDs = molecule.getGroupedDiastereotopicAtomIDs();
    const newMolecule = molecule.fromMolecule(Molecule.fromMolfile(newMolfile));
    const updatedGroupedAtomIDs = newMolecule.getGroupedDiastereotopicAtomIDs();

    if (!currentGroupedAtomIDs || !updatedGroupedAtomIDs) return;

    return (
      getCustomLabels(currentGroupedAtomIDs) !==
      getCustomLabels(updatedGroupedAtomIDs)
    );
  };
}

export function MoleculeStructure(props: MoleculeStructureProps) {
  const {
    molecule,
    moleculeView,
    width,
    height,
    renderAsSVG = false,
    showMoleculeLabel,
    index = 0,
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
  //TODO Temporary workaround to prevent other focused elements from being triggered by the space key
  const containerRef = useRef<HTMLDivElement>(null);
  const hasCustomLabelChanged = useCustomLabelChange();

  const atomHighlightColor =
    currentDiaIDsToHighlight?.length > 0 ? '#ff000080' : highlightColor;
  const baseProps: MolfileSvgRendererProps = {
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
    <div tabIndex={0} ref={containerRef}>
      <OCLnmr
        id={`molSVG${index}`}
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
          //TODO Temporary workaround to prevent other focused elements from being triggered by the space key
          containerRef.current?.focus();
          handleOnAtomHover(atom);
          if (atom) {
            onAtomHover(atom);
          }
        }}
        setMolfile={(molfile) => {
          const diaObject = getLastHoverAtom();
          const assignmentObj = getAssignmentLabelByHover(molecule.id, molfile);

          if (hasCustomLabelChanged(molfile, molecule.id)) {
            dispatch({
              type: 'CHANGE_MOLECULE_ANNOTATION',
              payload: { id: molecule.id, atomAnnotation: 'custom-labels' },
            });
          }

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
    </div>
  );
}
