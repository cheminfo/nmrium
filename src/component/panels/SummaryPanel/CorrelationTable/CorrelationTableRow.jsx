import lodash from 'lodash';
// eslint-disable-next-line import/no-extraneous-dependencies
import { Link, Utilities } from 'nmr-correlation';
import { useCallback, useMemo } from 'react';

import EditableColumn from '../../../elements/EditableColumn';
import SelectUncontrolled from '../../../elements/SelectUncontrolled';

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
}) {
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

  return (
    <tr style={styleRow}>
      <td>
        {correlation.getExperimentType()
          ? correlation.getExperimentType().toUpperCase()
          : ''}
      </td>
      <td style={styleLabel}>
        {Utilities.getLabel(correlations, correlation)}
      </td>
      <td>
        {lodash.get(correlation.getSignal(), 'delta', false)
          ? correlation.getSignal().delta.toFixed(3)
          : ''}
      </td>
      <td>
        {correlation.getPseudo() === false ? (
          correlation.getAtomType() !== 'H' ? (
            <EditableColumn
              type="number"
              value={
                correlation.getEquivalences() > 1
                  ? correlation.getEquivalences()
                  : ''
              }
              style={
                correlation.getEdited().equivalence
                  ? { backgroundColor: '#F7F2E0' }
                  : {}
              }
              onSave={onSaveEquivalencesHandler}
            />
          ) : correlation.getEquivalences() > 1 ? (
            correlation.getEquivalences()
          ) : (
            ''
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
