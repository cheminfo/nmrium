import lodash from 'lodash';
import { X } from 'ml-spectra-processing';
import React, { useCallback, useMemo, memo, useState, useRef } from 'react';
import { useAlert } from 'react-alert';
import ReactCardFlip from 'react-card-flip';
import { FaRegTrashAlt, FaFileExport } from 'react-icons/fa';
import { getACS } from 'spectra-data-ranges';

import { useChartData } from '../context/ChartContext';
import { useDispatch } from '../context/DispatchContext';
import { useModal } from '../elements/Modal';
import ReactTable from '../elements/ReactTable/ReactTable';
import Select from '../elements/Select';
import ToolTip from '../elements/ToolTip/ToolTip';
import ChangeSumModal from '../modal/ChangeSumModal';
import CopyClipboardModal from '../modal/CopyClipboardModal';
import {
  DELETE_RANGE,
  CHANGE_RANGE_DATA,
  CHANGE_RANGE_SUM,
} from '../reducer/types/Types';
import { copyTextToClipboard } from '../utility/Export';

import RangesTable from './RangesTable';
import { SignalKinds } from './constants/SignalsKinds';
import DefaultPanelHeader from './header/DefaultPanelHeader';
import PreferencesHeader from './header/PreferencesHeader';
import NoTableData from './placeholder/NoTableData';
import { ColumnsHelper } from './preferences-panels/ColumnsHelper';
import RangesPreferences from './preferences-panels/RangesPreferences';
import { rangeDefaultValues } from './preferences-panels/defaultValues';

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
  button: {
    backgroundColor: 'transparent',
    border: 'none',
  },
};

// const selectStyle = { marginLeft: 2, marginRight: 2, border: 'none' };

const RangesTablePanel = memo(() => {
  const {
    data: SpectrumsData,
    activeSpectrum,
    xDomain,
    preferences,
    activeTab,
    molecules,
  } = useChartData();
  const [filterIsActive, setFilterIsActive] = useState(false);
  const [rangesCounter, setRangesCounter] = useState(0);

  const dispatch = useDispatch();
  const modal = useModal();
  const alert = useAlert();
  const [isFlipped, setFlipStatus] = useState(false);
  const [isTableVisible, setTableVisibility] = useState(true);
  const settingRef = useRef();

  // const deleteRangeHandler = useCallback(
  //   (e, row) => {
  //     e.preventDefault();
  //     e.stopPropagation();
  //     const params = row.original;
  //     dispatch({
  //       type: DELETE_RANGE,
  //       rangeID: params.id,
  //     });
  //   },
  //   [dispatch],
  // );

  const data = useMemo(() => {
    const _data =
      activeSpectrum && SpectrumsData
        ? SpectrumsData[activeSpectrum.index]
        : null;

    function isInRange(from, to) {
      const factor = 10000;
      to = to * factor;
      from = from * factor;
      return (
        (to >= xDomain[0] * factor && from <= xDomain[1] * factor) ||
        (from <= xDomain[0] * factor && to >= xDomain[1] * factor)
      );
    }

    if (_data && _data.ranges && _data.ranges.values) {
      setRangesCounter(_data.ranges.values.length);

      const getFilteredRanges = (ranges = _data.ranges.values) => {
        return ranges.filter((range) => isInRange(range.from, range.to));
      };

      const ranges = filterIsActive ? getFilteredRanges() : _data.ranges.values;

      return ranges.map((range) => {
        return {
          ...range,
          isConstantlyHighlighted: isInRange(range.from, range.to),
        };
      });
    }
  }, [SpectrumsData, activeSpectrum, filterIsActive, xDomain]);

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
      const _data =
        activeSpectrum && SpectrumsData
          ? SpectrumsData[activeSpectrum.index]
          : null;

      if (_data) {
        const { from, to } = value;
        const { fromIndex, toIndex } = X.getFromToIndex(_data.x, {
          from,
          to,
        });

        const dataToClipboard = {
          x: _data.x.slice(fromIndex, toIndex),
          y: _data.y.slice(fromIndex, toIndex),
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
    [SpectrumsData, activeSpectrum, alert],
  );

  const closeClipBoardHandler = useCallback(() => {
    modal.close();
  }, [modal]);

  // const changeRangeSignalKindHandler = useCallback(
  //   (value, row) => {
  //     const _data = { ...row.original, kind: value };
  //     dispatch({
  //       type: CHANGE_RANGE_DATA,
  //       data: _data,
  //     });
  //   },
  //   [dispatch],
  // );

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

  // // define columns for different (sub)tables and expandable ones
  // const columnsRangesDefault = [
  //   {
  //     orderIndex: 1,
  //     Header: `δ (ppm)`,
  //     Cell: ({ row }) =>
  //       Object.prototype.hasOwnProperty.call(row.original, 'signal') &&
  //       row.original.signal.length > 0
  //         ? row.original.signal[0].delta.toFixed(3)
  //         : null,
  //   },
  //   {
  //     orderIndex: 4,
  //     Header: 'Kind',
  //     accessor: 'kind',
  //     sortType: 'basic',
  //     resizable: true,
  //     Cell: ({ row }) => (
  //       <Select
  //         onChange={(value) => changeRangeSignalKindHandler(value, row)}
  //         data={SignalKinds}
  //         style={selectStyle}
  //         defaultValue={row.original.kind}
  //       />
  //     ),
  //   },
  //   {
  //     orderIndex: 5,
  //     Header: '',
  //     id: 'delete-button',
  //     Cell: ({ row }) => (
  //       <button
  //         type="button"
  //         className="delete-button"
  //         onClick={(e) => deleteRangeHandler(e, row)}
  //       >
  //         <FaRegTrashAlt />
  //       </button>
  //     ),
  //   },
  // ];

  // const columnsRanges = useMemo(() => {
  //   const rangesPreferences = lodash.get(
  //     preferences,
  //     `panels.ranges.[${activeTab}]`,
  //   );
  //   const columnHelper = new ColumnsHelper(
  //     rangesPreferences,
  //     rangeDefaultValues,
  //   );
  //   let cols = [...columnsRangesDefault];
  //   // columnHelper.addColumn(cols, 'showFrom', 'fromFormat', 'from', 'From', 3);
  //   // columnHelper.addColumn(cols, 'showTo', 'toFormat', 'to', 'To', 4);
  //   columnHelper.addColumn(
  //     cols,
  //     'showAbsolute',
  //     'absoluteFormat',
  //     'absolute',
  //     'Absolute',
  //     2,
  //   );
  //   const n = activeTab && activeTab.replace(/[0-9]/g, '');
  //   columnHelper.addColumn(
  //     cols,
  //     'showRelative',
  //     'relativeFormat',
  //     'integral',
  //     `Rel. ${n}`,
  //     3,
  //     {
  //       formatPrefix: '[',
  //       formatSuffix: ']',
  //       showPrefixSuffixCallback: (row) =>
  //         row &&
  //         row.original &&
  //         row.original.kind &&
  //         row.original.kind === 'signal'
  //           ? false
  //           : true,
  //     },
  //   );

  //   return cols.sort(
  //     (object1, object2) => object1.orderIndex - object2.orderIndex,
  //   );
  // }, [activeTab, columnsRangesDefault, preferences]);

  const contextMenu = [
    {
      label: 'Copy to clipboard',
      onClick: saveJSONToClipboardHandler,
    },
  ];

  const yesHandler = useCallback(() => {
    dispatch({ type: DELETE_RANGE, rangeID: null });
  }, [dispatch]);

  const handleDeleteAll = useCallback(() => {
    modal.showConfirmDialog('All records will be deleted,Are You sure?', {
      onYes: yesHandler,
    });
  }, [modal, yesHandler]);

  const changeRangesSumHandler = useCallback(
    (value) => {
      if (value !== undefined) {
        dispatch({ type: CHANGE_RANGE_SUM, value });
      }

      modal.close();
    },
    [dispatch, modal],
  );

  const currentSum = useMemo(() => {
    return activeSpectrum &&
      SpectrumsData &&
      SpectrumsData[activeSpectrum.index] &&
      SpectrumsData[activeSpectrum.index].ranges &&
      SpectrumsData[activeSpectrum.index].ranges.options &&
      SpectrumsData[activeSpectrum.index].ranges.options.sum !== undefined
      ? SpectrumsData[activeSpectrum.index].ranges.options.sum
      : null;
  }, [SpectrumsData, activeSpectrum]);

  const showChangeRangesSumModal = useCallback(() => {
    modal.show(
      <ChangeSumModal
        onClose={() => modal.close()}
        onSave={changeRangesSumHandler}
        header={`Set new Ranges Sum (Current: ${currentSum})`}
        molecules={molecules}
        element={activeTab ? activeTab.replace(/[0-9]/g, '') : null}
      />,
    );
  }, [activeTab, changeRangesSumHandler, currentSum, modal, molecules]);

  const handleOnFilter = useCallback(() => {
    setFilterIsActive(!filterIsActive);
  }, [filterIsActive]);

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
      <div style={styles.container}>
        {!isFlipped && (
          <DefaultPanelHeader
            counter={rangesCounter}
            onDelete={handleDeleteAll}
            deleteToolTip="Delete All Ranges"
            onFilter={handleOnFilter}
            filterToolTip={
              filterIsActive ? 'Show all ranges' : 'Hide ranges out of view'
            }
            filterIsActive={filterIsActive}
            counterFiltered={data && data.length}
            showSettingButton="true"
            onSettingClick={settingsPanelHandler}
          >
            <ToolTip title="Preview publication string" popupPlacement="right">
              <button
                style={styles.button}
                type="button"
                onClick={saveAsHTMLHandler}
              >
                <FaFileExport />
              </button>
            </ToolTip>
            <ToolTip
              title={`Change Ranges Sum (${currentSum})`}
              popupPlacement="right"
            >
              <button
                style={styles.sumButton}
                type="button"
                onClick={showChangeRangesSumModal}
              >
                Σ
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
            {data && data.length > 0 ? (
              // <ReactTable
              //   columns={columnsRanges}
              //   data={data}
              //   context={contextMenu}
              // />
              <RangesTable
                rangesData={data}
                element={activeTab && activeTab.replace(/[0-9]/g, '')}
              />
            ) : (
              <NoTableData />
            )}
          </div>
          <RangesPreferences data={SpectrumsData} ref={settingRef} />
        </ReactCardFlip>
      </div>
    </>
  );
});

export default RangesTablePanel;
