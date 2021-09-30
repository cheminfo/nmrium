import lodashGet from 'lodash/get';
import { buildLink, getLabel } from 'nmr-correlation';
import { CSSProperties, useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import EditableColumn from '../../../elements/EditableColumn';
import Select from '../../../elements/Select';
import { useHighlight } from '../../../highlight';
import { findRangeOrZoneID } from '../Utilities';

import AdditionalColumnField from './AdditionalColumnField';
import { Hybridizations } from './Constants';

const selectBoxStyle: CSSProperties = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

function CorrelationTableRow({
  additionalColumnData,
  correlations,
  correlation,
  styleRow,
  styleLabel,
  onSaveEditEquivalences,
  onChangeHybridization,
  onSaveEditProtonsCount,
  onEditAdditionalColumnField,
  spectraData,
}) {
  const highlightIDsRow = useMemo(() => {
    if (correlation.pseudo === true) {
      return [];
    }
    const ids = [
      correlation.signal.id,
      buildID(correlation.signal.id, 'Crosshair_Y'),
    ];

    const id = findRangeOrZoneID(spectraData, correlation, true);
    if (id) {
      ids.push(id);
    }

    correlation.link.forEach((link) => {
      if (link.pseudo === false) {
        ids.push(link.signal.id);
        ids.push(buildID(link.signal.id, 'Crosshair_Y'));
        const _id = findRangeOrZoneID(spectraData, link, true);
        if (_id) {
          ids.push(_id);
        }
      }
    });

    return ids;
  }, [correlation, spectraData]);
  const highlightRow = useHighlight(highlightIDsRow);

  const onSaveEquivalencesHandler = useCallback(
    (e) => {
      onSaveEditEquivalences(correlation, e.target.value);
    },
    [correlation, onSaveEditEquivalences],
  );

  const onSaveProtonsCountHandler = useCallback(
    (e) => {
      onSaveEditProtonsCount(correlation, e.target.value);
    },
    [correlation, onSaveEditProtonsCount],
  );

  const additionalColumnFields = useMemo(() => {
    return additionalColumnData.map((_correlation) => {
      const commonLinks: any[] = [];
      correlation.link.forEach((link) => {
        _correlation.link.forEach((_link) => {
          if (
            link.axis !== _link.axis &&
            link.experimentID === _link.experimentID &&
            link.signal.id === _link.signal.id
          ) {
            let experimentLabel = link.experimentType;
            if (link.signal && link.signal.sign !== 0) {
              experimentLabel += ' (DEPT)';
            }
            commonLinks.push(
              buildLink({
                ...link,
                experimentLabel,
                axis: undefined,
                id: `${link.id}_${_link.id}`,
              }),
            );
          }
        });
      });

      return (
        <AdditionalColumnField
          key={`addColData_${correlation.id}_${_correlation.id}`}
          rowCorrelation={correlation}
          columnCorrelation={_correlation}
          commonLinks={commonLinks}
          correlations={correlations}
          spectraData={spectraData}
          onEdit={onEditAdditionalColumnField}
        />
      );
    });
  }, [
    additionalColumnData,
    correlation,
    correlations,
    onEditAdditionalColumnField,
    spectraData,
  ]);

  const onChangeHybridizationHandler = useCallback(
    (value) => {
      onChangeHybridization(correlation, value);
    },
    [correlation, onChangeHybridization],
  );

  const equivalenceCellStyle = useMemo(() => {
    return correlation.edited.equivalence
      ? { backgroundColor: '#F7F2E0' }
      : {
          color: correlation.equivalence === 1 ? '#bebebe' : 'black',
        };
  }, [correlation]);

  const mouseEnterHandler = useCallback(
    (event) => {
      event.currentTarget.focus();
      highlightRow.show();
    },
    [highlightRow],
  );
  const mouseLeaveHandler = useCallback(
    (event) => {
      event.currentTarget.blur();
      highlightRow.hide();
    },
    [highlightRow],
  );

  const tableDataProps = useMemo(() => {
    return {
      style: {
        ...styleRow,
        backgroundColor: highlightRow.isActive ? '#ff6f0057' : 'inherit',
      },
      title:
        correlation.pseudo === false &&
        // eslint-disable-next-line @typescript-eslint/require-array-sort-compare
        [correlation.experimentType.toUpperCase()]
          .concat(
            correlation.link.reduce((arr, link) => {
              if (
                link.pseudo === false &&
                link.experimentType !== correlation.experimentType &&
                !arr.includes(link.experimentType.toUpperCase())
              ) {
                arr.push(link.experimentType.toUpperCase());
              }
              return arr;
            }, []),
          )
          .sort()
          .join('/'),
      onMouseEnter: mouseEnterHandler,
      onMouseLeave: mouseLeaveHandler,
    };
  }, [
    correlation.experimentType,
    correlation.link,
    correlation.pseudo,
    highlightRow.isActive,
    mouseEnterHandler,
    mouseLeaveHandler,
    styleRow,
  ]);

  const { title, ...otherTableDataProps } = tableDataProps;
  const t = !title ? '' : title;

  return (
    <tr style={styleRow}>
      <td
        title={t}
        {...{
          ...otherTableDataProps,
          style: { ...tableDataProps.style, styleLabel },
        }}
      >
        {getLabel(correlations, correlation)}
      </td>
      <td title={t} {...otherTableDataProps}>
        {lodashGet(correlation.signal, 'delta', false)
          ? correlation.signal.delta.toFixed(2)
          : ''}
      </td>
      <td title={t} {...otherTableDataProps}>
        {correlation.pseudo === false ? (
          correlation.atomType !== 'H' ? (
            <EditableColumn
              type="number"
              value={correlation.equivalence}
              style={equivalenceCellStyle}
              onSave={onSaveEquivalencesHandler}
            />
          ) : (
            <text style={equivalenceCellStyle}>{correlation.equivalence}</text>
          )
        ) : (
          ''
        )}
      </td>
      <td title={t} {...otherTableDataProps}>
        {correlation.atomType !== 'H' ? (
          <EditableColumn
            type="text"
            value={correlation.protonsCount.join(',')}
            style={
              correlation.edited.protonsCount
                ? { backgroundColor: '#F7F2E0' }
                : {}
            }
            onSave={onSaveProtonsCountHandler}
          />
        ) : (
          ''
        )}
      </td>
      <td
        title={t}
        {...{
          ...otherTableDataProps,
          style: { ...tableDataProps.style, borderRight: '1px solid' },
        }}
      >
        {correlation.atomType !== 'H' ? (
          <Select
            onChange={onChangeHybridizationHandler}
            data={Hybridizations}
            defaultValue={correlation.hybridization}
            style={{
              ...selectBoxStyle,
              backgroundColor: correlation.edited.hybridization
                ? '#F7F2E0'
                : styleRow.backgroundColor,
              width: '50px',
            }}
          />
        ) : (
          ''
        )}
      </td>
      {additionalColumnFields}
    </tr>
  );
}

export default CorrelationTableRow;
