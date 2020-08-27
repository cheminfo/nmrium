import React, { useCallback, memo, useState } from 'react';
import { useAlert } from 'react-alert';
import {
  FaEye,
  FaEyeSlash,
  FaCreativeCommonsSamplingPlus,
} from 'react-icons/fa';

import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useModal } from '../../elements/Modal';
import ToolTip from '../../elements/ToolTip/ToolTip';
import ConnectToContext from '../../hoc/ConnectToContext';
import {
  CHANGE_VISIBILITY,
  DELETE_SPECTRA,
  ADD_MISSING_PROJECTION,
} from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';

import SpectrumsTabs from './SpectrumsTabs';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const SpectrumListPanel = memo(
  ({ data, activeSpectrum, activeTab: activeTabState }) => {
    const [spectrums, setSpectrums] = useState([]);

    const modal = useModal();
    const alert = useAlert();
    const dispatch = useDispatch();

    const tabChangeHandler = useCallback((e) => {
      setSpectrums(e.data ? e.data : []);
    }, []);

    const handleDelete = useCallback(() => {
      if (activeSpectrum) {
        // setActivated(null);
        dispatch({ type: DELETE_SPECTRA });
      } else {
        modal.showConfirmDialog('All records will be deleted,Are You sure?', {
          onYes: () => {
            dispatch({ type: DELETE_SPECTRA });
          },
        });
      }
    }, [activeSpectrum, dispatch, modal]);

    const showAllSpectrumsHandler = useCallback(() => {
      const spectrumsPerTab = spectrums.map((datum) => {
        return datum.id;
      });
      dispatch({ type: CHANGE_VISIBILITY, id: spectrumsPerTab });
      // setVisible(spectrumsPerTab);
    }, [dispatch, spectrums]);

    const hideAllSpectrumsHandler = useCallback(() => {
      dispatch({ type: CHANGE_VISIBILITY, id: [] });
      // setVisible([]);
    }, [dispatch]);

    const addMissingProjectionHandler = useCallback(() => {
      function getMissingProjection(SpectrumsData) {
        let nucleus = activeTabState.split(',');
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
    }, [activeTabState, alert, data, dispatch]);

    return (
      <div style={styles.container}>
        <div style={{ overflow: 'auto' }}>
          <DefaultPanelHeader
            onDelete={handleDelete}
            counter={spectrums && spectrums.length}
            deleteToolTip="Delete all spectra"
          >
            <ToolTip title="Hide all spectra" popupPlacement="right">
              <button
                style={styles.button}
                type="button"
                onClick={hideAllSpectrumsHandler}
              >
                <FaEyeSlash />
              </button>
            </ToolTip>
            <ToolTip title="Show all spectra" popupPlacement="right">
              <button
                style={styles.button}
                type="button"
                onClick={showAllSpectrumsHandler}
              >
                <FaEye />
              </button>
            </ToolTip>
            {activeSpectrum &&
              activeTabState &&
              activeTabState.split(',').length > 1 && (
                <ToolTip title="Add missing projection" popupPlacement="right">
                  <button
                    style={styles.button}
                    type="button"
                    onClick={addMissingProjectionHandler}
                  >
                    <FaCreativeCommonsSamplingPlus />
                  </button>
                </ToolTip>
              )}
          </DefaultPanelHeader>
          <SpectrumsTabs onTabChange={tabChangeHandler} />
        </div>
      </div>
    );
  },
);

export default ConnectToContext(SpectrumListPanel, useChartData);
