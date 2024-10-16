import { SvgNmrResetScale, SvgNmrSameTop } from 'cheminfo-font';
import { ActiveSpectrum, Spectrum, Spectrum2D } from 'nmr-load-save';
import { memo, useCallback } from 'react';
import { FaCreativeCommonsSamplingPlus } from 'react-icons/fa';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { MdFormatColorFill } from 'react-icons/md';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { usePreferences } from '../../context/PreferencesContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import { useAlert } from '../../elements/Alert.js';
import { useActiveSpectra } from '../../hooks/useActiveSpectra.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { useToggleSpectraVisibility } from '../../hooks/useToggleSpectraVisibility.js';
import { DisplayerMode } from '../../reducer/Reducer.js';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus.js';
import DefaultPanelHeader, {
  ToolbarItemProps,
} from '../header/DefaultPanelHeader.js';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton.js';

function getMissingProjection(spectraData, activeTab) {
  let nucleus = activeTab.split(',');
  nucleus = nucleus[0] === nucleus[1] ? [nucleus[0]] : nucleus;
  const missingNucleus: string[] = [];
  for (const n of nucleus) {
    const hasSpectra = spectraData.some((d) => d.info.nucleus === n);
    if (!hasSpectra) {
      missingNucleus.push(n);
    }
  }
  return missingNucleus;
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
    current: { spectraColors },
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
  const hasActiveSpectra = activeSpectra && activeSpectra?.length > 0;
  const spectraLengthPerTab = getSpectraByNucleus(activeTab, data)?.length;
  const { getToggleVisibilityButtons } = useToggleSpectraVisibility(
    spectraLengthPerTab < 5
      ? {
          enableHideSelected: false,
          enableShowSelected: false,
          enableShowSelectedOnly: false,
        }
      : {},
  );

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
