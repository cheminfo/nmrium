import { FaEye, FaEyeSlash, FaMinus, FaPlus } from 'react-icons/fa';
import { GrRadialSelected } from 'react-icons/gr';
import { TooltipHelpContent } from 'react-science/ui';

import { useDispatch } from '../context/DispatchContext.js';
import type { ToolbarItemProps } from '../panels/header/DefaultPanelHeader.js';
import type { SpectraSelectedMode } from '../reducer/actions/SpectraActions.js';

import { useActiveNucleusTab } from './useActiveNucleusTab.ts';

interface ToggleSpectraVisibility {
  enableShowAll: boolean;
  enableShowSelected: boolean;
  enableShowSelectedOnly: boolean;
  enableHideSelected: boolean;
  enableHideAll: boolean;
}

export function useToggleSpectraVisibility(
  props: Partial<ToggleSpectraVisibility> = {},
) {
  const {
    enableHideAll = true,
    enableHideSelected = true,
    enableShowAll = true,
    enableShowSelectedOnly = true,
    enableShowSelected = true,
  } = props;
  const dispatch = useDispatch();
  const activeTab = useActiveNucleusTab();
  function showSpectraHandler(mode: SpectraSelectedMode) {
    dispatch({
      type: 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS',
      payload: { nucleus: activeTab, flag: true, mode },
    });
  }

  function hideSpectraHandler(mode: SpectraSelectedMode) {
    dispatch({
      type: 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS',
      payload: { nucleus: activeTab, flag: false, mode },
    });
  }

  function getToggleVisibilityButtons(disabled = false) {
    const output: ToolbarItemProps[] = [];
    if (enableShowAll) {
      output.push({
        icon: <FaEye />,
        tooltip: <TooltipHelpContent title="Show all spectra" />,
        onClick: () => showSpectraHandler('all'),
      });
    }
    if (enableShowSelected) {
      output.push({
        disabled,
        icon: <FaPlus />,
        tooltip: <TooltipHelpContent title="Show selected spectra" />,
        onClick: () => showSpectraHandler('selected'),
      });
    }

    if (enableShowSelectedOnly) {
      output.push({
        disabled,
        icon: <GrRadialSelected />,
        tooltip: <TooltipHelpContent title="Focus on selected spectra" />,
        onClick: () => showSpectraHandler('selectedOnly'),
      });
    }

    if (enableHideSelected) {
      output.push({
        disabled,
        icon: <FaMinus />,
        tooltip: <TooltipHelpContent title="Hide selected spectra" />,
        onClick: () => hideSpectraHandler('selected'),
      });
    }
    if (enableHideAll) {
      output.push({
        icon: <FaEyeSlash />,
        tooltip: <TooltipHelpContent title="Hide all spectra" />,
        onClick: () => hideSpectraHandler('all'),
      });
    }

    return output;
  }

  return {
    showSpectraHandler,
    hideSpectraHandler,
    getToggleVisibilityButtons,
  };
}
