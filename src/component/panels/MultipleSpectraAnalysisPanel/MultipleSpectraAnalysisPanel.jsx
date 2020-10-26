import React, { useCallback, useState, useRef, memo } from 'react';
import ReactCardFlip from 'react-card-flip';

import { useDispatch } from '../../context/DispatchContext';
// import { useModal } from '../../elements/Modal';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import MultipleSpectraAnalysisTable from './MultipleSpectraAnalysisTable';

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
};

const MultipleSpectraAnalysisPanel = memo(() => {
  // const [filterIsActive, setFilterIsActive] = useState(false);
  //   const [peaksCounter, setPeaksCounter] = useState(0);
  // eslint-disable-next-line no-unused-vars
  const dispatch = useDispatch();
  // const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();

  // const yesHandler = useCallback(() => {
  //   // eslint-disable-next-line no-alert
  //   alert('delete all spectra ');
  //   // dispatch({ type: DELETE_PEAK_NOTATION, data: null });
  // }, []);

  // const handleDeleteAll = useCallback(() => {
  //   modal.showConfirmDialog('All records will be deleted, Are You sure?', {
  //     onYes: yesHandler,
  //   });
  // }, [modal, yesHandler]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    // settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  // const handleOnFilter = useCallback(() => {
  //   setFilterIsActive(!filterIsActive);
  // }, [filterIsActive]);
  //   const peaksChangedHandler = useCallback((peaks) => {
  //     if (peaks) setPeaksCounter(peaks.length);
  //   }, []);

  return (
    <div style={styles.container}>
      {!isFlipped && (
        <DefaultPanelHeader
          //   counter={peaksCounter}
          // onDelete={handleDeleteAll}
          deleteToolTip="Delete All Peaks"
          // onFilter={handleOnFilter}
          // filterToolTip={
          //   filterIsActive ? 'Show all peaks' : 'Hide peaks out of view'
          // }
          // filterIsActive={filterIsActive}
          //   counterFiltered={peaksCounter}
          showSettingButton="true"
          canDelete={false}
          onSettingClick={settingsPanelHandler}
        />
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}

      <ReactCardFlip
        isFlipped={isFlipped}
        infinite={true}
        containerStyle={{ height: '100%' }}
      >
        <div style={{ overflow: 'auto' }}>
          <MultipleSpectraAnalysisTable
          // enableFilter={filterIsActive}
          // onPeaksChange={peaksChangedHandler}
          />
        </div>
        <div ref={settingRef}>comming soon</div>
      </ReactCardFlip>
    </div>
  );
});

export default MultipleSpectraAnalysisPanel;
