import { SvgNmrSameTop, SvgNmrResetScale } from 'cheminfo-font';
import { ActiveSpectrum, Spectrum, Spectrum2D } from 'nmr-load-save';
import { memo, useCallback } from 'react';
import {
  FaCreativeCommonsSamplingPlus,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { Toolbar } from 'react-science/ui';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import { useActiveSpectra } from '../../hooks/useActiveSpectra';
import useSpectrum from '../../hooks/useSpectrum';
import { DisplayerMode } from '../../reducer/Reducer';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import DefaultPanelHeader, {
  createFilterLabel,
} from '../header/DefaultPanelHeader';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton';

function getMissingProjection(SpectrumsData, activeTab) {
  let nucleus = activeTab.split(',');
  nucleus = nucleus[0] === nucleus[1] ? [nucleus[0]] : nucleus;
  const missingNucleus: string[] = [];
  for (const n of nucleus) {
    const hasSpectrums = SpectrumsData.some((d) => d.info.nucleus === n);
    if (!hasSpectrums) {
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
  const modal = useModal();
  const alert = useAlert();
  const dispatch = useDispatch();

  const handleDelete = useCallback(() => {
    modal.showConfirmDialog({
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
          handler: () => {
            dispatch({ type: 'DELETE_SPECTRA', payload: {} });
          },
        },
        { text: 'No' },
      ],
    });
  }, [activeSpectra?.length, dispatch, modal]);

  function showAllSpectrumsHandler() {
    dispatch({
      type: 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS',
      payload: { nucleus: activeTab, flag: true },
    });
  }

  function hideAllSpectrumsHandler() {
    dispatch({
      type: 'CHANGE_SPECTRA_VISIBILITY_BY_NUCLEUS',
      payload: { nucleus: activeTab, flag: false },
    });
  }

  function addMissingProjectionHandler() {
    const missingNucleus = getMissingProjection(data, activeTab);
    if (missingNucleus.length > 0) {
      dispatch({
        type: 'ADD_MISSING_PROJECTION',
        payload: { nucleus: missingNucleus },
      });
    } else {
      alert.error('Nothing to calculate');
    }
  }

  function setSameTopHandler() {
    dispatch({ type: 'SET_SPECTRA_SAME_TOP' });
  }

  function resetScaleHandler() {
    dispatch({ type: 'RESET_SPECTRA_SCALE' });
  }

  function recolorSpectraHandler() {
    dispatch({
      type: 'RECOLOR_SPECTRA_COLOR',
      payload: {},
    });
  }
  const hasActiveSpectra = activeSpectra && activeSpectra?.length > 0;
  const spectraLengthPerTab = getSpectraByNucleus(activeTab, data)?.length;

  return (
    <DefaultPanelHeader
      onDelete={handleDelete}
      counter={data?.length}
      counterLabel={createFilterLabel(data?.length, spectraLengthPerTab)}
      deleteToolTip="Delete selected spectra"
      disableDelete={!hasActiveSpectra}
      showSettingButton
      onSettingClick={onSettingClick}
    >
      <Toolbar>
        <Toolbar.Item
          disabled={!hasActiveSpectra}
          icon={<FaEyeSlash />}
          title="Hide selected spectra"
          onClick={hideAllSpectrumsHandler}
        />
        <Toolbar.Item
          disabled={!hasActiveSpectra}
          icon={<FaEye />}
          title="Show selected spectra"
          onClick={showAllSpectrumsHandler}
        />
        {displayerMode === '2D' && activeSpectrum?.info.isFt && (
          <Toolbar.Item
            icon={<FaCreativeCommonsSamplingPlus />}
            title="Add missing projection"
            onClick={addMissingProjectionHandler}
          />
        )}
        {displayerMode === '1D' && spectraLengthPerTab > 1 && (
          <>
            <Toolbar.Item
              icon={<SvgNmrResetScale />}
              title="Reset scale"
              onClick={resetScaleHandler}
            />
            <Toolbar.Item
              icon={<SvgNmrSameTop />}
              title="Same top"
              onClick={setSameTopHandler}
            />
          </>
        )}
        <SpectraAutomaticPickingButton />

        <Toolbar.Item
          icon={<IoColorPaletteOutline />}
          title="Recolor spectra"
          onClick={recolorSpectraHandler}
        />
      </Toolbar>
    </DefaultPanelHeader>
  );
}

const MemoizedSpectraPanelHeader = memo(SpectraPanelHeaderInner);

export default function SpectrumsTabs({
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
