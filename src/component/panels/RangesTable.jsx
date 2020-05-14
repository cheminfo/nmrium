/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useEffect, useMemo, useCallback } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';

import { useDispatch } from '../context/DispatchContext';
import {
  HighlightedRowStyle,
  ConstantlyHighlightedRowStyle,
} from '../elements/ReactTable/Style';
import Select from '../elements/Select';
import { useHighlight } from '../highlight';
import { DELETE_RANGE, CHANGE_RANGE_DATA } from '../reducer/types/Types';

import { SignalKinds } from './constants/SignalsKinds';

const tableStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  font-size: 12px;
  height: 100%;
  .react-contextmenu-wrapper {
    display: contents;
  }
  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }
  th,
  td {
    text-align: center;
    margin: 0;
    padding: 0.4rem;
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;

    :last-child {
      border-right: 0;
    }
    button {
      background-color: transparent;
      border: none;
    }
  }
`;

const selectStyle = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

const RangesTableRow = ({ rowData }) => {
  const dispatch = useDispatch();

  const highlight = useHighlight([
    Object.prototype.hasOwnProperty.call(rowData, 'id') ? rowData.id : '',
  ]);

  const changeRangeSignalKindHandler = useCallback(
    (value) => {
      const _data = { ...rowData.original, kind: value };
      dispatch({
        type: CHANGE_RANGE_DATA,
        data: _data,
      });
    },
    [rowData, dispatch],
  );

  const deleteRangeHandler = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();
      dispatch({
        type: DELETE_RANGE,
        rangeID: rowData.id,
      });
    },
    [rowData, dispatch],
  );

  return (
    <tr
      css={
        highlight.isActive
          ? HighlightedRowStyle
          : Object.prototype.hasOwnProperty.call(
              rowData,
              'isConstantlyHighlighted',
            ) && rowData.isConstantlyHighlighted === true
          ? ConstantlyHighlightedRowStyle
          : null
      }
      {...highlight.onHover}
    >
      <td
        rowSpan={rowData.rowSpan}
        style={rowData.hide === true ? { display: 'none' } : null}
      >
        {rowData.index}
      </td>
      <td>
        {rowData.signal.multiplicity === 's' || rowData.signal.j
          ? rowData.signal.delta.toFixed(3)
          : `${rowData.from.toFixed(2)} - ${rowData.to.toFixed(2)}`}
      </td>
      <td
        rowSpan={rowData.rowSpan}
        style={rowData.hide === true ? { display: 'none' } : null}
      >
        {rowData.kind === 'signal'
          ? rowData.integral.toFixed(2)
          : `[${rowData.integral.toFixed(2)}]`}
      </td>
      <td
        rowSpan={rowData.rowSpan}
        style={rowData.hide === true ? { display: 'none' } : null}
      >
        {rowData.absolute.toFixed(1)}
      </td>
      <td>{rowData.signal.multiplicity}</td>
      <td>
        {rowData.signal.j
          ? rowData.signal.j
              .map((coupling) => coupling.coupling.toFixed(1))
              .join(', ')
          : ''}
      </td>
      <td
        rowSpan={rowData.rowSpan}
        style={rowData.hide === true ? { display: 'none' } : null}
      >
        <Select
          onChange={(value) => changeRangeSignalKindHandler(value)}
          data={SignalKinds}
          defaultValue={rowData.kind}
          style={selectStyle}
        />
      </td>
      <td
        rowSpan={rowData.rowSpan}
        style={rowData.hide === true ? { display: 'none' } : null}
      >
        <button
          type="button"
          className="delete-button"
          onClick={(e) => deleteRangeHandler(e)}
        >
          <FaRegTrashAlt />
        </button>
      </td>
    </tr>
  );
};

const RangesTable = ({ rangesData, element }) => {
  const data = useMemo(() => {
    const temp = JSON.parse(JSON.stringify(rangesData));
    if (temp.length > 0) {
      if (temp[1].signal.length === 1) {
        temp[1].signal.push(temp[2].signal[0]);
        // temp[1].signal.push(temp[1].signal[0]);
      }
    }

    const _rangesData = [];
    // rangesData.forEach((range, i) => {
    temp.forEach((range, i) => {
      if (range.signal.length <= 1) {
        _rangesData.push({
          ...range,
          signal: range.signal[0],
          index: i + 1,
          original: range,
        });
      } else {
        range.signal.forEach((signal, j) => {
          //   let position = null;
          let hide = false;
          let rowSpan = null;
          if (j < range.signal.length - 1) {
            if (j === 0) {
              //   position = 'top';
              rowSpan = range.signal.length;
            } else {
              //   position = 'middle';
              hide = true;
            }
          } else {
            //   position = 'bottom';
            hide = true;
          }

          _rangesData.push({
            ...range,
            signal,
            rowSpan,
            // position,
            hide,
            index: i + 1,
            original: range,
          });
        });
      }
    });

    return _rangesData;
  }, [rangesData]);

  useEffect(() => {
    console.log(data);
  }, [data]);

  return (
    <div>
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>#</th>
            <th>δ (ppm)</th>
            <th>Rel. {element}</th>
            <th>Absolute</th>
            <th>Mult</th>
            <th>J (Hz)</th>
            <th>Kind</th>
            <th>{''}</th>
          </tr>
          {data &&
            data.map((range, i) => {
              return (
                <RangesTableRow
                  rowData={data[i]}
                  // eslint-disable-next-line react/no-array-index-key
                  key={`rangesTableRow${i}`}
                />
              );
            })}
        </tbody>
      </table>
    </div>
  );
};

export default RangesTable;
