import styled from '@emotion/styled';
import { assertDefined } from '@zakodium/utils';
import { memo, useMemo } from 'react';
import {
  FaFilm,
  FaQuestionCircle,
  FaRegSave,
  FaRegWindowMaximize,
} from 'react-icons/fa';
import { Button as RSButton, Toolbar, useFullscreen } from 'react-science/ui';

import { docsBaseUrl } from '../../constants.js';
import { useChartData } from '../context/ChartContext.js';
import { useCore } from '../context/CoreContext.tsx';
import { useDispatch } from '../context/DispatchContext.tsx';
import {
  usePreferences,
  useWorkspacesList,
} from '../context/PreferencesContext.js';
import { useProcessingsMutations } from '../context/processings_mutations_context.tsx';
import Button from '../elements/Button.js';
import { ContainerQueryWrapper } from '../elements/ContainerQueryWrapper.js';
import { HeaderContainer } from '../elements/HeaderContainer.js';
import type { LabelStyle } from '../elements/Label.js';
import type { DropDownListItem } from '../elements/dropDownButton/DropDownButton.js';
import DropDownButton from '../elements/dropDownButton/DropDownButton.js';
import useCheckExperimentalFeature from '../hooks/useCheckExperimentalFeature.ts';
import { useSaveSettings } from '../hooks/useSaveSettings.js';
import { useStableSpectrum } from '../hooks/useSpectrum.ts';
import { useWorkspaceAction } from '../hooks/useWorkspaceAction.js';
import { LogsHistoryModal } from '../modal/LogsHistoryModal.js';
import AboutUsModal from '../modal/aboutUs/AboutUsModal.js';
import WorkspaceItem from '../modal/setting/WorkspaceItem.js';
import { GeneralSettingsToolbarItem } from '../modal/setting/general_settings.js';
import { useLiveEdit } from '../panels/filtersPanel/processings/use_live_edit.ts';
import { useLiveOperation } from '../panels/filtersPanel/processings/use_live_operation.ts';
import { options } from '../toolbar/ToolTypes.js';
import { CoreOperatorTopBar } from '../utility/core_slots/core_operator_topbar.tsx';
import { CoreSlot } from '../utility/core_slots/core_slot.tsx';

import { AutoPeakPickingOptionPanel } from './AutoPeakPickingOptionPanel.js';
import { HeaderWrapper } from './HeaderWrapper.js';
import RangesPickingOptionPanel from './RangesPickingOptionPanel.js';
import { SimpleApodizationDimensionOneOptionsPanel } from './SimpleApodizationDimensionOneOptionsPanel.js';
import { SimpleApodizationDimensionTwoOptionsPanel } from './SimpleApodizationDimensionTwoOptionsPanel.js';
import { SimpleApodizationOptionsPanel } from './SimpleApodizationOptionsPanel.js';
import { SimpleBaseLineCorrectionOptionsPanel } from './SimpleBaseLineCorrectionOptionsPanel.js';
import { SimplePhaseCorrectionOptionsPanel } from './SimplePhaseCorrectionOptionsPanel.js';
import { SimplePhaseCorrectionTwoDimensionsPanel } from './SimplePhaseCorrectionTwoDimensionsPanel.js';
import { SimpleZeroFillingDimensionOneOptionsPanel } from './SimpleZeroFillingDimensionOneOptionsPanel.js';
import { SimpleZeroFillingDimensionTwoOptionsPanel } from './SimpleZeroFillingDimensionTwoOptionsPanel.js';
import { SimpleZeroFillingOptionsPanel } from './SimpleZeroFillingOptionsPanel.js';
import Zones2DOptionPanel from './Zones2DOptionPanel.js';

export const headerLabelStyle: LabelStyle = {
  label: {
    fontWeight: 'normal',
    fontSize: '12px',
  },
  wrapper: {
    paddingRight: '5px',
    height: '100%',
    display: 'flex',
    alignItems: 'center',
  },
};
interface HeaderInnerProps {
  selectedOptionPanel: string | null;
  height: number;
}

function HeaderInner(props: HeaderInnerProps) {
  const { selectedOptionPanel, height } = props;

  const {
    current: {
      display: { general },
    },
    workspace,
  } = usePreferences();
  const { setActiveWorkspace } = useWorkspaceAction();
  const fullscreen = useFullscreen();
  const isExperimental = useCheckExperimentalFeature();

  const workspacesList = useWorkspacesList();

  const hideGeneralSettings = !!(
    general?.hideGeneralSettings && workspace.base
  );
  const hideWorkspaces = !!(general?.hideWorkspaces && workspace.base);

  const selectedPanel = useMemo(() => {
    switch (selectedOptionPanel) {
      case options.apodization.id:
        return <SimpleApodizationOptionsPanel />;
      case options.apodizationDimension1.id:
        return <SimpleApodizationDimensionOneOptionsPanel />;
      case options.apodizationDimension2.id:
        return <SimpleApodizationDimensionTwoOptionsPanel />;
      case options.zeroFilling.id:
        return <SimpleZeroFillingOptionsPanel />;
      case options.zeroFillingDimension1.id:
        return <SimpleZeroFillingDimensionOneOptionsPanel />;
      case options.zeroFillingDimension2.id:
        return <SimpleZeroFillingDimensionTwoOptionsPanel />;
      case options.phaseCorrection.id:
        return <SimplePhaseCorrectionOptionsPanel />;
      case options.phaseCorrectionTwoDimensions.id:
        return <SimplePhaseCorrectionTwoDimensionsPanel />;
      case options.baselineCorrection.id:
        return <SimpleBaseLineCorrectionOptionsPanel />;
      case options.peakPicking.id:
        return <AutoPeakPickingOptionPanel />;
      case options.rangePicking.id:
        return <RangesPickingOptionPanel />;
      case options.zonePicking.id:
        return <Zones2DOptionPanel />;
      default:
        return null;
    }
  }, [selectedOptionPanel]);

  function changeWorkspaceHandler(option: DropDownListItem) {
    setActiveWorkspace(option.key);
  }

  function renderItem(item: any) {
    return <WorkspaceItem item={item} />;
  }

  return (
    <ContainerQueryWrapper
      widthThreshold={1200}
      narrowClassName="small-label"
      wideClassName="large-label"
    >
      <HeaderContainer
        style={{ leftStyle: { flex: 1 }, containerStyle: { padding: '2px' } }}
      >
        <HeaderWrapper
          style={{
            alignItems: 'center',
          }}
        >
          <div>
            <Toolbar>
              <AboutUsModal />
            </Toolbar>
          </div>
          {isExperimental && <PluginTopBarTool />}
          <div className="toolOptionsPanel" style={{ flex: 1 }}>
            {selectedPanel}
          </div>
        </HeaderWrapper>
        <HeaderWrapper
          style={{
            alignItems: 'center',
          }}
        >
          <PluginTopBarRight>
            <CoreSlot slot="topbar.right" />
          </PluginTopBarRight>

          {!hideWorkspaces && (
            <DropDownButton
              data={workspacesList}
              selectedKey={workspace.current}
              onSelect={changeWorkspaceHandler}
              renderItem={renderItem}
            />
          )}
          {!hideGeneralSettings && <SaveButton />}
          {!general?.hideLogs && <LogsHistoryModal />}

          <div>
            <Toolbar>
              {!general?.hideHelp && (
                <Toolbar.Item
                  id="user-manual"
                  tooltip="User manual"
                  onClick={() => window.open(docsBaseUrl, '_blank')}
                  icon={<FaQuestionCircle />}
                />
              )}
              <Toolbar.Item
                id="user-manual"
                tooltip="NMRium tutorials"
                onClick={() =>
                  window.open('https://www.nmrium.org/tutorials', '_blank')
                }
                icon={<FaFilm />}
              />

              {!hideGeneralSettings && (
                <GeneralSettingsToolbarItem height={height / 2} />
              )}

              {!fullscreen.isFullScreen && !general?.hideMaximize && (
                <Toolbar.Item
                  id="full-screen"
                  onClick={fullscreen.toggle}
                  tooltip="Full screen"
                  icon={<FaRegWindowMaximize />}
                />
              )}
            </Toolbar>
          </div>
        </HeaderWrapper>
      </HeaderContainer>
    </ContainerQueryWrapper>
  );
}

function SaveButton() {
  const { workspace, workspaces, originalWorkspaces } = usePreferences();
  const { saveSettings, SaveSettingsModal } = useSaveSettings();
  const isWorkspaceHasSettingNotSaved =
    JSON.stringify(workspaces[workspace.current]) !==
    JSON.stringify(originalWorkspaces[workspace.current]);

  function handleSave() {
    saveSettings();
  }

  return (
    <>
      <Button.Done
        wrapperClassName="small-width-none"
        onClick={handleSave}
        fill="clear"
        style={{ fontSize: '1.4em', marginLeft: '5px' }}
        {...(!isWorkspaceHasSettingNotSaved && {
          color: { base: 'gray', hover: 'gray' },
          backgroundColor: { base: 'gray', hover: 'lightgray' },
          disabled: true,
        })}
        toolTip="Save workspace locally in the browser"
      >
        <FaRegSave />
      </Button.Done>
      <SaveSettingsModal />
    </>
  );
}

const MemoizedHeader = memo(HeaderInner);

export function Header() {
  const {
    toolOptions: { selectedOptionPanel },
    height,
  } = useChartData();

  return (
    <MemoizedHeader selectedOptionPanel={selectedOptionPanel} height={height} />
  );
}

const PluginTopBarRight = styled.div`
  align-items: center;
  display: flex;
  gap: 5px;
  margin-right: 5px;
`;

const PluginTopBarToolContainer = styled.div`
  flex: 1;
  display: flex;
  align-items: center;
  gap: 5px;
`;

function PluginTopBarTool() {
  const core = useCore();
  const stableSpectrum = useStableSpectrum();
  const [liveOperation, setLiveOperation] = useLiveOperation();
  const liveEdit = useLiveEdit(liveOperation?.uid);
  const processingsMutations = useProcessingsMutations();
  const dispatch = useDispatch();

  if (!liveOperation) return null;
  if (!stableSpectrum) return null;

  const operatorUI = core.slotOperator(liveOperation.operatorId);
  const isEditable = operatorUI?.isEditable ?? false;
  const isLiveEditable = operatorUI?.isLiveEditable ?? false;

  function closeProcessing() {
    dispatch({
      type: 'SELECT_PROCESSING_OPERATOR',
      payload: { operatorUI: undefined },
    });
  }

  return (
    <PluginTopBarToolContainer>
      <CoreOperatorTopBar
        core={core}
        id={liveOperation.operatorId}
        operation={liveOperation}
        spectrum={stableSpectrum}
        onChange={(liveOperation) => {
          liveOperation = setLiveOperation(liveOperation);

          if (!isLiveEditable) return;
          if (!liveEdit.value?.checked) return;

          void processingsMutations.applyLiveChange(
            liveOperation,
            liveEdit.value?.shouldProcessNext ?? false,
          );
        }}
        onSubmit={(operation) => {
          if (!isEditable) return;

          assertDefined(stableSpectrum?.processings);
          const operationIndex = stableSpectrum.processings.findIndex(
            (p) => p.uid === liveOperation.uid,
          );

          closeProcessing();
          void processingsMutations.apply(
            // onChange generally change settings
            // so options should be re-computed
            { ...operation, options: undefined },
            operationIndex,
          );
        }}
      >
        {(children) =>
          isEditable && (
            <>
              {children}
              <RSButton
                variant="minimal"
                intent="danger"
                onClick={closeProcessing}
                size="small"
              >
                Cancel
              </RSButton>
            </>
          )
        }
      </CoreOperatorTopBar>
    </PluginTopBarToolContainer>
  );
}
