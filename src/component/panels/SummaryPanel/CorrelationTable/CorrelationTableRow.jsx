import lodashGet from 'lodash/get';
import { Link, Utilities } from 'nmr-correlation';
import { useCallback, useMemo } from 'react';

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
  const highlightIDs = useMemo(() => {
    if (correlation.getPseudo() === true) {
      return [];
    }
    const ids = [correlation.signal.id];
    const id = findRangeOrZoneID(spectraData, correlation);
    if (id) {
      ids.push(id);
    }
    correlation.link.forEach((link) => {
      ids.push(link.signal.id);
      const _id = findRangeOrZoneID(spectraData, link);
      if (_id) {
        ids.push(_id);
      }
    });

    return ids;
  }, [correlation, spectraData]);
  const highlightCorrelation = useHighlight(highlightIDs);

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
      correlation.getLinks().forEach((link) => {
        _correlation.getLinks().forEach((_link) => {
          if (
            link.getAxis() !== _link.getAxis() &&
            link.getExperimentID() === _link.getExperimentID() &&
            link.getSignalID() === _link.getSignalID()
          ) {
            let experimentLabel = link.getExperimentType();
            if (link.getSignal() && link.getSignal().sign !== 0) {
              experimentLabel += ' (edited)';
            }
            commonLinks.push(
              new Link({
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
          key={`addColData_${correlation.getID()}_${_correlation.getID()}`}
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
    return correlation.getEdited().equivalence
      ? { backgroundColor: '#F7F2E0' }
      : {
          color: correlation.getEquivalences() === 1 ? '#bebebe' : 'black',
        };
  }, [correlation]);

  const mouseEnterHandler = useCallback(
    (event) => {
      event.currentTarget.focus();
      highlightCorrelation.show();
    },
    [highlightCorrelation],
  );
  const mouseLeaveHandler = useCallback(
    (event) => {
      event.currentTarget.blur();
      highlightCorrelation.hide();
    },
    [highlightCorrelation],
  );

  const tableDataProps = useMemo(() => {
    return {
      style: {
        ...styleRow,
        backgroundColor: highlightCorrelation.isActive
          ? '#ff6f0057'
          : 'inherit',
      },
      onMouseEnter: mouseEnterHandler,
      onMouseLeave: mouseLeaveHandler,
    };
  }, [
    highlightCorrelation.isActive,
    mouseEnterHandler,
    mouseLeaveHandler,
    styleRow,
  ]);

  return (
    <tr style={styleRow}>
      <td {...tableDataProps}>
        {correlation.getExperimentType()
          ? correlation.getExperimentType().toUpperCase()
          : ''}
      </td>
      <td
        {...{
          ...tableDataProps,
          style: { ...tableDataProps.style, styleLabel },
        }}
      >
        {Utilities.getLabel(correlations, correlation)}
      </td>
      <td {...tableDataProps}>
        {lodashGet(correlation.getSignal(), 'delta', false)
          ? correlation.getSignal().delta.toFixed(3)
          : ''}
      </td>
      <td {...tableDataProps}>
        {correlation.getPseudo() === false ? (
          correlation.getAtomType() !== 'H' ? (
            <EditableColumn
              type="number"
              value={correlation.getEquivalences()}
              style={equivalenceCellStyle}
              onSave={onSaveEquivalencesHandler}
            />
          ) : (
            <text style={equivalenceCellStyle}>
              {correlation.getEquivalences()}
            </text>
          )
        ) : (
          ''
        )}
      </td>
      <td {...tableDataProps}>
        {correlation.getAtomType() !== 'H' ? (
          <EditableColumn
            type="text"
            value={correlation.getProtonsCount().join(',')}
            style={
              correlation.getEdited().protonsCount
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
        {correlation.getAtomType() !== 'H' ? (
          <SelectUncontrolled
            onChange={onChangeHybridizationHandler}
            data={Hybridizations}
            value={correlation.getHybridization()}
            style={{
              ...selectBoxStyle,
              backgroundColor: correlation.getEdited().hybridization
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
