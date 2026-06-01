import type { MaybeElement } from '@blueprintjs/core';
import type { IconName } from '@blueprintjs/icons';
import type {
  ActiveSpectrum,
  ExternalAPIKeyType,
  Spectrum2D,
  Spectrum,
} from '@zakodium/nmrium-core';
import { SvgNmrResetScale, SvgNmrSameTop } from 'cheminfo-font';
import { memo, useCallback } from 'react';
import { AiOutlineApi } from 'react-icons/ai';
import { FaCreativeCommonsSamplingPlus } from 'react-icons/fa';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { MdFormatColorFill, MdOutlineFormatColorText } from 'react-icons/md';

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/isSpectrum1D.ts';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { useAlert } from '../../elements/Alert.js';
import type { ToolbarPopoverMenuItem } from '../../elements/ToolbarPopoverItem.tsx';
import { ToolbarPopoverItem } from '../../elements/ToolbarPopoverItem.tsx';
import { useActiveSpectra } from '../../hooks/useActiveSpectra.js';
import { useSelectedSpectra } from '../../hooks/useSelectedSpectra.ts';
import useSpectrum from '../../hooks/useSpectrum.js';
import { useToggleSpectraVisibility } from '../../hooks/useToggleSpectraVisibility.js';
import type { DisplayerMode } from '../../reducer/Reducer.js';
import { booleanToString } from '../../utility/booleanToString.ts';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus.js';
import type { ToolbarItemProps } from '../header/DefaultPanelHeader.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton.js';

interface ItemContext {
  spectra: Spectrum[] | null;
  activeTab: string;
}

interface ExternalApiItem {
  icon: IconName | MaybeElement;
  include?: (item: ItemContext) => boolean;
  disable?: (item: ItemContext) => boolean;
  disableMessage?: string;
}

const EXTERNAL_API_DEFINITIONS: Record<ExternalAPIKeyType, ExternalApiItem> = {
  ct: {
    icon: <AiOutlineApi />,
    disable: ({ spectra, activeTab }) => {
      return activeTab === '1H' || spectra?.length === 0;
    },
    disableMessage:
      'CT can only be used when there is at least one proton (1H) spectrum selected',
  },

  mixonat: {
    icon: <AiOutlineApi />,
    disable: ({ spectra, activeTab }) => {
      return activeTab === '13C' || spectra?.length === 0;
    },
    disableMessage:
      'MixOnat can only be used when there is at least one carbon (13C) spectrum selected',
  },
};

interface ExternalMenuOptions {
  id: ExternalAPIKeyType;
  apiUrl: string;
  apiKey?: string;
}

function useExternalApiMenuItems(): Array<
  ToolbarPopoverMenuItem<ExternalMenuOptions>
> {
  const spectra = useSelectedSpectra();
  const {
    view: {
      spectra: { activeTab },
    },
  } = useChartData();
  const {
    current: { externalAPIs },
  } = usePreferences();

  return externalAPIs
    .filter(({ key }) => {
      const option = EXTERNAL_API_DEFINITIONS?.[key];
      return !option?.include || option.include({ spectra, activeTab });
    })
    .map((options) => {
      const { key, name, description, apiUrl, apkKey } = options;
      const { icon, disable, disableMessage } =
        EXTERNAL_API_DEFINITIONS?.[key] || {};
      const isDisabled = disable ? disable({ spectra, activeTab }) : false;
      return {
        icon,
        text: name,
        data: { id: key, apiUrl, apkKey },
        tooltip: {
          title: name,
          description: isDisabled ? disableMessage : description,
        },
        style: {
          cursor: isDisabled ? 'not-allowed' : undefined,
          opacity: isDisabled ? 0.5 : 1,
        },
        ...(isDisabled && { onClick: (e) => e.stopPropagation() }), // Disable onClick if the item is disabled
        tooltipProps: { intent: isDisabled ? 'danger' : undefined },
      };
    });
}
function getMissingProjection(spectraData: any, activeTab: any) {
  let nucleus = activeTab.split(',');
  nucleus = nucleus[0] === nucleus[1] ? [nucleus[0]] : nucleus;
  const missingNucleus: string[] = [];
  for (const n of nucleus) {
    const hasSpectra = spectraData.some((d: any) => d.info.nucleus === n);
    if (!hasSpectra) {
      missingNucleus.push(n);
    }
  }
  return missingNucleus;
}

function buildMixonatData(spectra: Spectrum[]) {
  const result = [];

  for (const spectrum of spectra) {
    if (!isSpectrum1D(spectrum)) continue;

    result.push({
      info: spectrum.info,
      peaks: spectrum.peaks.values.map(({ x, y }) => ({ x, y })),
    });
  }

  return { spectra: result };
}

interface SpectraPanelHeaderProps {
  onSettingClick: () => void;
}

interface SpectraPanelHeaderInnerProps extends SpectraPanelHeaderProps {
  data: Spectrum[];
  activeTab: string;
  activeSpectrum: Spectrum2D | null;
  activeSpectra: ActiveSpectrum[] | null;
  displayerMode: DisplayerMode;
}

function SpectraPanelHeaderInner({
  data,
  activeSpectrum,
  activeSpectra,
  activeTab,
  displayerMode,
  onSettingClick,
}: SpectraPanelHeaderInnerProps) {
  const alert = useAlert();
  const toaster = useToaster();
  const dispatch = useDispatch();
  const {
    current: { spectraColors, spectraLabel },
    dispatch: dispatchPreferences,
  } = usePreferences();

  const handleDelete = useCallback(() => {
    alert.showAlert({
      message: (
        <span>
          You are about to delete
          <span style={{ color: 'black' }}> {activeSpectra?.length} </span>
          spectra, Are you sure?
        </span>
      ),
      buttons: [
        {
          text: 'Yes',
          onClick: () => {
            dispatch({ type: 'DELETE_SPECTRA', payload: {} });
          },
          intent: 'danger',
        },
        { text: 'No' },
      ],
    });
  }, [activeSpectra?.length, alert, dispatch]);

  function addMissingProjectionHandler() {
    const missingNucleus = getMissingProjection(data, activeTab);
    if (missingNucleus.length > 0) {
      dispatch({
        type: 'ADD_MISSING_PROJECTION',
        payload: { nucleus: missingNucleus },
      });
    } else {
      toaster.show({ message: 'Nothing to calculate', intent: 'danger' });
    }
  }

  function setSameTopHandler() {
    dispatch({ type: 'SET_SPECTRA_SAME_TOP' });
  }

  function resetScaleHandler() {
    dispatch({ type: 'RESET_SPECTRA_SCALE' });
  }

  function defaultReColorSpectraHandler() {
    dispatch({
      type: 'RECOLOR_SPECTRA_COLOR',
      payload: { customColors: spectraColors },
    });
  }
  function distinctReColorSpectraHandler() {
    dispatch({
      type: 'RECOLOR_SPECTRA_COLOR',
      payload: {},
    });
  }

  function toggleSpectraLabelHandler() {
    dispatchPreferences({
      type: 'TOGGLE_SPECTRA_LABEL',
      payload: {},
    });
  }

  const hasActiveSpectra = activeSpectra && activeSpectra?.length > 0;
  const spectraLengthPerTab = getSpectraByNucleus(activeTab, data)?.length;
  const { getToggleVisibilityButtons } = useToggleSpectraVisibility(
    spectraLengthPerTab < 3
      ? {
          enableHideSelected: false,
          enableShowSelected: false,
          enableShowSelectedOnly: false,
        }
      : {},
  );

  const externalApiMenuItems = useExternalApiMenuItems();
  const spectra = useSelectedSpectra();

  function handleSendToMixonat(options: ExternalMenuOptions) {
    const { apiUrl: url } = options;

    if (!spectra) return;

    if (!url) {
      toaster.show({
        message: 'MixOnat URL is not configured',
        intent: 'danger',
      });
      return;
    }

    setTimeout(async () => {
      const hideLoading = await toaster.showAsyncLoading({
        message: 'Sending spectra to Mixonat...',
      });

      try {
        const body = buildMixonatData(spectra);

        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });

        if (!response.ok) {
          throw new Error(
            `Failed to submit the selected spectra to MixOnat (HTTP ${response.status}).`,
          );
        }

        const result = await response.json();
        // eslint-disable-next-line no-console
        console.log('MixOnat response:', result);
        toaster.show({
          message: 'Spectra successfully sent to MixOnat',
          intent: 'success',
        });
      } catch (error) {
        toaster.show({
          message: `MixOnat error: ${error instanceof Error ? error.message : 'Unknown error'}`,
          intent: 'danger',
        });
      } finally {
        hideLoading();
      }
    }, 0);
  }

  function handleServiceClick(selected?: ExternalMenuOptions) {
    if (!selected) return;

    const { id } = selected;

    if (id === 'ct') {
      return;
    }

    if (id === 'mixonat') {
      return handleSendToMixonat(selected);
    }
  }

  let leftButtons: ToolbarItemProps[] =
    getToggleVisibilityButtons(!hasActiveSpectra);

  if (displayerMode === '2D' && activeSpectrum?.info.isFt) {
    leftButtons.push({
      icon: <FaCreativeCommonsSamplingPlus />,
      tooltip: 'Add missing projection',
      onClick: addMissingProjectionHandler,
    });
  }

  if (displayerMode === '1D' && spectraLengthPerTab > 1) {
    leftButtons.push(
      {
        icon: <SvgNmrResetScale />,
        tooltip: 'Reset scale',
        onClick: resetScaleHandler,
      },
      {
        icon: <SvgNmrSameTop />,
        tooltip: 'Same top',
        onClick: setSameTopHandler,
      },
    );
  }

  leftButtons = leftButtons.concat([
    {
      component: <SpectraAutomaticPickingButton />,
    },
    {
      icon: <IoColorPaletteOutline />,
      tooltip: 'Default spectra recoloring',
      onClick: defaultReColorSpectraHandler,
    },
    {
      icon: <MdFormatColorFill />,
      tooltip: 'Distinct spectra recoloring',
      onClick: distinctReColorSpectraHandler,
    },
    {
      icon: <MdOutlineFormatColorText />,
      tooltip: `${booleanToString(!spectraLabel.visible)} spectra label`,
      active: spectraLabel.visible,
      onClick: toggleSpectraLabelHandler,
    },
    {
      component: (
        <ToolbarPopoverItem
          options={externalApiMenuItems}
          onClick={handleServiceClick}
          icon="more"
          id="trigger-external-service"
        />
      ),
    },
  ]);

  return (
    <DefaultPanelHeader
      onDelete={handleDelete}
      total={data?.length}
      counter={spectraLengthPerTab}
      deleteToolTip="Delete selected spectra"
      disableDelete={!hasActiveSpectra}
      onSettingClick={onSettingClick}
      leftButtons={leftButtons}
    />
  );
}

const MemoizedSpectraPanelHeader = memo(SpectraPanelHeaderInner);

export default function SpectraTabs({
  onSettingClick,
}: SpectraPanelHeaderProps) {
  const {
    data,
    view: {
      spectra: { activeTab },
    },
    displayerMode,
  } = useChartData();
  const spectrum = useSpectrum() as Spectrum2D;
  const activeSpectra = useActiveSpectra();

  return (
    <MemoizedSpectraPanelHeader
      {...{
        data,
        activeSpectrum: spectrum,
        activeSpectra,
        activeTab,
        displayerMode,
        onSettingClick,
      }}
    />
  );
}
