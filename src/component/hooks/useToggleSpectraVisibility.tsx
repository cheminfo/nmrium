import { FaEye, FaEyeSlash } from 'react-icons/fa';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';

export function useToggleSpectraVisibility(mode: 'selected' | 'all' = 'all') {
  const dispatch = useDispatch();
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();

  function showSpectraHandler() {
    dispatch({
      type: 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS',
      payload: { nucleus: activeTab, flag: true, mode },
    });
  }

  function hideSpectraHandler() {
    dispatch({
      type: 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS',
      payload: { nucleus: activeTab, flag: false, mode },
    });
  }

  function getToggleVisibilityButtons(disabled = false) {
    return [
      {
        disabled,
        icon: <FaEyeSlash />,
        tooltip: `Hide ${mode} spectra`,
        onClick: hideSpectraHandler,
      },
      {
        disabled,
        icon: <FaEye />,
        tooltip: `Show ${mode} spectra`,
        onClick: showSpectraHandler,
      },
    ];
  }

  return {
    showSpectraHandler,
    hideSpectraHandler,
    getToggleVisibilityButtons,
  };
}
