import lodashGet from 'lodash/get.js';
import { NMRiumPanelPreferences, PanelPreferencesType } from 'nmr-load-save';
import { CSSProperties, memo, ReactElement, useCallback } from 'react';
import { FaRegEdit } from 'react-icons/fa';
import {
  Accordion,
  AccordionItemProps,
  Toolbar,
  ToolbarItemProps,
} from 'react-science/ui';

import { useChartData } from '../context/ChartContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';
import { useDialogToggle } from '../hooks/useDialogToggle.js';
import { DisplayerMode } from '../reducer/Reducer.js';

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
import { InformationEditionModal } from './informationPanel/InformationEditionModal.js';
import { InformationPanel } from './informationPanel/InformationPanel.js';
import MultipleSpectraAnalysisPanel from './multipleAnalysisPanel/MultipleSpectraAnalysisPanel.js';
import PredictionPane from './predictionPanel/PredictionPanel.js';
import SpectrumSimulation from './spectrumSimulation/SpectrumSimulation.js';

interface AccordionItem
  extends Omit<AccordionItemProps, 'children' | 'defaultOpened'> {
  id?: keyof NMRiumPanelPreferences;
  component: ReactElement;
  style?: CSSProperties;
  hidePreferenceKey: string;
  mode: DisplayerMode | null;
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
    id: 'informationPanel',
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
    mode: '1D',
  },
  {
    title: 'Processings',
    component: <FilterPanel />,
    hidePreferenceKey: 'processingsPanel',
    mode: null,
  },
  {
    title: 'Integrals',
    component: <IntegralPanel />,
    hidePreferenceKey: 'integralsPanel',
    mode: '1D',
  },
  {
    title: 'Ranges / Multiplet analysis',
    component: <RangesPanel />,
    hidePreferenceKey: 'rangesPanel',
    mode: '1D',
  },
  {
    title: 'Multiple spectra analysis',
    component: <MultipleSpectraAnalysisPanel />,
    hidePreferenceKey: 'multipleSpectraAnalysisPanel',
    mode: null,
  },
  {
    title: 'Matrix generation',
    component: <MatrixGenerationPanel />,
    hidePreferenceKey: 'matrixGenerationPanel',
    mode: '1D',
  },
  {
    title: 'Zones',
    component: <ZonesPanel />,
    hidePreferenceKey: 'zonesPanel',
    mode: '2D',
  },
  {
    title: 'Summary',
    component: <SummaryPanel />,
    hidePreferenceKey: 'summaryPanel',
    mode: null,
  },
  {
    title: 'Chemical structures',
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
    title: 'Automatic assignment',
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
  {
    title: 'Spectrum simulation',
    component: <SpectrumSimulation />,
    hidePreferenceKey: 'simulationPanel',
    mode: '1D',
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

function usePanelPreferences(): (item: AccordionItem) => PanelPreferencesType {
  const preferences = usePreferences();

  return useCallback(
    (item: AccordionItem) => {
      const defaultValue: PanelPreferencesType = {
        display: false,
        open: false,
      };

      if (item?.isExperimental && !item.hidePreferenceKey) {
        return {
          display: true,
          open: false,
        };
      }

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
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    informationModal: false,
  });

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

  function isOpened(item: AccordionItem) {
    const panelOptions = getPanelPreferences(item);
    return panelOptions?.display && panelOptions?.open;
  }

  return (
    <div style={{ width: '100%', height: '100%', flex: '1 1 0%' }}>
      <InformationEditionModal
        isOpen={dialog.informationModal}
        onCloseDialog={closeDialog}
      />
      <Accordion>
        {accordionItems.map((item) => {
          const { title, component, id } = item;
          let toolbar;

          if (id === 'informationPanel') {
            toolbar = (
              <InformationPanelToolBar
                onEdit={({ event }) => {
                  event.stopPropagation();
                  openDialog('informationModal');
                }}
              />
            );
          }
          return (
            check(item) && (
              <Accordion.Item
                key={title}
                title={title}
                defaultOpened={isOpened(item)}
                toolbar={toolbar}
              >
                {component}
              </Accordion.Item>
            )
          );
        })}
      </Accordion>
    </div>
  );
}

function InformationPanelToolBar(props: {
  onEdit: ToolbarItemProps['onClick'];
}) {
  const { onEdit } = props;
  const activeSpectrum = useActiveSpectrum();

  return (
    <Toolbar minimal>
      <Toolbar.Item
        disabled={!activeSpectrum}
        tooltipProps={{ intent: !activeSpectrum ? 'danger' : 'none' }}
        icon={<FaRegEdit />}
        onClick={onEdit}
        tooltip={
          !activeSpectrum
            ? 'Select a spectrum to edit its meta information'
            : 'Edit spectrum meta information'
        }
      />
    </Toolbar>
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
