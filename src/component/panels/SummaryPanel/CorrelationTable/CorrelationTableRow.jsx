import lodashGet from 'lodash/get';
import { LinkUtilities, GeneralUtilities } from 'nmr-correlation';
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import EditableColumn from '../../../elements/EditableColumn';
import SelectUncontrolled from '../../../elements/SelectUncontrolled';
import { useHighlight } from '../../../highlight';
import { findRangeOrZoneID } from '../Utilities';

import AdditionalColumnField from './AdditionalColumnField';
import { Hybridizations } from './Constants';

const selectBoxStyle = {
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
    const id = findRangeOrZoneID(spectraData, correlation);
    if (id) {
      ids.push(id);
    }
    correlation.link.forEach((link) => {
      if (link.pseudo === false) {
        ids.push(link.signal.id);
        const _id = findRangeOrZoneID(spectraData, link);
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
      const commonLinks = [];
      correlation.link.forEach((link) => {
        _correlation.link.forEach((_link) => {
          if (
            link.axis !== _link.axis &&
            link.experimentID === _link.experimentID &&
            link.signal.id === _link.signal.id
          ) {
            let experimentLabel = link.experimentType;
            if (link.signal && link.signal.sign !== 0) {
              experimentLabel += ' (edited)';
            }
            commonLinks.push(
              LinkUtilities.buildLink({
                ...link,
                experimentLabel,
                axis: undefined,
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
      onMouseEnter: mouseEnterHandler,
      onMouseLeave: mouseLeaveHandler,
    };
  }, [highlightRow.isActive, mouseEnterHandler, mouseLeaveHandler, styleRow]);

  return (
    <tr style={styleRow}>
      <td {...tableDataProps}>
        {correlation.experimentType
          ? correlation.experimentType.toUpperCase()
          : ''}
      </td>
      <td
        {...{
          ...tableDataProps,
          style: { ...tableDataProps.style, styleLabel },
        }}
      >
        {GeneralUtilities.getLabel(correlations, correlation)}
      </td>
      <td {...tableDataProps}>
        {lodashGet(correlation.signal, 'delta', false)
          ? correlation.signal.delta.toFixed(3)
          : ''}
      </td>
      <td {...tableDataProps}>
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
      <td {...tableDataProps}>
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
        {...{
          ...tableDataProps,
          style: { ...tableDataProps.style, borderRight: '1px solid' },
        }}
      >
        {correlation.atomType !== 'H' ? (
          <SelectUncontrolled
            onChange={onChangeHybridizationHandler}
            data={Hybridizations}
            value={correlation.hybridization}
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
