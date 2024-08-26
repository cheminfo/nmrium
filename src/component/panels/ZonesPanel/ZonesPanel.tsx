/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Spectrum2D } from 'nmr-load-save';
import { useState, useMemo, useCallback, useRef, memo } from 'react';
import { FaUnlink } from 'react-icons/fa';
import { LuSubtitles } from 'react-icons/lu';

import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/Alert';
import { useActiveSpectrumZonesViewState } from '../../hooks/useActiveSpectrumZonesViewState';
import useSpectrum from '../../hooks/useSpectrum';
import { booleanToString } from '../../utility/booleanToString';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import { SettingsRef } from '../extra/utilities/settingImperativeHandle';
import DefaultPanelHeader from '../header/DefaultPanelHeader';
import PreferencesHeader from '../header/PreferencesHeader';

import ZonesPreferences from './ZonesPreferences';
import ZonesTable from './ZonesTable';

function ZonesPanelInner({
  zones,
  activeTab,
  xDomain,
  yDomain,
  info,
  showZones,
  showSignals,
  showPeaks,
  showAssignmentsLabels,
}) {
  const [filterIsActive, setFilterIsActive] = useState(false);

  const assignmentData = useAssignmentData();

  const dispatch = useDispatch();
  const alert = useAlert();
  const [isFlipped, setFlipStatus] = useState(false);
  const settingRef = useRef<SettingsRef | null>(null);

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
            dispatch({ type: 'DELETE_2D_ZONE', payload: { assignmentData } });
          },
          intent: 'danger',
        },
        { text: 'No' },
      ],
    });
  }, [assignmentData, dispatch, alert]);

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
    <div
      css={[
        tablePanelStyle,
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
              icon: <LuSubtitles />,
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
