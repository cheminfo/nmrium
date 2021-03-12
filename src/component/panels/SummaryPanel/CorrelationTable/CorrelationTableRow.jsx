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
    const ids = [correlation.signal.id].concat(
      correlation.link.map((link) => link.signal.id),
    );
    const id = findRangeOrZoneID(spectraData, correlation);
    if (id) {
      ids.push(id);
    }
    correlation.link.forEach((link) => {
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
          onEdit={onEditAdditionalColumnField}
        />
      );
    });
  }, [
    additionalColumnData,
    correlation,
    correlations,
    onEditAdditionalColumnField,
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

  return (
    <tr
      style={{
        ...styleRow,
        backgroundColor: highlightCorrelation.isActive
          ? '#ff6f0057'
          : styleRow.backgroundColor,
      }}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      <td>
        {correlation.getExperimentType()
          ? correlation.getExperimentType().toUpperCase()
          : ''}
      </td>
      <td style={styleLabel}>
        {Utilities.getLabel(correlations, correlation)}
      </td>
      <td>
        {lodashGet(correlation.getSignal(), 'delta', false)
          ? correlation.getSignal().delta.toFixed(3)
          : ''}
      </td>
      <td>
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
      <td>
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
      <td style={{ borderRight: '1px solid' }}>
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
