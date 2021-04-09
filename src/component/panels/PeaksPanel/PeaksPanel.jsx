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

function PeaksPanel() {
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
  const changedHandler = useCallback((val) => {
    setPeaksCounter(val);
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
      <div style={{ height: '100%', overflow: 'hidden' }}>
        <ReactCardFlip
          isFlipped={isFlipped}
          infinite
          containerStyle={{ overflow: 'hidden', height: '100%' }}
        >
          <div style={{ overflow: 'auto', height: '100%', display: 'block' }}>
            <PeaksTable
              enableFilter={filterIsActive}
              onFilter={changedHandler}
            />
          </div>

          <PeaksPreferences ref={settingRef} />
        </ReactCardFlip>
      </div>
    </div>
  );
}

export default memo(PeaksPanel);
