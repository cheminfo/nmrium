import type { Zone } from '@zakodium/nmr-types';
import type { Spectrum2D, ZonesViewState } from '@zakodium/nmrium-core';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FaUnlink } from 'react-icons/fa';
import { LuMessageSquareText } from 'react-icons/lu';

import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useAlert } from '../../elements/Alert.js';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { booleanToString } from '../../utility/booleanToString.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import type { SettingsRef } from '../extra/utilities/settingImperativeHandle.js';
import DefaultPanelHeader from '../header/DefaultPanelHeader.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import ZonesPreferences from './ZonesPreferences.js';
import type { ZonesTableDataElement } from './ZonesTable.js';
import ZonesTable from './ZonesTable.js';

interface MemoizedZonesPanelProps extends ZonesViewState {
  xDomain: number[];
  yDomain: number[];
  activeTab: string;
  zones: Spectrum2D['zones'];
  info: Spectrum2D['info'];
}

const MemoizedZonesPanel = memo(function ZonesPanelInner(
  props: MemoizedZonesPanelProps,
) {
  const {
    zones,
    activeTab,
    xDomain,
    yDomain,
    info,
    showZones,
    showSignals,
    showPeaks,
    showAssignmentsLabels,
  } = props;

  const [filterIsActive, setFilterIsActive] = useState(false);
  const dispatch = useDispatch();
  const alert = useAlert();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<SettingsRef | null>(null);

  const tableData = useMemo<ZonesTableDataElement[]>(() => {
    const isInView = (
      xFrom: number,
      xTo: number,
      yFrom: number,
      yTo: number,
    ) => {
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

    const getFilteredZones = (zones: Zone[]) => {
      return zones.filter((zone) => {
        return isInView(zone.x.from, zone.x.to, zone.y.from, zone.y.to);
      });
    };
    if (zones.values) {
      const _zones = filterIsActive
        ? getFilteredZones(zones.values)
        : zones.values;

      return _zones.map((zone): ZonesTableDataElement => {
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
    } else {
      return [];
    }
  }, [zones, filterIsActive, xDomain, yDomain]);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

  const unlinkZoneHandler = useCallback(
    (
      // TODO: this must be a bug, `zoneData.id` will fail with `undefined`.
      zoneData?: any,
      isOnZoneLevel = undefined,
      signalIndex = -1,
      axis = undefined,
    ) => {
      dispatch({
        type: 'UNLINK_ZONE',
        payload: {
          zoneKey: zoneData.id,
          isOnZoneLevel,
          signalIndex,
          axis,
        },
      });
    },
    [dispatch],
  );

  const removeAssignments = useCallback(() => {
    unlinkZoneHandler();
  }, [unlinkZoneHandler]);

  const handleOnRemoveAssignments = useCallback(() => {
    alert.showAlert({
      message: 'All assignments will be removed. Are you sure?',
      buttons: [
        {
          text: 'Yes',
          onClick: removeAssignments,
          intent: 'danger',
        },
        { text: 'No' },
      ],
    });
  }, [removeAssignments, alert]);

  const handleDeleteAll = useCallback(() => {
    alert.showAlert({
      message: 'All zones will be deleted. Are You sure?',
      buttons: [
        {
          text: 'Yes',
          onClick: () => {
            dispatch({ type: 'DELETE_2D_ZONE', payload: {} });
          },
          intent: 'danger',
        },
        { text: 'No' },
      ],
    });
  }, [dispatch, alert]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(async () => {
    const isSettingValid = await settingRef.current?.saveSetting();
    if (isSettingValid) {
      setFlipStatus(false);
    }
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

  function handleShowAssignmentsLabel() {
    dispatch({
      type: 'TOGGLE_ZONES_VIEW_PROPERTY',
      payload: { key: 'showAssignmentsLabels' },
    });
  }

  const total = zones?.values?.length || 0;
  const hasZones = zones?.values && zones.values.length > 0;
  return (
    <TablePanel isFlipped={isFlipped}>
      {!isFlipped && (
        <DefaultPanelHeader
          total={total}
          counter={tableData?.length}
          onDelete={handleDeleteAll}
          deleteToolTip="Delete All Zones"
          onFilter={handleOnFilter}
          filterToolTip={
            filterIsActive ? 'Show all zones' : 'Hide zones out of view'
          }
          onSettingClick={settingsPanelHandler}
          leftButtons={[
            {
              disabled: !hasZones,
              icon: <FaUnlink />,
              tooltip: 'Remove all assignments',
              onClick: handleOnRemoveAssignments,
            },
            {
              icon: <span>z</span>,
              tooltip: 'Show/Hide zones',
              active: showZones,
              onClick: handleSetShowZones,
            },
            {
              icon: <span>s</span>,
              tooltip: 'Show/Hide signals',
              active: showSignals,
              onClick: handleSetShowSignals,
            },
            {
              icon: <span>p</span>,
              tooltip: 'Show/Hide peaks',
              active: showPeaks,
              onClick: handleSetShowPeaks,
            },
            {
              disabled: !hasZones,
              icon: <LuMessageSquareText />,
              tooltip: `${booleanToString(!showAssignmentsLabels)} assignments labels`,
              onClick: handleShowAssignmentsLabel,
              active: showAssignmentsLabels,
            },
          ]}
        />
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
    </TablePanel>
  );
});

const emptyData = { zones: {}, info: {} };

export default function ZonesPanel() {
  const {
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
        zones,
        info,
        ...zoneProps,
      }}
    />
  );
}
