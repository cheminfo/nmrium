import {
  useCallback,
  useMemo,
  useState,
  useRef,
  memo,
  CSSProperties,
} from 'react';
import ReactCardFlip from 'react-card-flip';

import { useDispatch } from '../../context/DispatchContext';
import { useModal } from '../../elements/popup/Modal';
import PeaksWrapper from '../../hoc/PeaksWrapper';
import { DELETE_PEAK_NOTATION } from '../../reducer/types/Types';
import { useFormatNumberByNucleus } from '../../utility/FormatNumber';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import PeaksPreferences from './PeaksPreferences';
import PeaksTable from './PeaksTable';

const styles: Record<'container', CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
};

interface PeaksPanelProps {
  peaks: any;
  xDomain: any;
  activeTab: string;
  preferences: any;
  info: {
    nucleus: string;
    originFrequency: number;
  };
}

function PeaksPanel({
  peaks,
  info,
  xDomain,
  activeTab,
  preferences,
}: PeaksPanelProps) {
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [isFlipped, setFlipStatus] = useState(false);
  const format = useFormatNumberByNucleus(info.nucleus);

  const dispatch = useDispatch();
  const modal = useModal();

  const settingRef = useRef<any>();

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_PEAK_NOTATION, data: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All records will be deleted, Are You sure?',
      buttons: [{ text: 'Yes', handler: yesHandler }, { text: 'No' }],
    });
  }, [modal, yesHandler]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
    if (!isFlipped) {
      settingRef.current.cancelSetting();
    }
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const filteredPeaks = useMemo(() => {
    function isInRange(value) {
      const factor = 100000;
      return (
        value * factor >= xDomain[0] * factor &&
        value * factor <= xDomain[1] * factor
      );
    }
    if (peaks?.values) {
      const _peaks = filterIsActive
        ? peaks.values.filter((peak) => isInRange(peak.delta))
        : peaks.values;

      return _peaks
        .map((peak) => {
          const value = format(peak.delta);
          return {
            value: value,
            valueHz: info?.originFrequency
              ? Number(value) * info.originFrequency
              : '',
            id: peak.id,
            intensity: peak.intensity,
            peakWidth: peak.width ? peak.width : '',
            isConstantlyHighlighted: isInRange(value),
          };
        })
        .sort((prev, next) => prev.value - next.value);
    }

    return [];
  }, [filterIsActive, format, info, peaks, xDomain]);

  return (
    <div style={styles.container}>
      {!isFlipped && (
        <DefaultPanelHeader
          counter={peaks.values?.length}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Peaks"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all peaks' : 'Hide peaks out of view'
          }
          filterIsActive={filterIsActive}
          counterFiltered={filteredPeaks.length}
          showSettingButton
          onSettingClick={settingsPanelHandler}
        />
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <ReactCardFlip
          isFlipped={isFlipped}
          infinite
          containerStyle={{ overflow: 'hidden', height: '100%' }}
        >
          <div style={{ overflow: 'auto', height: '100%', display: 'block' }}>
            <PeaksTable
              data={filteredPeaks}
              activeTab={activeTab}
              preferences={preferences}
              info={info}
            />
          </div>

          <PeaksPreferences ref={settingRef} />
        </ReactCardFlip>
      </div>
    </div>
  );
}

export default PeaksWrapper(memo(PeaksPanel));
