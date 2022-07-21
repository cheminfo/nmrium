import { Accordion } from 'analysis-ui-components';
import lodashGet from 'lodash/get';
import { useCallback, memo, ReactElement, CSSProperties } from 'react';

import { PanelPreferencesType } from '../../types/PanelPreferencesType';
import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import { DISPLAYER_MODE } from '../reducer/core/Constants';

import AutomaticAssignment from './AutomaticAssignment/AutomaticAssignment';
import InformationPanel from './InformationPanel';
import IntegralPanel from './IntegralsPanel/IntegralPanel';
import MatrixGenerationPanel from './MatrixGenerationPanel/MatrixGenerationPanel';
import MoleculePanel from './MoleculesPanel/MoleculePanel';
import MultipleSpectraAnalysisPanel from './MultipleSpectraAnalysisPanel/MultipleSpectraAnalysisPanel';
import PeaksPanel from './PeaksPanel/PeaksPanel';
import RangesPanel from './RangesPanel/RangesPanel';
import SpectrumListPanel from './SpectrumsPanel/SpectrumListPanel';
import SummaryPanel from './SummaryPanel/SummaryPanel';
import ZonesPanel from './ZonesPanel/ZonesPanel';
import DatabasePanel from './databasePanel/DatabasePanel';
import FilterPanel from './filtersPanel/FilterPanel';
import PredictionPane from './predictionPanel/PredictionPanel';

interface AccordionItem {
  title: string;
  component: ReactElement;
  style?: CSSProperties;
  hidePreferenceKey: string;
  mode: '1D' | '2D' | null;
  isExperimental?: boolean;
}

const accordionItems: AccordionItem[] = [
  {
    title: 'Spectra',
    component: <SpectrumListPanel />,
    hidePreferenceKey: 'spectraPanel',
    mode: null,
  },
  {
    title: 'Information',
    component: <InformationPanel />,
    style: { overflow: 'hidden' },
    hidePreferenceKey: 'informationPanel',
    mode: null,
  },
  {
    title: 'Peaks',
    component: <PeaksPanel />,
    hidePreferenceKey: 'peaksPanel',
    mode: null,
  },
  {
    title: 'Filters',
    component: <FilterPanel />,
    hidePreferenceKey: 'filtersPanel',
    mode: null,
  },
  {
    title: 'Integrals',
    component: <IntegralPanel />,
    hidePreferenceKey: 'integralsPanel',
    mode: null,
  },
  {
    title: 'Ranges',
    component: <RangesPanel />,
    hidePreferenceKey: 'rangesPanel',
    mode: DISPLAYER_MODE.DM_1D,
  },
  {
    title: 'Multiple Spectra Analysis',
    component: <MultipleSpectraAnalysisPanel />,
    hidePreferenceKey: 'multipleSpectraAnalysisPanel',
    mode: null,
  },
  {
    title: 'Matrix Generation',
    component: <MatrixGenerationPanel />,
    hidePreferenceKey: '',
    mode: null,
    isExperimental: true,
  },
  {
    title: 'Zones',
    component: <ZonesPanel />,
    hidePreferenceKey: 'zonesPanel',
    mode: DISPLAYER_MODE.DM_2D,
  },
  {
    title: 'Summary',
    component: <SummaryPanel />,
    hidePreferenceKey: 'summaryPanel',
    mode: null,
  },
  {
    title: 'Structures',
    component: <MoleculePanel />,
    hidePreferenceKey: 'structuresPanel',
    mode: null,
  },
  {
    title: 'Databases',
    component: <DatabasePanel />,
    hidePreferenceKey: 'databasePanel',
    mode: null,
  },
  {
    title: 'Automatic Assignment',
    component: <AutomaticAssignment />,
    hidePreferenceKey: 'automaticAssignmentPanel',
    mode: null,
  },
  {
    title: 'Prediction',
    component: <PredictionPane />,
    hidePreferenceKey: 'predictionPanel',
    mode: null,
  },
];

export const TOOLS_PANELS_ACCORDION: Record<string, string> = {
  null: 'Spectra',
  peakPicking: 'Peaks',
  integral: 'Integrals',
  rangesPicking: 'Ranges',
  zone2D: 'Zones',
  multipleSpectraAnalysis: 'Multiple Spectra Analysis',
};

function usePanelPreferences(): (item: AccordionItem) => PanelPreferencesType {
  const preferences = usePreferences();

  return useCallback(
    (item: AccordionItem) => {
      const defaultValue: PanelPreferencesType = {
        display: false,
        open: false,
      };

      return lodashGet(
        preferences.current,
        `display.panels.${item.hidePreferenceKey}`,
        defaultValue,
      );
    },
    [preferences],
  );
}

function PanelsInner({ displayerMode: displayedMode }) {
  const getPanelPreferences = usePanelPreferences();
  const isExperimental = useCheckExperimentalFeature();
  const check = useCallback(
    (item) => {
      const panelOptions = getPanelPreferences(item);

      return (
        (panelOptions?.display &&
          item.isExperimental === undefined &&
          (item.mode == null || item.mode === displayedMode)) ||
        (item.isExperimental && isExperimental)
      );
    },
    [displayedMode, getPanelPreferences, isExperimental],
  );

  const isOpened = useCallback(
    (item: AccordionItem) => {
      const panelOptions = getPanelPreferences(item);
      return panelOptions?.display && panelOptions?.open;
    },
    [getPanelPreferences],
  );

  return (
    <div style={{ width: '100%', height: '100%', flex: '1 1 0%' }}>
      <Accordion>
        {accordionItems.map((item) => {
          return (
            check(item) && (
              <Accordion.Item
                key={item.title}
                title={item.title}
                defaultOpened={isOpened(item)}
              >
                {item.component}
              </Accordion.Item>
            )
          );
        })}
      </Accordion>
    </div>
  );
}

const MemoizedPanels = memo(PanelsInner);

export default function Panels() {
  const {
    displayerMode,
    toolOptions: { selectedTool },
  } = useChartData();

  return <MemoizedPanels {...{ displayerMode, selectedTool }} />;
}
