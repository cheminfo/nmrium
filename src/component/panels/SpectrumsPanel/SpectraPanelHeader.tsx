import { SvgNmrSameTop, SvgNmrResetScale } from 'cheminfo-font';
import { memo, useCallback } from 'react';
import {
  FaCreativeCommonsSamplingPlus,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/ButtonToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import useSpectrum from '../../hooks/useSpectrum';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import {
  ADD_MISSING_PROJECTION,
  CHANGE_VISIBILITY,
  DELETE_SPECTRA,
  RESET_SPECTRA_SCALE,
  SET_SPECTRA_SAME_TOP,
} from '../../reducer/types/Types';
import { getSpectraByNucleus } from '../../utility/getSpectraByNucleus';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import { SpectraAutomaticPickingButton } from '../header/SpectraAutomaticPickingButton';

function getMissingProjection(SpectrumsData, activeTab) {
  let nucleus = activeTab.split(',');
  nucleus = nucleus[0] === nucleus[1] ? [nucleus[0]] : nucleus;
  const missingNucleus: Array<string> = [];
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
  data: Array<Datum1D | Datum2D>;
  activeTab: string;
  activeSpectrum: Datum2D | null;
  displayerMode: string;
}

function SpectraPanelHeaderInner({
  data,
  activeSpectrum,
  activeTab,
  displayerMode,
  onSettingClick,
}: SpectraPanelHeaderInnerProps) {
  const modal = useModal();
  const alert = useAlert();
  const dispatch = useDispatch();

  const spectra = getSpectraByNucleus(activeTab, data);

  const handleDelete = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All records will be deleted, Are You sure?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            dispatch({ type: DELETE_SPECTRA });
          },
        },
        { text: 'No' },
      ],
    });
  }, [dispatch, modal]);

  function showAllSpectrumsHandler() {
    dispatch({
      type: CHANGE_VISIBILITY,
      payload: { nucleus: activeTab, flag: true },
    });
  }

  function hideAllSpectrumsHandler() {
    dispatch({
      type: CHANGE_VISIBILITY,
      payload: { nucleus: activeTab, flag: false },
    });
  }

  function addMissingProjectionHandler() {
    const missingNucleus = getMissingProjection(data, activeTab);
    if (missingNucleus.length > 0) {
      dispatch({ type: ADD_MISSING_PROJECTION, nucleus: missingNucleus });
    } else {
      alert.error('Nothing to calculate');
    }
  }

  function setSameTopHandler() {
    dispatch({ type: SET_SPECTRA_SAME_TOP });
  }

  function resetScaleHandler() {
    dispatch({ type: RESET_SPECTRA_SCALE });
  }

  return (
    <DefaultPanelHeader
      onDelete={handleDelete}
      counter={spectra?.length}
      deleteToolTip="Delete all spectra"
      showSettingButton
      onSettingClick={onSettingClick}
    >
      <Button popupTitle="Hide all spectra" onClick={hideAllSpectrumsHandler}>
        <FaEyeSlash />
      </Button>
      <Button popupTitle="Show all spectra" onClick={showAllSpectrumsHandler}>
        <FaEye />
      </Button>
      {displayerMode === DISPLAYER_MODE.DM_2D && activeSpectrum?.info.isFt && (
        <Button
          popupTitle="Add missing projection"
          onClick={addMissingProjectionHandler}
        >
          <FaCreativeCommonsSamplingPlus />
        </Button>
      )}
      {displayerMode === DISPLAYER_MODE.DM_1D && spectra.length > 1 && (
        <>
          <Button popupTitle="Reset Scale" onClick={resetScaleHandler}>
            <SvgNmrResetScale />
          </Button>
          <Button popupTitle="Same Top" onClick={setSameTopHandler}>
            <SvgNmrSameTop />
          </Button>
        </>
      )}
      <SpectraAutomaticPickingButton />
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
  const spectrum = useSpectrum() as Datum2D;
  return (
    <MemoizedSpectraPanelHeader
      {...{
        data,
        activeSpectrum: spectrum,
        activeTab,
        displayerMode,
        onSettingClick,
      }}
    />
  );
}
