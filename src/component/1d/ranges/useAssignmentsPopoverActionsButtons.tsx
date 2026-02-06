import { FaSitemap } from 'react-icons/fa';
import { LuLink, LuUnlink } from 'react-icons/lu';
import { PiTextTBold, PiTextTSlashBold } from 'react-icons/pi';

import { useDispatch } from '../../context/DispatchContext.js';
import { useShareData } from '../../context/ShareDataContext.js';
import type { ActionsButtonsPopoverProps } from '../../elements/ActionsButtonsPopover.js';
import { useActiveSpectrumRangesViewState } from '../../hooks/useActiveSpectrumRangesViewState.js';
import { booleanToString } from '../../utility/booleanToString.js';

interface UseAssignmentsPopoverActionsButtonsOptions {
  isAssignButtonVisible?: boolean;
  isUnAssignButtonVisible?: boolean;
  isAssignLabelButtonVisible?: boolean;
  isUnAssignLabelButtonVisible?: boolean;
  isToggleMultiplicityTreeButtonVisible?: boolean;
  onAssign: () => void;
  onUnAssign: () => void;
  rangeId: string;
}

export function useAssignmentsPopoverActionsButtons(
  options: UseAssignmentsPopoverActionsButtonsOptions,
): ActionsButtonsPopoverProps['buttons'] {
  const {
    rangeId,
    onAssign,
    onUnAssign,
    isAssignButtonVisible,
    isUnAssignButtonVisible,
    isAssignLabelButtonVisible,
    isUnAssignLabelButtonVisible,
    isToggleMultiplicityTreeButtonVisible = false,
  } = options;
  const dispatch = useDispatch();
  const { setData: addNewAssignmentLabel } = useShareData();
  const { showMultiplicityTrees } = useActiveSpectrumRangesViewState();
  function removeAssignmentLabel() {
    dispatch({
      type: 'CHANGE_1D_SIGNAL_ASSIGNMENT_LABEL',
      payload: {
        value: '',
        rangeId,
      },
    });
  }

  function handleShowJGraph() {
    dispatch({
      type: 'TOGGLE_RANGES_VIEW_PROPERTY',
      payload: { key: 'showMultiplicityTrees' },
    });
  }

  const actionsButtons: ActionsButtonsPopoverProps['buttons'] = [
    {
      icon: <FaSitemap />,
      title: `${booleanToString(!showMultiplicityTrees)} J Graph`,
      onClick: handleShowJGraph,
      visible: isToggleMultiplicityTreeButtonVisible && !showMultiplicityTrees,
    },
    {
      icon: <LuLink />,
      onClick: onAssign,
      intent: 'success',
      title: 'Assign multiplet',
      visible: isAssignButtonVisible,
    },
    {
      icon: <LuUnlink />,
      onClick: onUnAssign,
      intent: 'danger',
      title: 'Unassign multiplet',
      visible: isUnAssignButtonVisible,
    },
    {
      icon: <PiTextTBold />,
      onClick: () => addNewAssignmentLabel(rangeId),
      intent: 'success',
      title: 'Add assignment label',
      visible: isAssignLabelButtonVisible,
    },
    {
      icon: <PiTextTSlashBold />,
      onClick: removeAssignmentLabel,
      intent: 'danger',
      title: 'Remove assignment label',
      visible: isUnAssignLabelButtonVisible,
    },
  ];

  return actionsButtons;
}
