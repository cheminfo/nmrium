import { SvgNmrSameTop, SvgNmrResetScale } from 'cheminfo-font';
import React, { memo, useCallback } from 'react';
import {
  FaCreativeCommonsSamplingPlus,
  FaEye,
  FaEyeSlash,
} from 'react-icons/fa';

import { useDispatch } from '../../context/DispatchContext';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useAlert } from '../../elements/popup/Alert';
import { useModal } from '../../elements/popup/Modal';
import SpectraWraper from '../../hoc/SpectraWraper';
import {
  ADD_MISSING_PROJECTION,
  CHANGE_VISIBILITY,
  DELETE_SPECTRA,
  RESET_SPECTRA_SCALE,
  SET_SPECTRA_SAME_TOP,
} from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

function SpectraPanelHeader({ data, activeSpectrum, activeTab, spectrums }) {
  const modal = useModal();
  const alert = useAlert();
  const dispatch = useDispatch();

  const handleDelete = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted, Are You sure?', {
      onYes: () => {
        dispatch({ type: DELETE_SPECTRA });
      },
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
      <ToolTip title="Hide all spectra" popupPlacement="right">
        <button type="button" onClick={hideAllSpectrumsHandler}>
          <FaEyeSlash />
        </button>
      </ToolTip>
      <ToolTip title="Show all spectra" popupPlacement="right">
        <button type="button" onClick={showAllSpectrumsHandler}>
          <FaEye />
        </button>
      </ToolTip>
      {activeSpectrum && activeTab && activeTab.split(',').length > 1 && (
        <ToolTip title="Add missing projection" popupPlacement="right">
          <button type="button" onClick={addMissingProjectionHandler}>
            <FaCreativeCommonsSamplingPlus />
          </button>
        </ToolTip>
      )}
      <ToolTip title="Reset Scale" popupPlacement="right">
        <button type="button" onClick={resetScaleHandler}>
          <SvgNmrResetScale />
        </button>
      </ToolTip>
      <ToolTip title="Same Top" popupPlacement="right">
        <button type="button" onClick={setSameTopHandler}>
          <SvgNmrSameTop />
        </button>
      </ToolTip>
    </DefaultPanelHeader>
  );
}

export default SpectraWraper(memo(SpectraPanelHeader));
