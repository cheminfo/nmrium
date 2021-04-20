import lodashGet from 'lodash/get';
import { useState, useMemo, useCallback, useRef, memo } from 'react';
import ReactCardFlip from 'react-card-flip';
import { FaUnlink } from 'react-icons/fa';

import { useAssignmentData } from '../../assignment';
import { useDispatch } from '../../context/DispatchContext';
import ToggleButton from '../../elements/ToggleButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import ZonesWrapper from '../../hoc/ZonesWrapper';
import { DELETE_2D_ZONE, UNLINK_ZONE } from '../../reducer/types/Types';
import Events from '../../utility/Events';
import NoTableData from '../extra/placeholder/NoTableData';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import ZonesPreferences from './ZonesPreferences';
import ZonesTable from './ZonesTable';

const styles = {
  container: {
    flexDirection: 'column',
    height: '100%',
    display: 'flex',
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
    backgroundColor: 'transparent',
  },
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
  toggle: {
    width: '22px',
    height: '22px',
    marginLeft: '2px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
};

function ZonesPanel({ zones, activeTab, preferences, xDomain, yDomain }) {
  const [filterIsActive, setFilterIsActive] = useState(false);

  const assignmentData = useAssignmentData();

  const dispatch = useDispatch();
  const modal = useModal();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef();

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
    if (zones.values) {
      const _zones = filterIsActive
        ? getFilteredZones(zones.values)
        : zones.values;

      return _zones.map((zone) => {
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
    }
  }, [zones, filterIsActive, xDomain, yDomain]);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const unlinkZoneHandler = useCallback(
    (zoneData, isOnZoneLevel, signalIndex, axis) => {
      dispatch({
        type: UNLINK_ZONE,
        payload: {
          zoneData,
          assignmentData,
          isOnZoneLevel,
          signalIndex,
          axis,
        },
      });
    },
    [assignmentData, dispatch],
  );

  const removeAssignments = useCallback(() => {
    zones.values.forEach((zone) => unlinkZoneHandler(zone));
  }, [zones.values, unlinkZoneHandler]);

  const handleOnRemoveAssignments = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All assignments will be removed. Are you sure?',
      buttons: [{ text: 'Yes', handler: removeAssignments }, { text: 'No' }],
    });
  }, [removeAssignments, modal]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog({
      message: 'All zones will be deleted. Are You sure?',
      buttons: [
        {
          text: 'Yes',
          handler: () => {
            dispatch({ type: DELETE_2D_ZONE, payload: { assignmentData } });
          },
        },
        { text: 'No' },
      ],
    });
  }, [assignmentData, dispatch, modal]);

  const zonesPreferences = useMemo(() => {
    const _preferences = lodashGet(preferences, `panels.zones.[${activeTab}]`);

    return _preferences;
  }, [activeTab, preferences]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  const visibilityHandler = useCallback((key) => {
    Events.emit('onZonesVisibilityChange', { key });
  }, []);

  return (
    <>
      <div style={styles.container}>
        {!isFlipped && (
          <DefaultPanelHeader
            counter={zones.values ? zones.values.length : 0}
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
            <ToolTip title={`Remove all Assignments`} popupPlacement="right">
              <button
                style={styles.removeAssignmentsButton}
                type="button"
                onClick={handleOnRemoveAssignments}
                disabled={!zones.values || zones.values.length === 0}
              >
                <FaUnlink />
              </button>
            </ToolTip>
            <ToggleButton
              popupTitle="show/hide zones"
              popupPlacement="right"
              style={styles.toggle}
              defaultValue
              onClick={() => visibilityHandler('zones')}
            >
              <span style={{ fontSize: '12px', pointerEvents: 'none' }}>z</span>
            </ToggleButton>
            <ToggleButton
              popupTitle="show/hide signals"
              popupPlacement="right"
              style={styles.toggle}
              defaultValue
              onClick={() => visibilityHandler('signals')}
            >
              <span style={{ fontSize: '12px', pointerEvents: 'none' }}>s</span>
            </ToggleButton>
            <ToggleButton
              popupTitle="show/hide peaks"
              popupPlacement="right"
              style={styles.toggle}
              defaultValue
              onClick={() => visibilityHandler('peaks')}
            >
              <span style={{ fontSize: '12px', pointerEvents: 'none' }}>p</span>
            </ToggleButton>
          </DefaultPanelHeader>
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
              {tableData && tableData.length > 0 ? (
                <ZonesTable
                  tableData={tableData}
                  onUnlink={unlinkZoneHandler}
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
      </div>
    </>
  );
}

export default ZonesWrapper(memo(ZonesPanel));
