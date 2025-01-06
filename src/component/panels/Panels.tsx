import { ButtonGroup, Colors } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import styled from '@emotion/styled';
import {
  SvgNmrAssignment2,
  SvgNmrIntegrate,
  SvgNmrMultipleAnalysis,
  SvgNmrPeakPicking,
  SvgNmrRangePicking,
} from 'cheminfo-font';
import lodashGet from 'lodash/get.js';
import type {
  NMRiumPanelPreferences,
  PanelPreferencesType,
} from 'nmr-load-save';
import type { CSSProperties, ReactElement } from 'react';
import { memo, useCallback } from 'react';
import { FaDiceFour, FaRegEdit } from 'react-icons/fa';
import type { AccordionItemProps, ToolbarItemProps } from 'react-science/ui';
import { Accordion, ActivityBarItem, Toolbar } from 'react-science/ui';
import useResizeObserver from 'use-resize-observer';

import { useChartData } from '../context/ChartContext.js';
import { usePreferences } from '../context/PreferencesContext.js';
import { ToolbarPopoverItem } from '../elements/ToolbarPopoverItem.js';
import { useActiveSpectrum } from '../hooks/useActiveSpectrum.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.js';
import { useDialogToggle } from '../hooks/useDialogToggle.js';
import { useSplit } from '../main/SplitPaneWrapper.js';
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
import { InformationEditionModal } from './informationPanel/InformationEditionModal.js';
import { InformationPanel } from './informationPanel/InformationPanel.js';
import MultipleSpectraAnalysisPanel from './multipleAnalysisPanel/MultipleSpectraAnalysisPanel.js';
import PredictionPane from './predictionPanel/PredictionPanel.js';
import SpectrumSimulation from './spectrumSimulation/SpectrumSimulation.js';

const PanelsBarContainer = styled(ButtonGroup)`
  flex-wrap: nowrap;
  overflow: hidden;
  height: 100%;
  gap: 4px;
  padding: 4px;
  border-left: 1px solid ${Colors.LIGHT_GRAY4};
  background-color: ${Colors.WHITE};
`;

export function useAccordionItems() {
  const { displayerMode } = useChartData();
  const isExperimental = useCheckExperimentalFeature();

  return accordionItems.filter(
    (item) =>
      (item.isExperimental === undefined ||
        (item.isExperimental && isExperimental)) &&
      checkMode(item, displayerMode),
  );
}

function useHiddenItemsMenu(items, sliceIndex) {
  const getPanelPreferences = usePanelPreferences();
  const hiddenItems = items.slice(sliceIndex);

  return hiddenItems.map((item) => {
    const panelOptions = getPanelPreferences(item);
    return {
      icon: item.icon,
      text: item.title,
      active: panelOptions.display,
      data: {
        id: item.id,
      },
    };
  });
}

function useTogglePanel(items) {
  const getPanelPreferences = usePanelPreferences();
  const { toggleSplit } = useSplit();
  const { dispatch } = usePreferences();

  function togglePanel(id?: string) {
    if (!id) {
      return;
    }

    const activeItems = items.filter((item) => {
      const panelOptions = getPanelPreferences(item);
      return panelOptions.display;
    });

    if (activeItems.length === 1 && id === activeItems[0].id) {
      toggleSplit(true);
    } else {
      toggleSplit(false);
    }

    dispatch({ type: 'TOGGLE_PANEL', payload: { id } });
  }

  return togglePanel;
}

export function PanelsBar({ itemHeight = 44 }) {
  const {
    ref,
    height,
    // @ts-expect-error Module is not published correctly.
  } = useResizeObserver();
  const getPanelPreferences = usePanelPreferences();

  const sliceIndex = Math.floor((height - itemHeight) / itemHeight);

  const items = useAccordionItems();
  const visibleItems = items.filter((_, index) => index < sliceIndex);
  const menu = useHiddenItemsMenu(items, sliceIndex);
  const isMenuActive = menu.some((item) => item.active);

  const togglePanel = useTogglePanel(items);

  return (
    <PanelsBarContainer vertical large minimal ref={ref}>
      {visibleItems.map((item) => {
        const panelOptions = getPanelPreferences(item);
        return (
          <ActivityBarItem
            key={item.id}
            id={item.id}
            tooltip={item.title}
            icon={item.icon}
            active={panelOptions.display}
            onClick={() => togglePanel(item.id)}
          />
        );
      })}
      {menu.length > 0 && (
        <Toolbar>
          <ToolbarPopoverItem<{ id: string }>
            placement="left"
            tooltipProps={{ placement: 'left' }}
            options={menu}
            tooltip={`More panels [ +${menu.length} ]`}
            icon="more"
            onClick={(data) => togglePanel(data?.id)}
            active={isMenuActive}
          />
        </Toolbar>
      )}
    </PanelsBarContainer>
  );
}

interface AccordionItem
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

function usePanelPreferences(): (item: AccordionItem) => PanelPreferencesType {
  const preferences = usePreferences();

  return useCallback(
    (item: AccordionItem) => {
      const defaultValue: PanelPreferencesType = {
        display: false,
        open: false,
      };

      if (item?.isExperimental && !item.id) {
        return {
          display: true,
          open: false,
        };
      }

      return lodashGet(
        preferences.current,
        `display.panels.${item.id}`,
        defaultValue,
      );
    },
    [preferences],
  );
}

function checkMode(item: AccordionItem, displayerMode: DisplayerMode) {
  return item.mode == null || item.mode === displayerMode;
}

export function useCheckPanel(displayerMode) {
  const getPanelPreferences = usePanelPreferences();
  const isExperimental = useCheckExperimentalFeature();

  return useCallback(
    (item) => {
      const panelOptions = getPanelPreferences(item);

      return (
        (panelOptions?.display &&
          item.isExperimental === undefined &&
          checkMode(item, displayerMode)) ||
        (item.isExperimental && isExperimental)
      );
    },
    [displayerMode, getPanelPreferences, isExperimental],
  );
}

function PanelsInner() {
  const getPanelPreferences = usePanelPreferences();
  const { dialog, openDialog, closeDialog } = useDialogToggle({
    informationModal: false,
  });

  const items = useAccordionItems();
  function isOpened(item: AccordionItem) {
    const panelOptions = getPanelPreferences(item);
    return panelOptions?.open;
  }
  function isVisible(item: AccordionItem) {
    const panelOptions = getPanelPreferences(item);
    return panelOptions?.display;
  }

  return (
    <div style={{ width: '100%', height: '100%', flex: '1 1 0%' }}>
      <InformationEditionModal
        isOpen={dialog.informationModal}
        onCloseDialog={closeDialog}
      />
      <Accordion>
        {items
          .filter((item) => isVisible(item))
          .map((item) => {
            const { title, component, id } = item;
            return (
              <Accordion.Item
                key={title}
                title={title}
                defaultOpened={isOpened(item)}
                toolbar={
                  <RightButtons
                    id={id}
                    items={items}
                    onEdit={(event) => {
                      event.stopPropagation();
                      openDialog('informationModal');
                    }}
                  />
                }
              >
                {component}
              </Accordion.Item>
            );
          })}
      </Accordion>
    </div>
  );
}

function RightButtons(props: {
  id: keyof NMRiumPanelPreferences;
  onEdit: ToolbarItemProps['onClick'];
  items: AccordionItem[];
}) {
  const { onEdit, id, items } = props;
  const activeSpectrum = useActiveSpectrum();
  const toggle = useTogglePanel(items);
  function handleClosePanel(event) {
    event?.stopPropagation();
    toggle(id);
  }

  return (
    <Toolbar>
      {id === 'informationPanel' && (
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
      )}
      <Toolbar.Item
        icon="cross"
        tooltip="Close panel"
        onClick={handleClosePanel}
      />
    </Toolbar>
  );
}

const MemoizedPanels = memo(PanelsInner);

export default function Panels() {
  return <MemoizedPanels />;
}
