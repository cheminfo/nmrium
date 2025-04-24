import type { NmrData1D } from 'cheminfo-types';
import { xGetFromToIndex } from 'ml-spectra-processing';
import type { Info1D, Ranges } from 'nmr-processing';
import type { Spectrum1D, WorkSpacePanelPreferences } from 'nmrium-core';
import { memo, useCallback, useMemo, useRef, useState } from 'react';
import { FaCopy } from 'react-icons/fa';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { BaseContextMenuProps } from '../../elements/ContextMenuBluePrint.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { TablePanel } from '../extra/BasicPanelStyle.js';
import PreferencesHeader from '../header/PreferencesHeader.js';

import RangesHeader from './RangesHeader.js';
import RangesPreferences from './RangesPreferences.js';
import RangesTable from './RangesTable.js';

const rangesContextMenuOptions: BaseContextMenuProps['options'] = [
  {
    text: 'Copy to clipboard',
    icon: <FaCopy />,
  },
];

interface RangesTablePanelInnerProps {
  ranges: Ranges;
  data: NmrData1D;
  info: Info1D;
  xDomain: number[];
  activeTab: string;
  preferences: WorkSpacePanelPreferences['ranges'];
}

function RangesTablePanelInner({
  ranges,
  data,
  info,
  xDomain,
  preferences,
  activeTab,
}: RangesTablePanelInnerProps) {
  const [isFilterActive, setFilterIsActive] = useState(false);

  const dispatch = useDispatch();
  const toaster = useToaster();
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

    const getFilteredRanges = (ranges: Ranges['values']) => {
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

  const unlinkRangeHandler = useCallback(() => {
    dispatch({
      type: 'UNLINK_RANGE',
      payload: {
        signalIndex: -1,
      },
    });
  }, [dispatch]);

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
        toaster.show({ message: 'Data copied to clipboard' });
      }
    },
    [data, rawWriteWithType, toaster],
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
    <TablePanel isFlipped={isFlipped}>
      {!isFlipped && (
        <RangesHeader
          ranges={ranges}
          info={info}
          isFilterActive={isFilterActive}
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
    </TablePanel>
  );
}

const MemoizedRangesTablePanel = memo(RangesTablePanelInner);

const emptyData = { ranges: {}, data: {}, info: {} };

export default function RangesPanel() {
  const { ranges, data, info } = useSpectrum(emptyData) as Spectrum1D;
  const {
    displayerKey,
    xDomain,
    view: {
      spectra: { activeTab },
    },
    toolOptions: { selectedTool },
  } = useChartData();

  const rangesPreferences = usePanelPreferences('ranges', activeTab);

  return (
    <MemoizedRangesTablePanel
      {...{
        ranges,
        data,
        info,
        selectedTool,
        displayerKey,
        preferences: rangesPreferences,
        xDomain,
        activeTab,
      }}
    />
  );
}
