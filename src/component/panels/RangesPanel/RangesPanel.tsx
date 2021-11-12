/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashGet from 'lodash/get';
import { xGetFromToIndex } from 'ml-spectra-processing';
import { useCallback, useMemo, memo, useState, useRef } from 'react';
import ReactCardFlip from 'react-card-flip';

import { Data1D, Datum1D, Info, Ranges } from '../../../data/data1d/Spectrum1D';
import { Molecule } from '../../../data/molecules/Molecule';
import { useAssignmentData } from '../../assignment';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import { useAlert } from '../../elements/popup/Alert';
import useSpectrum from '../../hooks/useSpectrum';
import { UNLINK_RANGE } from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/Export';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import NoTableData from '../extra/placeholder/NoTableData';
import { rangeDefaultValues } from '../extra/preferences/defaultValues';
import PreferencesHeader from '../header/PreferencesHeader';

import RangesHeader from './RangesHeader';
import RangesPreferences from './RangesPreferences';
import RangesTable from './RangesTable';

interface RangesTablePanelInnerProps {
  ranges: Ranges;
  data: Data1D;
  info: Info;
  xDomain: Array<number>;
  activeTab: string;
  molecules: Array<Molecule>;
  showMultiplicityTrees: boolean;
  showRangesIntegrals: boolean;
  preferences: any;
}

function RangesTablePanelInner({
  ranges,
  data,
  info,
  xDomain,
  preferences,
  activeTab,
  molecules,
  showMultiplicityTrees,
  showRangesIntegrals,
}: RangesTablePanelInnerProps) {
  const [isFilterActive, setFilterIsActive] = useState(false);
  const assignmentData = useAssignmentData();

  const dispatch = useDispatch();
  const alert = useAlert();
  const [isFlipped, setFlipStatus] = useState(false);

  const settingRef = useRef<any>();

  const rangesData = useMemo(() => {
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
          x: x.slice(fromIndex, toIndex),
          y: re.slice(fromIndex, toIndex),
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

  const rangesPreferences = useMemo(() => {
    const _preferences =
      lodashGet(preferences, `formatting.panels.ranges.[${activeTab}]`) ||
      rangeDefaultValues;

    return _preferences;
  }, [activeTab, preferences]);

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
    if (!isFlipped) {
      settingRef.current.cancelSetting();
    }
  }, [isFlipped]);

  const saveSettingHandler = useCallback(() => {
    settingRef.current.saveSetting();
    setFlipStatus(false);
  }, []);

  return (
    <>
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
              ranges,
              info,
              activeTab,
              molecules,
              showRangesIntegrals,
              showMultiplicityTrees,
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
          <ReactCardFlip
            isFlipped={isFlipped}
            infinite
            containerStyle={{ overflow: 'hidden', height: '100%' }}
          >
            <div className="table-container">
              {rangesData && rangesData.length > 0 ? (
                <RangesTable
                  activeTab={activeTab}
                  tableData={rangesData}
                  onUnlink={unlinkRangeHandler}
                  context={contextMenu}
                  preferences={rangesPreferences}
                />
              ) : (
                <NoTableData />
              )}
            </div>
            <RangesPreferences ref={settingRef} />
          </ReactCardFlip>
        </div>
      </div>
    </>
  );
}

const MemoizedRangesTablePanel = memo(RangesTablePanelInner);

const emptyData = { ranges: {}, data: {}, info: {} };

export default function RangesTablePanel() {
  const {
    displayerKey,
    xDomain,
    activeTab,
    molecules,
    toolOptions: {
      selectedTool,
      data: { showMultiplicityTrees, showRangesIntegrals },
    },
  } = useChartData();

  const { ranges, data, info } = useSpectrum(emptyData) as Datum1D;
  const preferences = usePreferences();

  return (
    <MemoizedRangesTablePanel
      {...{
        ranges,
        data,
        info,
        showMultiplicityTrees,
        showRangesIntegrals,
        selectedTool,
        displayerKey,
        preferences,
        xDomain,
        activeTab,
        molecules,
      }}
    />
  );
}
