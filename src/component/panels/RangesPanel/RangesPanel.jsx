import lodash from 'lodash';
import { xGetFromToIndex } from 'ml-spectra-processing';
import React, {
  useCallback,
  useMemo,
  memo,
  useState,
  useRef,
  useEffect,
} from 'react';
import { useAlert } from 'react-alert';
import ReactCardFlip from 'react-card-flip';
import { FaFileExport, FaUnlink, FaSitemap } from 'react-icons/fa';
import { getACS } from 'spectra-data-ranges';

import { useAssignmentData } from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import { useModal, positions, transitions } from '../../elements/Modal';
import ToolTip from '../../elements/ToolTip/ToolTip';
import ContextWrapper from '../../hoc/ContextWrapper';
import ChangeSumModal from '../../modal/ChangeSumModal';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import EditRangeModal from '../../modal/editRange/EditRangeModal';
import {
  DELETE_RANGE,
  CHANGE_RANGE_DATA,
  CHANGE_RANGE_SUM,
  SET_X_DOMAIN,
  SET_SHOW_MULTIPLICITY_TREES,
  RESET_SELECTED_TOOL,
} from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/Export';
import { HighlightSignalConcatenation } from '../extra/constants/ConcatenationStrings';
import NoTableData from '../extra/placeholder/NoTableData';
import { rangeDefaultValues } from '../extra/preferences/defaultValues';
import { addDefaultSignal, unlink } from '../extra/utilities/RangeUtilities';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import RangesPreferences from './RangesPreferences';
import RangesTable from './RangesTable';

const styles = {
  toolbar: {
    display: 'flex',
    flexDirection: 'row',
    borderBottom: '0.55px solid rgb(240, 240, 240)',
  },
  sumButton: {
    borderRadius: '5px',
    marginTop: '3px',
    color: 'white',
    backgroundColor: '#6d6d6d',
    border: 'none',
    height: '16px',
    width: '18px',
    fontSize: '12px',
    padding: 0,
  },
  removeAssignmentsButton: {
    borderRadius: '5px',
    marginTop: '3px',
    marginLeft: '2px',
    border: 'none',
    height: '16px',
    width: '18px',
    fontSize: '12px',
    padding: 0,
  },
  setShowMultiplicityTreesButton: {
    borderRadius: '5px',
    marginTop: '3px',
    marginLeft: '5px',
    color: 'black',
    backgroundColor: 'transparent',
    border: 'none',
    height: '16px',
    width: '18px',
    fontSize: '12px',
    padding: 0,
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const RangesTablePanel = memo(
  ({
    data: spectraData,
    xDomain,
    preferences,
    activeTab,
    molecules,
    showMultiplicityTrees,
  }) => {
    const [filterIsActive, setFilterIsActive] = useState(false);
    const [rangesCounter, setRangesCounter] = useState(0);

    const assignmentData = useAssignmentData();

    const dispatch = useDispatch();
    const modal = useModal();
    const alert = useAlert();
    const [isFlipped, setFlipStatus] = useState(false);
    const [isTableVisible, setTableVisibility] = useState(true);
    const settingRef = useRef();

    // const spectrumData = useMemo(() => {
    //   return activeSpectrum && spectraData
    //     ? spectraData[activeSpectrum.index]
    //     : null;
    // }, [spectraData, activeSpectrum]);

    const data = useMemo(() => {
      if (spectraData && spectraData.ranges && spectraData.ranges.values) {
        setRangesCounter(spectraData.ranges.values.length);
        return spectraData.ranges.values;
      }
      setRangesCounter(0);
      return [];
    }, [spectraData]);

    const tableData = useMemo(() => {
      const isInView = (from, to) => {
        const factor = 10000;
        to = to * factor;
        from = from * factor;
        return (
          (to >= xDomain[0] * factor && from <= xDomain[1] * factor) ||
          (from <= xDomain[0] * factor && to >= xDomain[1] * factor)
        );
      };

      const getFilteredRanges = (ranges) => {
        return ranges.filter((range) => isInView(range.from, range.to));
      };

      const ranges = filterIsActive ? getFilteredRanges(data) : data;

      return ranges.map((range) => {
        return {
          ...range,
          tableMetaInfo: {
            isConstantlyHighlighted: isInView(range.from, range.to),
          },
        };
      });
    }, [data, filterIsActive, xDomain]);

    const changeRangeSignalKindHandler = useCallback(
      (value, range, signalIndex) => {
        const _range = { ...range };
        if (signalIndex !== undefined) {
          _range.signal[signalIndex].kind = value;
          dispatch({
            type: CHANGE_RANGE_DATA,
            data: _range,
          });
        }
      },
      [dispatch],
    );

    const unlinkRangeHandler = useCallback(
      (range, isOnRangeLevel, signalIndex) => {
        // remove assignments in assignment hook data
        if (isOnRangeLevel === true) {
          assignmentData.dispatch({
            type: 'REMOVE_ALL',
            payload: { id: range.id, axis: 'x' },
          });
        } else if (signalIndex !== undefined) {
          assignmentData.dispatch({
            type: 'REMOVE_ALL',
            payload: {
              id: `${range.id}${HighlightSignalConcatenation}${signalIndex}`,
              axis: 'x',
            },
          });
        } else if (isOnRangeLevel === undefined && signalIndex === undefined) {
          assignmentData.dispatch({
            type: 'REMOVE_ALL',
            payload: { id: range.id, axis: 'x' },
          });
          range.signal.forEach((_signal, i) =>
            assignmentData.dispatch({
              type: 'REMOVE_ALL',
              payload: {
                id: `${range.id}${HighlightSignalConcatenation}${i}`,
                axis: 'x',
              },
            }),
          );
        }

        // remove assignments in global state
        unlink(range, isOnRangeLevel, signalIndex);
        dispatch({ type: CHANGE_RANGE_DATA, data: range });
      },
      [assignmentData, dispatch],
    );

    const zoomRangeHandler = useCallback(
      (range) => {
        const margin = Math.abs(range.from - range.to) / 2;
        dispatch({
          type: SET_X_DOMAIN,
          xDomain: [range.from - margin, range.to + margin],
        });
      },
      [dispatch],
    );

    const saveEditRangeHandler = useCallback(
      (editedRange) => {
        // for now: clear all assignments for this range because signals or levels to store might have changed
        unlinkRangeHandler(editedRange);
        // if all signals were deleted then insert a default signal with "m" as multiplicity
        if (editedRange.signal.length === 0) {
          addDefaultSignal(editedRange);
          alert.info(
            `There must be at least one signal within a range. Default signal with "m" was therefore added!`,
          );
        }
        dispatch({
          type: CHANGE_RANGE_DATA,
          data: editedRange,
        });
      },
      [alert, dispatch, unlinkRangeHandler],
    );

    const closeEditRangeHandler = useCallback(() => {
      modal.close();
    }, [modal]);

    const openEditRangeHandler = useCallback(
      (rangeData) => {
        dispatch({ type: RESET_SELECTED_TOOL });
        modal.show(
          <EditRangeModal
            onClose={closeEditRangeHandler}
            onSave={saveEditRangeHandler}
            onZoom={zoomRangeHandler}
            rangeID={rangeData.id}
          />,
          {
            position: positions.CENTER_RIGHT,
            transition: transitions.SCALE,
            isBackgroundBlur: false,
          },
        );
      },
      [
        closeEditRangeHandler,
        dispatch,
        modal,
        saveEditRangeHandler,
        zoomRangeHandler,
      ],
    );

    const deleteRangeHandler = useCallback(
      (range) => {
        unlinkRangeHandler(range);
        dispatch({
          type: DELETE_RANGE,
          rangeID: range.id,
        });
      },
      [dispatch, unlinkRangeHandler],
    );

    const saveToClipboardHandler = useCallback(
      (value) => {
        const success = copyTextToClipboard(value);
        if (success) {
          alert.success('Data copied to clipboard');
        } else {
          alert.error('copy to clipboard failed');
        }
      },
      [alert],
    );
    const saveJSONToClipboardHandler = useCallback(
      (value) => {
        if (spectraData) {
          const { from, to } = value;
          const { fromIndex, toIndex } = xGetFromToIndex(spectraData.x, {
            from,
            to,
          });

          const dataToClipboard = {
            x: spectraData.x.slice(fromIndex, toIndex),
            y: spectraData.y.slice(fromIndex, toIndex),
            ...value,
          };

          const success = copyTextToClipboard(
            JSON.stringify(dataToClipboard, undefined, 2),
          );

          if (success) {
            alert.show('Data copied to clipboard');
          } else {
            alert.error('copy to clipboard failed');
          }
        }
      },
      [spectraData, alert],
    );

    const closeClipBoardHandler = useCallback(() => {
      modal.close();
    }, [modal]);

    const saveAsHTMLHandler = useCallback(() => {
      const result = getACS(data);
      modal.show(
        <CopyClipboardModal
          text={result}
          onCopyClick={saveToClipboardHandler}
          onClose={closeClipBoardHandler}
        />,
        {},
      );
    }, [closeClipBoardHandler, data, modal, saveToClipboardHandler]);

    const rangesPreferences = useMemo(() => {
      const _preferences =
        lodash.get(preferences, `panels.ranges.[${activeTab}]`) ||
        rangeDefaultValues;

      return _preferences;
    }, [activeTab, preferences]);

    const contextMenu = [
      {
        label: 'Copy to clipboard',
        onClick: saveJSONToClipboardHandler,
      },
    ];

    const changeRangesSumHandler = useCallback(
      (value) => {
        if (value !== undefined) {
          dispatch({ type: CHANGE_RANGE_SUM, value });
        }

        modal.close();
      },
      [dispatch, modal],
    );

    const currentSum = useMemo(() => {
      return spectraData &&
        spectraData.ranges &&
        spectraData.ranges.options &&
        spectraData.ranges.options.sum !== undefined
        ? spectraData.ranges.options.sum
        : null;
    }, [spectraData]);

    const showChangeRangesSumModal = useCallback(() => {
      modal.show(
        <ChangeSumModal
          onClose={() => modal.close()}
          onSave={changeRangesSumHandler}
          header={`Set new Ranges Sum (Current: ${currentSum})`}
          molecules={molecules}
          element={activeTab ? activeTab.replace(/[0-9]/g, '') : null}
        />,
      );
    }, [activeTab, changeRangesSumHandler, currentSum, modal, molecules]);

    const removeAssignments = useCallback(() => {
      data.forEach((range) => unlinkRangeHandler(range));
    }, [data, unlinkRangeHandler]);

    const handleOnRemoveAssignments = useCallback(() => {
      modal.showConfirmDialog(
        'All assignments will be removed. Are you sure?',
        {
          onYes: removeAssignments,
        },
      );
    }, [removeAssignments, modal]);

    const handleDeleteAll = useCallback(() => {
      modal.showConfirmDialog('All ranges will be deleted. Are You sure?', {
        onYes: () => {
          removeAssignments();
          dispatch({ type: DELETE_RANGE });
        },
      });
    }, [dispatch, modal, removeAssignments]);

    const handleSetShowMultiplicityTrees = useCallback(() => {
      dispatch({
        type: SET_SHOW_MULTIPLICITY_TREES,
        show:
          showMultiplicityTrees !== undefined ? !showMultiplicityTrees : false,
      });
    }, [dispatch, showMultiplicityTrees]);

    useEffect(() => {
      if (showMultiplicityTrees === undefined) {
        handleSetShowMultiplicityTrees();
      }
    }, [handleSetShowMultiplicityTrees, showMultiplicityTrees]);

    const handleOnFilter = useCallback(() => {
      setFilterIsActive(!filterIsActive);
    }, [filterIsActive]);

    const settingsPanelHandler = useCallback(() => {
      setFlipStatus(!isFlipped);
      if (!isFlipped) {
        setTimeout(
          () => {
            setTableVisibility(false);
          },
          400,
          isFlipped,
        );
      } else {
        setTableVisibility(true);
      }
    }, [isFlipped]);

    const saveSettingHandler = useCallback(() => {
      settingRef.current.saveSetting();
      setFlipStatus(false);
      setTableVisibility(true);
    }, []);

    return (
      <>
        <div style={styles.container}>
          {!isFlipped && (
            <DefaultPanelHeader
              counter={rangesCounter}
              onDelete={handleDeleteAll}
              deleteToolTip="Delete All Ranges"
              onFilter={handleOnFilter}
              filterToolTip={
                filterIsActive ? 'Show all ranges' : 'Hide ranges out of view'
              }
              filterIsActive={filterIsActive}
              counterFiltered={tableData && tableData.length}
              showSettingButton="true"
              onSettingClick={settingsPanelHandler}
            >
              <ToolTip
                title="Preview publication string"
                popupPlacement="right"
              >
                <button
                  style={styles.button}
                  type="button"
                  onClick={saveAsHTMLHandler}
                >
                  <FaFileExport />
                </button>
              </ToolTip>
              <ToolTip
                title={`Change Ranges Sum (${currentSum})`}
                popupPlacement="right"
              >
                <button
                  style={styles.sumButton}
                  type="button"
                  onClick={showChangeRangesSumModal}
                >
                  Σ
                </button>
              </ToolTip>
              <ToolTip title={`Remove all Assignments`} popupPlacement="right">
                <button
                  style={styles.removeAssignmentsButton}
                  type="button"
                  onClick={handleOnRemoveAssignments}
                  disabled={!data || data.length === 0}
                >
                  <FaUnlink />
                </button>
              </ToolTip>
              <ToolTip
                title={
                  showMultiplicityTrees
                    ? 'Hide Multiplicity Trees in Spectrum'
                    : 'Show Multiplicity Trees in Spectrum'
                }
                popupPlacement="right"
              >
                <button
                  style={
                    showMultiplicityTrees && showMultiplicityTrees === true
                      ? {
                          ...styles.setShowMultiplicityTreesButton,
                          backgroundColor: '#6d6d6d',
                          color: 'white',
                          fontSize: '10px',
                        }
                      : styles.setShowMultiplicityTreesButton
                  }
                  type="button"
                  onClick={handleSetShowMultiplicityTrees}
                  disabled={!data || data.length === 0}
                >
                  <FaSitemap />
                </button>
              </ToolTip>
            </DefaultPanelHeader>
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
            <div style={!isTableVisible ? { display: 'none' } : {}}>
              {tableData && tableData.length > 0 ? (
                <RangesTable
                  tableData={tableData}
                  onChangeKind={changeRangeSignalKindHandler}
                  onDelete={deleteRangeHandler}
                  onZoom={zoomRangeHandler}
                  onEdit={openEditRangeHandler}
                  onUnlink={unlinkRangeHandler}
                  context={contextMenu}
                  preferences={rangesPreferences}
                  element={activeTab && activeTab.replace(/[0-9]/g, '')}
                />
              ) : (
                <NoTableData />
              )}
            </div>
            <RangesPreferences data={spectraData} ref={settingRef} />
          </ReactCardFlip>
        </div>
      </>
    );
  },
);

export default ContextWrapper(RangesTablePanel, 'ranges', 'x', 'y');
