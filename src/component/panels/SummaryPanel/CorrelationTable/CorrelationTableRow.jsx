import lodash from 'lodash';
import { useCallback, useMemo } from 'react';

import { getLabel } from '../../../../data/correlation/Utilities';
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

const CorrelationTableRow = ({
  additionalColumnData,
  correlations,
  correlation,
  styleRow,
  styleLabel,
  onSaveEditEquivalences,
  onChangeHybridization,
  onSaveEditProtonsCount,
  onEditAdditionalColumnField,
}) => {
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

  const additionalColumnFields = useMemo(
    () =>
      additionalColumnData.map((_correlation) => (
        <AdditionalColumnField
          key={`addColData_${correlation.getID()}_${_correlation.getID()}`}
          correlation={correlation}
          fieldCorrelation={_correlation}
          onEdit={onEditAdditionalColumnField}
        />
      )),
    [additionalColumnData, correlation, onEditAdditionalColumnField],
  );

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
      <td style={styleLabel}>{getLabel(correlations, correlation)}</td>
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
                correlation.getEquivalences() > 0
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
          ) : correlation.getEquivalences() > 0 ? (
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
};

export default CorrelationTableRow;
