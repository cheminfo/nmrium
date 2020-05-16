/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useMemo, useCallback, useRef } from 'react';

import ContextMenu from '../elements/ContextMenu';

import RangesTableRow from './RangesTableRow';

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

const RangesTable = ({
  rangesData,
  onChangeKind,
  onDelete,
  onUnlink,
  context,
  preferences,
  element,
}) => {
  const contextRef = useRef();

  const data = useMemo(() => {
    // const temp = JSON.parse(JSON.stringify(rangesData));
    // if (temp.length > 0) {
    //   if (temp[1].signal.length === 1) {
    //     temp[1].signal.push(temp[2].signal[0]);
    //   }
    //   if (temp[3].signal.length === 1) {
    //     temp[3].signal.push(temp[4].signal[0]);
    //     temp[3].signal.push(temp[4].signal[0]);
    //   }
    // }

    const _rangesData = [];
    rangesData.forEach((range, i) => {
      // temp.forEach((range, i) => {
      if (range.signal.length <= 1) {
        _rangesData.push({
          ...range,
          tableMetaInfo: {
            ...range.tableMetaInfo,
            signal: range.signal[0],
            index: i + 1,
          },
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
            tableMetaInfo: {
              ...range.tableMetaInfo,
              signal,
              rowSpan,
              // position,
              hide,
              index: i + 1,
            },
          });
        });
      }
    });

    return _rangesData;
  }, [rangesData]);

  const getShowPreference = (showPreference) => {
    return preferences
      ? Object.prototype.hasOwnProperty.call(preferences, showPreference) &&
          preferences[showPreference] === true
      : false;
  };

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, rowData.original);
    },
    [contextRef],
  );

  //   useEffect(() => {
  //     console.log(data);
  //   }, [data]);

  return (
    <div>
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>#</th>
            {getShowPreference('showFrom') ? <th>From</th> : null}
            {getShowPreference('showTo') ? <th>To</th> : null}
            <th>δ (ppm)</th>
            {getShowPreference('showRelative') ? <th>Rel. {element}</th> : null}
            {getShowPreference('showAbsolute') ? <th>Absolute</th> : null}
            <th>Mult</th>
            <th>J (Hz)</th>
            <th>Linked</th>
            <th>Kind</th>
            <th>{''}</th>
          </tr>
          {data &&
            data.map((range, i) => {
              return (
                <RangesTableRow
                  // eslint-disable-next-line react/no-array-index-key
                  key={`rangesTableRow${i}`}
                  rowData={data[i]}
                  onChangeKind={onChangeKind}
                  onDelete={onDelete}
                  onUnlink={onUnlink}
                  onContextMenu={(e) => contextMenuHandler(e, data[i])}
                  preferences={preferences}
                />
              );
            })}
        </tbody>
      </table>
      <ContextMenu ref={contextRef} context={context} />
    </div>
  );
};

export default RangesTable;
