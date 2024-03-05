/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { NmrData1D } from 'cheminfo-types';
import { xGetFromToIndex } from 'ml-spectra-processing';
import { Spectrum1D, WorkSpacePanelPreferences } from 'nmr-load-save';
import { Info1D, Ranges } from 'nmr-processing';
import { useCallback, useMemo, memo, useState, useRef } from 'react';
import { FaCopy } from 'react-icons/fa';

import { StateMoleculeExtended } from '../../../data/molecules/Molecule';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useAssignmentData } from '../../assignment/AssignmentsContext';
import { useChartData } from '../../context/ChartContext';
import { useDispatch } from '../../context/DispatchContext';
import { BaseContextMenuProps } from '../../elements/ContextMenuBluePrint';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import useSpectrum from '../../hooks/useSpectrum';
import { tablePanelStyle } from '../extra/BasicPanelStyle';
import PreferencesHeader from '../header/PreferencesHeader';

import RangesHeader from './RangesHeader';
import RangesPreferences from './RangesPreferences';
import RangesTable from './RangesTable';

const rangesContextMenuOptions: BaseContextMenuProps['options'] = [
  {
    text: 'Copy to Clipboard',
    icon: <FaCopy />,
  },
];

interface RangesTablePanelInnerProps {
  id: string;
  ranges: Ranges;
  data: NmrData1D;
  info: Info1D;
  xDomain: number[];
  activeTab: string;
  molecules: StateMoleculeExtended[];
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
        type: 'UNLINK_RANGE',
        payload: {
          range: rangeData,
          assignmentData,
          signalIndex,
        },
      });
    },
    [assignmentData, dispatch],
  );

  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();

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

        await rawWriteWithType(JSON.stringify(dataToClipboard, undefined, 2));
        alert.show('Data copied to clipboard');
      }
    },
    [data, rawWriteWithType, alert],
  );

  const contextMenuSelectHandler = useCallback(
    (option, data) => {
      void saveJSONToClipboardHandler(data);
    },
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
            <RangesTable
              activeTab={activeTab}
              tableData={rangesData}
              onUnlink={unlinkRangeHandler}
              contextMenu={rangesContextMenuOptions}
              onContextMenuSelect={contextMenuSelectHandler}
              preferences={preferences}
              info={info}
            />
          </div>
        ) : (
          <RangesPreferences ref={settingRef} />
        )}
      </div>
      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Range"
      />
    </div>
  );
}

const MemoizedRangesTablePanel = memo(RangesTablePanelInner);

const emptyData = { ranges: {}, data: {}, info: {} };

export default function RangesPanel() {
  const { ranges, data, info, id } = useSpectrum(emptyData) as Spectrum1D;
  const {
    displayerKey,
    xDomain,
    view: {
      spectra: { activeTab },
    },
    molecules,
    toolOptions: { selectedTool },
  } = useChartData();

  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  return (
    <MemoizedRangesTablePanel
      {...{
        id,
        ranges,
        data,
        info,
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
