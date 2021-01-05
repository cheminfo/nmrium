import lodash from 'lodash';
import { useCallback, useMemo } from 'react';

import { getLabel } from '../../../../data/correlation/Utilities';
import EditableColumn from '../../../elements/EditableColumn';
import SelectUncontrolled from '../../../elements/SelectUncontrolled';

import { Hybridizations } from './Constants';

const selectBoxStyle = {
  marginLeft: 2,
  marginRight: 2,
  border: 'none',
  height: '20px',
};

const CorrelationTableRow = ({
  additionalColumns,
  correlations,
  correlation,
  styleRow,
  styleLabel,
  onSaveEditEquivalences,
  onChangeHybridization,
  onSaveEditProtonsCount,
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

  const additionalColumnsData = useMemo(
    () =>
      additionalColumns.map((_correlation) => {
        let content = [];
        correlation.getLinks().forEach((link) => {
          _correlation.getLinks().forEach((_link) => {
            if (
              link.getAxis() !== _link.getAxis() &&
              link.getExperimentID() === _link.getExperimentID() &&
              link.getSignalID() === _link.getSignalID()
            ) {
              if (
                link.getExperimentType() === 'hsqc' ||
                link.getExperimentType() === 'hmqc'
              ) {
                content.push('S');
              } else if (
                link.getExperimentType() === 'hmbc' ||
                link.getExperimentType() === 'cosy' ||
                link.getExperimentType() === 'tocsy'
              ) {
                content.push('M');
              } else if (
                link.getExperimentType() === 'noesy' ||
                link.getExperimentType() === 'roesy'
              ) {
                content.push('NOE');
              }
            }
          });
        });
        return (
          <td key={`addColData_${correlation.getID()}_${_correlation.getID()}`}>
            {content.join('/')}
          </td>
        );
      }),
    [additionalColumns, correlation],
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
        {
          <EditableColumn
            type="number"
            value={
              correlation.getEquivalences() > 0
                ? correlation.getEquivalences()
                : ''
            }
            style={
              correlation.getEdited().equivalence
                ? { padding: '0.4rem', backgroundColor: '#F7F2E0' }
                : { padding: '0.4rem' }
            }
            onSave={onSaveEquivalencesHandler}
          />
        }
      </td>
      <td>
        {correlation.getAtomType() !== 'H' ? (
          <EditableColumn
            type="text"
            value={correlation.getProtonsCount().join(',')}
            style={
              correlation.getEdited().protonsCount
                ? { padding: '0.4rem', backgroundColor: '#F7F2E0' }
                : { padding: '0.4rem' }
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
      {additionalColumnsData}
    </tr>
  );
};

export default CorrelationTableRow;
