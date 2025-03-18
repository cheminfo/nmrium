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
import type { Tool } from '../toolbar/ToolTypes.js';

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

export const accordions: Record<
  keyof NMRiumPanelPreferences,
  Omit<AccordionItem, 'id'>
> = {
  spectraPanel: {
    title: 'Spectra',
    component: <SpectrumListPanel />,
    mode: null,
    icon: 'list-columns',
  },
  informationPanel: {
    title: 'Information',
    component: <InformationPanel />,
    style: { overflow: 'hidden' },
    mode: null,
    icon: 'info-sign',
  },
  peaksPanel: {
    title: 'Peaks',
    component: <PeaksPanel />,
    mode: '1D',
    icon: <SvgNmrPeakPicking />,
  },
  processingsPanel: {
    title: 'Processings',
    component: <FilterPanel />,
    mode: null,
    icon: 'series-derived',
  },
  integralsPanel: {
    title: 'Integrals',
    component: <IntegralPanel />,
    mode: '1D',
    icon: <SvgNmrIntegrate />,
  },
  rangesPanel: {
    title: 'Ranges / Multiplet analysis',
    component: <RangesPanel />,
    mode: '1D',
    icon: <SvgNmrRangePicking />,
  },
  multipleSpectraAnalysisPanel: {
    title: 'Multiple spectra analysis',
    component: <MultipleSpectraAnalysisPanel />,
    mode: null,
    icon: <SvgNmrMultipleAnalysis />,
  },
  matrixGenerationPanel: {
    title: 'Matrix generation',
    component: <MatrixGenerationPanel />,
    mode: '1D',
    icon: 'derive-column',
  },
  zonesPanel: {
    title: 'Zones',
    component: <ZonesPanel />,
    mode: '2D',
    icon: <FaDiceFour />,
  },
  summaryPanel: {
    title: 'Summary',
    component: <SummaryPanel />,
    mode: null,
    icon: 'document',
  },
  structuresPanel: {
    title: 'Chemical structures',
    component: <MoleculePanel />,
    mode: null,
    icon: 'hexagon',
  },
  databasePanel: {
    title: 'Databases',
    component: <DatabasePanel />,
    mode: null,
    icon: 'database',
  },
  automaticAssignmentPanel: {
    title: 'Automatic assignment',
    component: <AutomaticAssignment />,
    mode: null,
    icon: <SvgNmrAssignment2 />,
  },
  predictionPanel: {
    title: 'Prediction',
    component: <PredictionPane />,
    mode: null,
    icon: 'new-grid-item',
  },
  simulationPanel: {
    title: 'Spectrum simulation',
    component: <SpectrumSimulation />,
    mode: '1D',
    icon: 'lab-test',
  },
};

export const accordionItems: AccordionItem[] = Object.entries(accordions).map(
  ([id, item]) => ({ id: id as keyof NMRiumPanelPreferences, ...item }),
);

export const TOOLS_PANELS_ACCORDION: Partial<Record<Tool, string>> = {
  zoom: accordions.spectraPanel.title,
  peakPicking: accordions.peaksPanel.title,
  integral: accordions.integralsPanel.title,
  rangePicking: accordions.rangesPanel.title,
  zonePicking: accordions.zonesPanel.title,
  multipleSpectraAnalysis: accordions.multipleSpectraAnalysisPanel.title,
};
