import { useCallback, useState, useRef, memo } from 'react';
import ReactCardFlip from 'react-card-flip';

import { useDispatch } from '../../context/DispatchContext';
import { useModal } from '../../elements/popup/Modal';
import { DELETE_PEAK_NOTATION } from '../../reducer/types/Types';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import PeaksPreferences from './PeaksPreferences';
import PeaksTable from './PeaksTable';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
};

const PeaksPanel = memo(() => {
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [peaksCounter, setPeaksCounter] = useState(0);

  const dispatch = useDispatch();
  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();
  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_PEAK_NOTATION, data: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted, Are You sure?', {
      onYes: yesHandler,
    });
  }, [modal, yesHandler]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);
  const peaksChangedHandler = useCallback((peaks) => {
    if (peaks) setPeaksCounter(peaks.length);
  }, []);

  return (
    <div style={styles.container}>
      {!isFlipped && (
        <DefaultPanelHeader
          counter={peaksCounter}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Peaks"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all peaks' : 'Hide peaks out of view'
          }
          filterIsActive={filterIsActive}
          counterFiltered={peaksCounter}
          showSettingButton="true"
          onSettingClick={settingsPanelHandler}
        />
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div style={{ height: '100%', overflow: 'auto' }}>
        <ReactCardFlip
          isFlipped={isFlipped}
          infinite={true}
          containerStyle={{ overflow: 'hidden' }}
        >
          <PeaksTable
            enableFilter={filterIsActive}
            onPeaksChange={peaksChangedHandler}
          />
          <PeaksPreferences ref={settingRef} />
        </ReactCardFlip>
      </div>
    </div>
  );
});

export default PeaksPanel;
