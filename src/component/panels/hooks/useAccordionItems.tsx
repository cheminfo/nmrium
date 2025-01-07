import { useChartData } from '../../context/ChartContext.js';
import useCheckExperimentalFeature from '../../hooks/useCheckExperimentalFeature.js';
import { accordionItems } from '../accordionItems.js';
import { checkAccordionItemMode } from '../checkAccordionItemMode.js';

import { useGetPanelOptions } from './useGetPanelOptions.js';

export function useAccordionItems() {
  const { displayerMode } = useChartData();
  const isExperimentalPanel = useCheckExperimentalFeature();
  const getPanelPreferences = useGetPanelOptions();

  return accordionItems.filter((item) => {
    const isVisible = getPanelPreferences(item).visible;
    const isExperimental =
      item.isExperimental === undefined ||
      (item.isExperimental && isExperimentalPanel);
    const isMatchDisplayerMode = checkAccordionItemMode(item, displayerMode);

    return isExperimental && isMatchDisplayerMode && isVisible;
  });
}
