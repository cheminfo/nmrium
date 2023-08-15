/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Spectrum2D } from 'nmr-load-save';
import { useState, useMemo, useCallback, useRef, memo } from 'react';
import { FaUnlink } from 'react-icons/fa';
import { useOnOff, ConfirmModal } from 'react-science/ui';

import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import ActiveButton from '../../elements/ActiveButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import useSpectrum from '../../hooks/useSpectrum';
import { zoneStateInit } from '../../reducer/Reducer';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import NoTableData from '../extra/placeholder/NoTableData';
import DefaultPanelHeader, {
  createFilterLabel,
} from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import ZonesPreferences from './ZonesPreferences';
import ZonesTable from './ZonesTable';

const style = css`
  .remove-assignments-btn {
    border-radius: 5px;
    margin-top: 3px;
    margin-left: 2px;
    border: none;
    height: 16px;
    width: 18px;
    font-size: 12px;
    padding: 0;
    background-color: transparent;
  }

  .toggle {
    width: 22px;
    height: 22px;
    margin-left: 2px;
    display: flex;
    justify-content: center;
    align-items: center;
  }
`;

function ZonesPanelInner({
  zones,
  activeTab,
  xDomain,
  yDomain,
  experiment,
  showZones,
  showSignals,
  showPeaks,
  id,
}) {
  const [filterIsActive, setFilterIsActive] = useState(false);

  const [isOpen, open, close] = useOnOff();
  const [{ message, confirmHandler }, setModalData] = useState({
    message: '',
    confirmHandler: () => {},
  });
  const assignmentData = useAssignmentData();

  const dispatch = useDispatch();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<any>();

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
    (
      zoneData?,
      isOnZoneLevel = undefined,
      signalIndex = -1,
      axis = undefined,
    ) => {
      dispatch({
        type: 'UNLINK_ZONE',
        payload: {
          zone: zoneData,
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
    unlinkZoneHandler();
    close();
  }, [close, unlinkZoneHandler]);

  const handleOnRemoveAssignments = useCallback(() => {
    open();
    setModalData({
      message: 'All assignments will be removed. Are you sure?',
      confirmHandler: removeAssignments,
    });
  }, [open, removeAssignments]);

  const handleDeleteAll = useCallback(() => {
    open();
    setModalData({
      message: 'All zones will be deleted. Are You sure?',
      confirmHandler: () => {
        dispatch({ type: 'DELETE_2D_ZONE', payload: { assignmentData } });
        close();
      },
    });
  }, [assignmentData, close, dispatch, open]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  const handleSetShowZones = () => {
    dispatch({ type: 'SHOW_ZONES', payload: { id } });
  };
  const handleSetShowSignals = () => {
    dispatch({ type: 'SHOW_ZONES_SIGNALS', payload: { id } });
  };
  const handleSetShowPeaks = () => {
    dispatch({ type: 'SHOW_ZONES_PEAKS', payload: { id } });
  };

  const counter = zones?.values?.length || 0;

  return (
    <div
      css={[
        tablePanelStyle,
        style,
        isFlipped &&
          css`
            th {
              position: relative;
            }
          `,
      ]}
    >
      {!isFlipped && (
        <DefaultPanelHeader
          counter={counter}
          counterLabel={createFilterLabel(
            counter,
            filterIsActive && tableData?.length,
          )}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Zones"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all zones' : 'Hide zones out of view'
          }
          showSettingButton
          onSettingClick={settingsPanelHandler}
        >
          <ToolTip title={`Remove all assignments`} popupPlacement="right">
            <button
              className="remove-assignments-btn"
              type="button"
              onClick={handleOnRemoveAssignments}
              disabled={!zones.values || zones.values.length === 0}
            >
              <FaUnlink />
            </button>
          </ToolTip>
          <ActiveButton
            popupTitle="Show/Hide zones"
            popupPlacement="right"
            value={showZones}
            onClick={handleSetShowZones}
          >
            <span style={{ fontSize: '12px', pointerEvents: 'none' }}>z</span>
          </ActiveButton>
          <ActiveButton
            popupTitle="Show/Hide signals"
            popupPlacement="right"
            value={showSignals}
            onClick={handleSetShowSignals}
          >
            <span style={{ fontSize: '12px', pointerEvents: 'none' }}>s</span>
          </ActiveButton>
          <ActiveButton
            popupTitle="Show/Hide peaks"
            popupPlacement="right"
            value={showPeaks}
            onClick={handleSetShowPeaks}
          >
            <span style={{ fontSize: '12px', pointerEvents: 'none' }}>p</span>
          </ActiveButton>
        </DefaultPanelHeader>
      )}
      {isFlipped && (
        <PreferencesHeader
          onSave={saveSettingHandler}
          onClose={settingsPanelHandler}
        />
      )}
      <div className="inner-container">
        {!isFlipped ? (
          <div className="table-container">
            {tableData && tableData.length > 0 ? (
              <ZonesTable
                tableData={tableData}
                onUnlink={unlinkZoneHandler}
                nuclei={
                  activeTab && activeTab.split(',').length === 2
                    ? activeTab.split(',')
                    : ['?', '?']
                }
                experiment={experiment}
              />
            ) : (
              <NoTableData />
            )}
          </div>
        ) : (
          <ZonesPreferences ref={settingRef} />
        )}
      </div>
      <ConfirmModal
        headerColor="red"
        onConfirm={confirmHandler}
        onCancel={() => {
          close();
        }}
        isOpen={isOpen}
        onRequestClose={() => {
          close();
        }}
        saveText="Yes"
        cancelText="No"
      >
        <div
          style={{
            display: 'flex',
            flex: '1 1 0%',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            margin: 25,
            fontSize: 14,
            color: 'rgb(175, 0, 0)',
          }}
        >
          <span>{message}</span>
        </div>
      </ConfirmModal>
    </div>
  );
}

const MemoizedZonesPanel = memo(ZonesPanelInner);

const emptyData = { zones: {}, info: {} };

export default function ZonesPanel() {
  const {
    displayerKey,
    xDomain,
    yDomain,
    view: {
      zones: zoneState,
      spectra: { activeTab },
    },
  } = useChartData();
  const { zones, info, id } = useSpectrum(emptyData) as Spectrum2D;
  const zoneProps = zoneState.find((r) => r.spectrumID === id) || zoneStateInit;
  return (
    <MemoizedZonesPanel
      {...{
        id,
        xDomain,
        yDomain,
        activeTab,
        displayerKey,
        zones,
        experiment: info.experiment,
        ...zoneProps,
      }}
    />
  );
}
