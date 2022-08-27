/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { xGetFromToIndex } from 'ml-spectra-processing';
import { useCallback, useMemo, memo, useState, useRef } from 'react';

import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import { Data1D, Datum1D, Info1D, Ranges } from '../../../data/types/data1d';
import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { rangeStateInit } from '../../reducer/Reducer';
import { UNLINK_RANGE } from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/Export';
import { WorkSpacePanelPreferences } from '../../workspaces/Workspace';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import NoTableData from '../extra/placeholder/NoTableData';
import PreferencesHeader from '../header/PreferencesHeader';

import RangesHeader from './RangesHeader';
import RangesPreferences from './RangesPreferences';
import RangesTable from './RangesTable';

interface RangesTablePanelInnerProps {
  id: string;
  ranges: Ranges;
  data: Data1D;
  info: Info1D;
  xDomain: Array<number>;
  activeTab: string;
  molecules: Array<StateMoleculeExtended>;
  showMultiplicityTrees: boolean;
  showJGraph: boolean;
  showRangesIntegrals: boolean;
  preferences: WorkSpacePanelPreferences['ranges'];
}

function RangesTablePanelInner({
  id,
  ranges,
  data,
  info,
  xDomain,
  preferences,
  activeTab,
  molecules,
  showMultiplicityTrees,
  showJGraph,
  showRangesIntegrals,
}: RangesTablePanelInnerProps) {
  const [isFilterActive, setFilterIsActive] = useState(false);
  const assignmentData = useAssignmentData();

  const dispatch = useDispatch();
  const alert = useAlert();
  const [isFlipped, setFlipStatus] = useState(false);

  const settingRef = useRef<any>();

  const rangesData = useMemo(() => {
    const isInView = (from: number, to: number) => {
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

    if (ranges.values) {
      const _ranges = isFilterActive
        ? getFilteredRanges(ranges.values)
        : ranges.values;
      return _ranges.map((range) => {
        return {
          ...range,
          tableMetaInfo: {
            isConstantlyHighlighted: isInView(range.from, range.to),
          },
        };
      });
    }
    return [];
  }, [isFilterActive, ranges.values, xDomain]);

  const unlinkRangeHandler = useCallback(
    (rangeData, signalIndex = -1) => {
      dispatch({
        type: UNLINK_RANGE,
        payload: {
          rangeData,
          assignmentData,
          signalIndex,
        },
      });
    },
    [assignmentData, dispatch],
  );

  const saveJSONToClipboardHandler = useCallback(
    async (value) => {
      if (data.x && data.re) {
        const { x, re } = data;
        const { from, to } = value;

        const { fromIndex, toIndex } = xGetFromToIndex(x, {
          from,
          to,
        });
        const dataToClipboard = {
          x: Array.from(x.slice(fromIndex, toIndex)),
          y: Array.from(re.slice(fromIndex, toIndex)),
          ...value,
        };

        const success = await copyTextToClipboard(
          JSON.stringify(dataToClipboard, undefined, 2),
        );

        if (success) {
          alert.show('Data copied to clipboard');
        } else {
          alert.error('copy to clipboard failed');
        }
      }
    },
    [data, alert],
  );

  const contextMenu = useMemo(
    () => [
      {
        label: 'Copy to clipboard',
        onClick: saveJSONToClipboardHandler,
      },
    ],
    [saveJSONToClipboardHandler],
  );

  const filterHandler = useCallback(() => {
    setFilterIsActive(!isFilterActive);
  }, [isFilterActive]);

  const settingsPanelHandler = useCallback(() => {
    setFlipStatus(!isFlipped);
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

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
        <RangesHeader
          {...{
            id,
            ranges,
            info,
            activeTab,
            molecules,
            showRangesIntegrals,
            showMultiplicityTrees,
            showJGraph,
            isFilterActive,
          }}
          onUnlink={unlinkRangeHandler}
          onFilterActivated={filterHandler}
          onSettingClick={settingsPanelHandler}
          filterCounter={rangesData.length}
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
            {rangesData && rangesData.length > 0 ? (
              <RangesTable
                activeTab={activeTab}
                tableData={rangesData}
                onUnlink={unlinkRangeHandler}
                context={contextMenu}
                preferences={preferences}
                info={info}
              />
            ) : (
              <NoTableData />
            )}
          </div>
        ) : (
          <RangesPreferences ref={settingRef} />
        )}
      </div>
    </div>
  );
}

const MemoizedRangesTablePanel = memo(RangesTablePanelInner);

const emptyData = { ranges: {}, data: {}, info: {} };

export default function RangesTablePanel() {
  const { ranges, data, info, id } = useSpectrum(emptyData) as Datum1D;
  const {
    displayerKey,
    xDomain,
    activeTab,
    molecules,
    toolOptions: { selectedTool },
    view: { ranges: rangeState },
  } = useChartData();
  // console.log(rangeState);
  const { showMultiplicityTrees, showRangesIntegrals, showJGraph } = useMemo(
    () => rangeState.find((r) => r.spectrumID === id) || rangeStateInit,
    [id, rangeState],
  );

  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  return (
    <MemoizedRangesTablePanel
      {...{
        id,
        ranges,
        data,
        info,
        showMultiplicityTrees,
        showJGraph,
        showRangesIntegrals,
        selectedTool,
        displayerKey,
        preferences: rangesPreferences,
        xDomain,
        activeTab,
        molecules,
      }}
    />
  );
}
