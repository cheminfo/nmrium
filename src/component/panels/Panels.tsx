import { Accordion } from 'analysis-ui-components';
import lodashGet from 'lodash/get';
import { useCallback, memo, ReactElement, CSSProperties } from 'react';

import { useChartData } from '../context/ChartContext';
import { usePreferences } from '../context/PreferencesContext';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature';
import { DISPLAYER_MODE } from '../reducer/core/Constants';
import { options } from '../toolbar/ToolTypes';

import InformationPanel from './InformationPanel';
import IntegralPanel from './IntegralsPanel/IntegralPanel';
import MoleculePanel from './MoleculesPanel/MoleculePanel';
import MultipleSpectraAnalysisPanel from './MultipleSpectraAnalysisPanel/MultipleSpectraAnalysisPanel';
import PeaksPanel from './PeaksPanel/PeaksPanel';
import RangesPanel from './RangesPanel/RangesPanel';
import SpectrumListPanel from './SpectrumsPanel/SpectrumListPanel';
import SummaryPanel from './SummaryPanel/SummaryPanel';
import ZonesPanel from './ZonesPanel/ZonesPanel';
import DatabasePanel from './databasePanel/DatabasePanel';
import FilterPanel from './filtersPanel/FilterPanel';
import MatrixGenerationPanel from './MatrixGenerationPanel/MatrixGenerationPanel';

interface AccordionItem {
  title: string;
  component: ReactElement;
  openWhen: Array<string | number> | null;
  style?: CSSProperties;
  hidePreferenceKey: string;
  mode: '1D' | '2D' | null;
  isExperimental?: boolean;
}

const accordionItems: AccordionItem[] = [
  {
    title: 'Spectra',
    component: <SpectrumListPanel />,
    openWhen: null,
    hidePreferenceKey: 'hideSpectraPanel',
    mode: null,
  },
  {
    title: 'Information',
    component: <InformationPanel />,
    openWhen: null,
    style: { overflow: 'hidden' },
    hidePreferenceKey: 'hideInformationPanel',
    mode: null,
  },
  {
    title: 'Peaks',
    component: <PeaksPanel />,
    openWhen: [options.peakPicking.id],
    hidePreferenceKey: 'hidePeaksPanel',
    mode: null,
  },
  {
    title: 'Filters',
    component: <FilterPanel />,
    openWhen: null,
    hidePreferenceKey: 'hideFiltersPanel',
    mode: null,
  },
  {
    title: 'Integrals',
    component: <IntegralPanel />,
    openWhen: [options.integral.id],
    hidePreferenceKey: 'hideIntegralsPanel',
    mode: null,
  },
  {
    title: 'Ranges',
    component: <RangesPanel />,
    openWhen: [options.rangesPicking.id],
    hidePreferenceKey: 'hideRangesPanel',
    mode: DISPLAYER_MODE.DM_1D,
  },
  {
    title: 'Multiple Spectra Analysis',
    component: <MultipleSpectraAnalysisPanel />,
    openWhen: [options.multipleSpectraAnalysis.id],
    hidePreferenceKey: 'hideMultipleSpectraAnalysisPanel',
    mode: null,
  },
  {
    title: 'Matrix Generation',
    component: <MatrixGenerationPanel />,
    openWhen: [],
    hidePreferenceKey: '',
    mode: null,
    isExperimental: true,
  },
  {
    title: 'Zones',
    component: <ZonesPanel />,
    openWhen: [options.zone2D.id],
    hidePreferenceKey: 'hideZonesPanel',
    mode: DISPLAYER_MODE.DM_2D,
  },
  {
    title: 'Summary',
    component: <SummaryPanel />,
    openWhen: [],
    hidePreferenceKey: 'hideSummaryPanel',
    mode: null,
  },
  {
    title: 'Structures',
    component: <MoleculePanel />,
    openWhen: [options.rangesPicking.id],
    hidePreferenceKey: 'hideStructuresPanel',
    mode: null,
  },
  {
    title: 'Database',
    component: <DatabasePanel />,
    openWhen: [],
    hidePreferenceKey: 'hideDatabasePanel',
    mode: null,
  },
];

export const PANELS_ACCORDION: Record<string, string> = {
  null: 'Spectra',
  peakPicking: 'Peaks',
  integral: 'Integrals',
  rangesPicking: 'Ranges',
  zone2D: 'Zones',
};

function PanelsInner({ displayerMode }) {
  const preferences = usePreferences();
  const isExperimental = useCheckExperimentalFeature();
  const check = useCallback(
    (item) => {
      return (
        (!lodashGet(preferences, `display.panels.${item.hidePreferenceKey}`) &&
          item.isExperimental === undefined &&
          (item.mode == null || item.mode === displayerMode)) ||
        (item.isExperimental && isExperimental)
      );
    },
    [displayerMode, isExperimental, preferences],
  );

  return (
    <div style={{ width: '100%', height: '100%', flex: '1 1 0%' }}>
      <Accordion>
        {accordionItems.map((item, index) => {
          return (
            check(item) && (
              <Accordion.Item
                key={item.title}
                title={item.title}
                defaultOpened={index === 0}
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
