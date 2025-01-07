import type { IconName } from '@blueprintjs/icons';
import {
  SvgNmrAssignment2,
  SvgNmrIntegrate,
  SvgNmrMultipleAnalysis,
  SvgNmrPeakPicking,
  SvgNmrRangePicking,
} from 'cheminfo-font';
import type { NMRiumPanelPreferences } from 'nmr-load-save';
import type { CSSProperties, ReactElement } from 'react';
import { FaDiceFour } from 'react-icons/fa';
import type { AccordionItemProps } from 'react-science/ui';

import type { DisplayerMode } from '../reducer/Reducer.js';

import AutomaticAssignment from './AutomaticAssignment/AutomaticAssignment.js';
import IntegralPanel from './IntegralsPanel/IntegralPanel.js';
import { MatrixGenerationPanel } from './MatrixGenerationPanel/MatrixGenerationPanel.js';
import MoleculePanel from './MoleculesPanel/MoleculePanel.js';
import PeaksPanel from './PeaksPanel/PeaksPanel.js';
import RangesPanel from './RangesPanel/RangesPanel.js';
import SpectrumListPanel from './SpectraPanel/SpectrumListPanel.js';
import SummaryPanel from './SummaryPanel/SummaryPanel.js';
import ZonesPanel from './ZonesPanel/ZonesPanel.js';
import DatabasePanel from './databasePanel/DatabasePanel.js';
import FilterPanel from './filtersPanel/FilterPanel.js';
import { InformationPanel } from './informationPanel/InformationPanel.js';
import MultipleSpectraAnalysisPanel from './multipleAnalysisPanel/MultipleSpectraAnalysisPanel.js';
import PredictionPane from './predictionPanel/PredictionPanel.js';
import SpectrumSimulation from './spectrumSimulation/SpectrumSimulation.js';

export interface AccordionItem
  extends Omit<AccordionItemProps, 'children' | 'defaultOpened'> {
  id: keyof NMRiumPanelPreferences;
  component: ReactElement;
  style?: CSSProperties;
  mode: DisplayerMode | null;
  isExperimental?: boolean;
  icon: IconName | ReactElement;
}

export const accordionItems: AccordionItem[] = [
  {
    id: 'spectraPanel',
    title: 'Spectra',
    component: <SpectrumListPanel />,
    mode: null,
    icon: 'list-columns',
  },
  {
    id: 'informationPanel',
    title: 'Information',
    component: <InformationPanel />,
    style: { overflow: 'hidden' },
    mode: null,
    icon: 'info-sign',
  },
  {
    id: 'peaksPanel',
    title: 'Peaks',
    component: <PeaksPanel />,
    mode: '1D',
    icon: <SvgNmrPeakPicking />,
  },
  {
    id: 'processingsPanel',
    title: 'Processings',
    component: <FilterPanel />,
    mode: null,
    icon: 'series-derived',
  },
  {
    id: 'integralsPanel',
    title: 'Integrals',
    component: <IntegralPanel />,
    mode: '1D',
    icon: <SvgNmrIntegrate />,
  },
  {
    id: 'rangesPanel',
    title: 'Ranges / Multiplet analysis',
    component: <RangesPanel />,
    mode: '1D',
    icon: <SvgNmrRangePicking />,
  },
  {
    id: 'multipleSpectraAnalysisPanel',
    title: 'Multiple spectra analysis',
    component: <MultipleSpectraAnalysisPanel />,
    mode: null,
    icon: <SvgNmrMultipleAnalysis />,
  },
  {
    id: 'matrixGenerationPanel',
    title: 'Matrix generation',
    component: <MatrixGenerationPanel />,
    mode: '1D',
    icon: 'derive-column',
  },
  {
    id: 'zonesPanel',
    title: 'Zones',
    component: <ZonesPanel />,
    mode: '2D',
    icon: <FaDiceFour />,
  },
  {
    id: 'summaryPanel',
    title: 'Summary',
    component: <SummaryPanel />,
    mode: null,
    icon: 'document',
  },
  {
    id: 'structuresPanel',
    title: 'Chemical structures',
    component: <MoleculePanel />,
    mode: null,
    icon: 'hexagon',
  },
  {
    id: 'databasePanel',
    title: 'Databases',
    component: <DatabasePanel />,
    mode: null,
    icon: 'database',
  },
  {
    id: 'automaticAssignmentPanel',
    title: 'Automatic assignment',
    component: <AutomaticAssignment />,
    mode: null,
    icon: <SvgNmrAssignment2 />,
  },
  {
    id: 'predictionPanel',
    title: 'Prediction',
    component: <PredictionPane />,
    mode: null,
    icon: 'new-grid-item',
  },
  {
    id: 'simulationPanel',
    title: 'Spectrum simulation',
    component: <SpectrumSimulation />,
    mode: '1D',
    icon: 'lab-test',
  },
];

export const TOOLS_PANELS_ACCORDION: Record<string, string> = {
  null: 'Spectra',
  peakPicking: 'Peaks',
  integral: 'Integrals',
  rangePicking: 'Ranges / Multiplet analysis',
  zonePicking: 'Zones',
  multipleSpectraAnalysis: 'Multiple Spectra Analysis',
};
