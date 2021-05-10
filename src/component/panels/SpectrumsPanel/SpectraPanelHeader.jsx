import { SvgNmrSameTop, SvgNmrResetScale } from 'cheminfo-font';
import { memo, useCallback } from 'react';
import {
  FaCreativeCommonsSamplingPlus,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import Button from '../../elements/ButtonToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import SpectraWrapper from '../../hoc/SpectraWrapper';
import { DISPLAYER_MODE } from '../../reducer/core/Constants';
import {
  ADD_MISSING_PROJECTION,
  CHANGE_VISIBILITY,
  DELETE_SPECTRA,
  RESET_SPECTRA_SCALE,
  SET_SPECTRA_SAME_TOP,
} from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

function SpectraPanelHeader({
  data,
  activeSpectrum,
  activeTab,
  displayerMode,
  spectrums,
}) {
  const modal = useModal();
  const alert = useAlert();
  const dispatch = useDispatch();

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

  const showAllSpectrumsHandler = useCallback(() => {
    const spectrumsPerTab = spectrums.map((datum) => {
      return datum.id;
    });
    dispatch({ type: CHANGE_VISIBILITY, id: spectrumsPerTab });
  }, [dispatch, spectrums]);

  const hideAllSpectrumsHandler = useCallback(() => {
    dispatch({ type: CHANGE_VISIBILITY, id: [] });
  }, [dispatch]);

  const addMissingProjectionHandler = useCallback(() => {
    function getMissingProjection(SpectrumsData) {
      let nucleus = activeTab.split(',');
      nucleus = nucleus[0] === nucleus[1] ? [nucleus[0]] : nucleus;
      const missingNucleus = [];
      for (const n of nucleus) {
        const hasSpectrums = SpectrumsData.some((d) => d.info.nucleus === n);
        if (!hasSpectrums) {
          missingNucleus.push(n);
        }
      }
      return missingNucleus;
    }
    const missingNucleus = getMissingProjection(data);
    if (missingNucleus.length > 0) {
      dispatch({ type: ADD_MISSING_PROJECTION, nucleus: missingNucleus });
    } else {
      alert.error('Nothing to calculate');
    }
  }, [activeTab, alert, data, dispatch]);

  const setSameTopHandler = useCallback(() => {
    dispatch({ type: SET_SPECTRA_SAME_TOP });
  }, [dispatch]);
  const resetScaleHandler = useCallback(() => {
    dispatch({ type: RESET_SPECTRA_SCALE });
  }, [dispatch]);

  return (
    <DefaultPanelHeader
      onDelete={handleDelete}
      counter={spectrums && spectrums.length}
      deleteToolTip="Delete all spectra"
    >
      <Button popupTitle="Hide all spectra" onClick={hideAllSpectrumsHandler}>
        <FaEyeSlash />
      </Button>
      <Button popupTitle="Show all spectra" onClick={showAllSpectrumsHandler}>
        <FaEye />
      </Button>
      {activeSpectrum && activeTab && activeTab.split(',').length > 1 && (
        <Button
          popupTitle="Add missing projection"
          onClick={addMissingProjectionHandler}
        >
          <FaCreativeCommonsSamplingPlus />
        </Button>
      )}
      {displayerMode === DISPLAYER_MODE.DM_1D && (
        <>
          <Button popupTitle="Reset Scale" onClick={resetScaleHandler}>
            <SvgNmrResetScale />
          </Button>
          <Button popupTitle="Same Top" onClick={setSameTopHandler}>
            <SvgNmrSameTop />
          </Button>
        </>
      )}
    </DefaultPanelHeader>
  );
}

export default SpectraWrapper(memo(SpectraPanelHeader));
