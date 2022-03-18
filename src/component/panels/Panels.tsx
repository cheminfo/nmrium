import { Accordion } from 'analysis-ui-components';
import lodashGet from 'lodash/get';
import { useCallback, memo, ReactElement, CSSProperties } from 'react';

import { NMRIumWorkspace } from '../NMRium';
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

interface BaseAccordionItem {
  title: string;
  component: ReactElement;
  style?: CSSProperties;
  hidePreferenceKey: string;
  mode: '1D' | '2D' | null;
  isExperimental?: boolean;
}

interface PreventOpenOptions extends BaseAccordionItem {
  isOpen: true;
  preventOpenWhen?: (null | NMRIumWorkspace)[];
  openWhen?: (null | NMRIumWorkspace)[];
}
interface OpenOptions extends BaseAccordionItem {
  isOpen?: false;
}

type AccordionItem = PreventOpenOptions | OpenOptions;

const accordionItems: AccordionItem[] = [
  {
    title: 'Spectra',
    component: <SpectrumListPanel />,
    hidePreferenceKey: 'spectraPanel',
    mode: null,
    isOpen: true,
    preventOpenWhen: ['prediction'],
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
    title: 'Database',
    component: <DatabasePanel />,
    hidePreferenceKey: 'databasePanel',
    mode: null,
  },
  {
    title: 'Automatic Assignment',
    component: <AutomaticAssignment />,
    hidePreferenceKey: '',
    mode: null,
    isExperimental: true,
  },
  {
    title: 'Prediction',
    component: <PredictionPane />,
    hidePreferenceKey: 'predictionPanel',
    mode: null,
    isOpen: true,
    openWhen: ['prediction'],
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

function PanelsInner({ displayerMode }) {
  const preferences = usePreferences();
  const isExperimental = useCheckExperimentalFeature();
  const check = useCallback(
    (item) => {
      return (
        (lodashGet(
          preferences.current,
          `display.panels.${item.hidePreferenceKey}`,
        ) === true &&
          item.isExperimental === undefined &&
          (item.mode == null || item.mode === displayerMode)) ||
        (item.isExperimental && isExperimental)
      );
    },
    [displayerMode, isExperimental, preferences],
  );

  const isOpened = useCallback(
    (item: AccordionItem) => {
      if (
        item?.isOpen &&
        !item?.preventOpenWhen?.includes(preferences?.workspace?.base) &&
        (!item?.openWhen ||
          item.openWhen?.includes(preferences?.workspace?.base))
      ) {
        return true;
      } else {
        return false;
      }
    },
    [preferences?.workspace?.base],
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
