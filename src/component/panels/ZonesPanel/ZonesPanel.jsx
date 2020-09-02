import lodash from 'lodash';
import { xGetFromToIndex } from 'ml-spectra-processing';
import React, { useState, useMemo, useCallback, useRef, memo } from 'react';
import { useAlert } from 'react-alert';
import ReactCardFlip from 'react-card-flip';
import { FaFileExport, FaUnlink } from 'react-icons/fa';
import { getACS } from 'spectra-data-ranges';

import { useAssignmentData } from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import { useModal } from '../../elements/Modal';
import ToolTip from '../../elements/ToolTip/ToolTip';
import ContextWrapper from '../../hoc/ContextWrapper';
import CopyClipboardModal from '../../modal/CopyClipboardModal';
import {
  DELETE_2D_ZONE,
  SET_Y_DOMAIN,
  SET_X_DOMAIN,
  CHANGE_ZONE_DATA,
} from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/Export';
import { HighlightSignalConcatenation } from '../extra/constants/ConcatenationStrings';
import NoTableData from '../extra/placeholder/NoTableData';
import { unlink } from '../extra/utilities/ZoneUtilities';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import ZonesPreferences from './ZonesPreferences';
import ZonesTable from './ZonesTable';

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
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

const ZonesPanel = memo(
  ({ spectrum, activeTab, preferences, xDomain, yDomain }) => {
    // const {
    //   activeSpectrum,
    //   data: spectraData,
    //   activeTab,
    //   preferences,
    //   xDomain,
    //   yDomain,
    // } = useChartData();
    const [filterIsActive, setFilterIsActive] = useState(false);
    const [zonesCounter, setZonesCounter] = useState(0);

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
      if (spectrum && spectrum.zones && spectrum.zones.values) {
        setZonesCounter(spectrum.zones.values.length);
        return spectrum.zones.values;
      }
      setZonesCounter(0);
      return [];
    }, [spectrum]);

    const tableData = useMemo(() => {
      const isInView = (xFrom, xTo, yFrom, yTo) => {
        const factor = 10000;
        xFrom = xFrom * factor;
        xTo = xTo * factor;
        yFrom = yFrom * factor;
        yTo = yTo * factor;
        return (
          ((xTo >= xDomain[0] * factor && xFrom <= xDomain[1] * factor) ||
            (xFrom <= xDomain[0] * factor && xTo >= xDomain[1] * factor)) &&
          ((yTo >= yDomain[0] * factor && yFrom <= yDomain[1] * factor) ||
            (yFrom <= yDomain[0] * factor && yTo >= yDomain[1] * factor))
        );
      };

      const getFilteredZones = (zones) => {
        return zones.filter((zone) => {
          return isInView(zone.x.from, zone.x.to, zone.y.from, zone.y.to);
        });
      };

      const zones = filterIsActive ? getFilteredZones(data) : data;

      return zones.map((zone) => {
        return {
          ...zone,
          tableMetaInfo: {
            isConstantlyHighlighted: isInView(
              zone.x.from,
              zone.x.to,
              zone.y.from,
              zone.y.to,
            ),
          },
        };
      });
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [data, data.length, filterIsActive, xDomain, yDomain]);

    const handleOnFilter = useCallback(() => {
      setFilterIsActive(!filterIsActive);
    }, [filterIsActive]);

    const unlinkZoneHandler = useCallback(
      (zone, isOnZoneLevel, signalIndex, axis) => {
        // unlink in assignment hook data
        if (isOnZoneLevel !== undefined && axis !== undefined) {
          if (isOnZoneLevel === true) {
            assignmentData.dispatch({
              type: 'REMOVE_ALL',
              payload: {
                id: zone.id,
                axis: axis,
              },
            });
          } else if (signalIndex !== undefined) {
            assignmentData.dispatch({
              type: 'REMOVE_ALL',
              payload: {
                id: `${zone.id}${HighlightSignalConcatenation}${signalIndex}`,
                axis: axis,
              },
            });
          }
        } else if (axis !== undefined) {
          assignmentData.dispatch({
            type: 'REMOVE_ALL',
            payload: {
              id: zone.id,
              axis: axis,
            },
          });
          zone.signal.forEach((_signal, i) => {
            assignmentData.dispatch({
              type: 'REMOVE_ALL',
              payload: {
                id: `${zone.id}${HighlightSignalConcatenation}${i}`,
                axis: axis,
              },
            });
          });
        } else {
          assignmentData.dispatch({
            type: 'REMOVE_ALL',
            payload: {
              id: zone.id,
              axis: 'x',
            },
          });
          zone.signal.forEach((_signal, i) => {
            assignmentData.dispatch({
              type: 'REMOVE_ALL',
              payload: {
                id: `${zone.id}${HighlightSignalConcatenation}${i}`,
                axis: 'x',
              },
            });
          });
          assignmentData.dispatch({
            type: 'REMOVE_ALL',
            payload: {
              id: zone.id,
              axis: 'y',
            },
          });
          zone.signal.forEach((_signal, i) => {
            assignmentData.dispatch({
              type: 'REMOVE_ALL',
              payload: {
                id: `${zone.id}${HighlightSignalConcatenation}${i}`,
                axis: 'y',
              },
            });
          });
        }

        // unlink in global state
        unlink(zone, isOnZoneLevel, signalIndex, axis);
        dispatch({ type: CHANGE_ZONE_DATA, data: zone });
      },
      [assignmentData, dispatch],
    );

    const removeAssignments = useCallback(() => {
      data.forEach((zone) => unlinkZoneHandler(zone));
    }, [data, unlinkZoneHandler]);

    const handleOnRemoveAssignments = useCallback(() => {
      modal.showConfirmDialog(
        'All assignments will be removed. Are you sure?',
        {
          onYes: removeAssignments,
        },
      );
    }, [removeAssignments, modal]);

    const handleDeleteAll = useCallback(() => {
      modal.showConfirmDialog('All zones will be deleted. Are You sure?', {
        onYes: () => {
          removeAssignments();
          dispatch({ type: DELETE_2D_ZONE });
        },
      });
    }, [dispatch, modal, removeAssignments]);

    const zoomZoneHandler = useCallback(
      (zone) => {
        const xMargin = Math.abs(zone.x.from - zone.x.to) * 10;
        dispatch({
          type: SET_X_DOMAIN,
          xDomain:
            zone.x.from <= zone.x.to
              ? [zone.x.from - xMargin, zone.x.to + xMargin]
              : [zone.x.to - xMargin, zone.x.from + xMargin],
        });
        const yMargin = Math.abs(zone.y.from - zone.y.to) * 10;
        dispatch({
          type: SET_Y_DOMAIN,
          yDomain:
            zone.y.from <= zone.y.to
              ? [zone.y.from - yMargin, zone.y.to + yMargin]
              : [zone.y.to - yMargin, zone.y.from + yMargin],
        });
      },
      [dispatch],
    );

    const deleteZoneHandler = useCallback(
      (zone) => {
        unlinkZoneHandler(zone);
        dispatch({
          type: DELETE_2D_ZONE,
          zoneID: zone.id,
        });
      },
      [dispatch, unlinkZoneHandler],
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
        if (spectrum) {
          const { from, to } = value;
          const { x, y } = spectrum;
          const { fromIndex, toIndex } = xGetFromToIndex(x, {
            from,
            to,
          });

          const dataToClipboard = {
            x: x.slice(fromIndex, toIndex),
            y: y.slice(fromIndex, toIndex),
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
      [spectrum, alert],
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

    const zonesPreferences = useMemo(() => {
      const _preferences = lodash.get(
        preferences,
        `panels.zones.[${activeTab}]`,
      );
      // || rangeDefaultValues;

      return _preferences;
    }, [activeTab, preferences]);

    const contextMenu = [
      {
        label: 'Copy to clipboard',
        onClick: saveJSONToClipboardHandler,
      },
    ];

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
        <div style={styles}>
          {!isFlipped && (
            <DefaultPanelHeader
              counter={zonesCounter}
              onDelete={handleDeleteAll}
              deleteToolTip="Delete All Zones"
              onFilter={handleOnFilter}
              filterToolTip={
                filterIsActive ? 'Show all zones' : 'Hide zones out of view'
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
                <ZonesTable
                  tableData={tableData}
                  onDelete={deleteZoneHandler}
                  onZoom={zoomZoneHandler}
                  onUnlink={unlinkZoneHandler}
                  context={contextMenu}
                  preferences={zonesPreferences}
                  nuclei={
                    activeTab && activeTab.split(',').length === 2
                      ? activeTab.split(',')
                      : ['?', '?']
                  }
                />
              ) : (
                <NoTableData />
              )}
            </div>
            <ZonesPreferences ref={settingRef} />
          </ReactCardFlip>
        </div>
      </>
    );
  },
);

export default ContextWrapper(
  ZonesPanel,
  ['spectrum', 'activeTab', 'preferences', 'xDomain', 'yDomain'],
  { spectrum: ['zones', 'x', 'y'] },
);
