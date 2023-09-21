/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Spectrum2D } from 'nmr-load-save';
import { useState, useMemo, useCallback, useRef, memo } from 'react';
import { FaUnlink } from 'react-icons/fa';

import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import ActiveButton from '../../elements/ActiveButton';
import ToolTip from '../../elements/ToolTip/ToolTip';
import { useModal } from '../../elements/popup/Modal';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState';
import useSpectrum from '../../hooks/useSpectrum';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
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
  info,
  showZones,
  showSignals,
  showPeaks,
}) {
  const [filterIsActive, setFilterIsActive] = useState(false);

  const assignmentData = useAssignmentData();

  const dispatch = useDispatch();
  const modal = useModal();
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
  }, [unlinkZoneHandler]);

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
            dispatch({ type: 'DELETE_2D_ZONE', payload: { assignmentData } });
          },
        },
        { text: 'No' },
      ],
    });
  }, [assignmentData, dispatch, modal]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  const handleSetShowZones = () => {
    dispatch({
      type: 'TOGGLE_ZONES_VIEW_PROPERTY',
      payload: { key: 'showZones' },
    });
  };
  const handleSetShowSignals = () => {
    dispatch({
      type: 'TOGGLE_ZONES_VIEW_PROPERTY',
      payload: { key: 'showSignals' },
    });
  };
  const handleSetShowPeaks = () => {
    dispatch({
      type: 'TOGGLE_ZONES_VIEW_PROPERTY',
      payload: { key: 'showPeaks' },
    });
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
            <ZonesTable
              tableData={tableData}
              onUnlink={unlinkZoneHandler}
              nucleus={activeTab}
              info={info}
            />
          </div>
        ) : (
          <ZonesPreferences ref={settingRef} />
        )}
      </div>
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
      spectra: { activeTab },
    },
  } = useChartData();
  const { zones, info } = useSpectrum(emptyData) as Spectrum2D;
  const zoneProps = useActiveSpectrumZonesViewState();
  return (
    <MemoizedZonesPanel
      {...{
        xDomain,
        yDomain,
        activeTab,
        displayerKey,
        zones,
        info,
        ...zoneProps,
      }}
    />
  );
}
