/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodash from 'lodash';
import { useMemo } from 'react';

import Correlation from '../../../../data/correlation/Correlation';
import {
  getAtoms,
  getCorrelationsByAtomType,
} from '../../../../data/correlation/Utilities';
import { getLabelColor } from '../Utilities';

import CorrelationTableRow from './CorrelationTableRow';

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
    white-space: nowrap;
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

const CorrelationTable = ({
  correlations,
  additionalColumns,
  editCountSaveHandler,
}) => {
  const rows = useMemo(() => {
    const _rows = [];
    if (!correlations) {
      return _rows;
    }

    const atoms = getAtoms(correlations);

    Object.keys(atoms).forEach((atomType) => {
      const correlationsAtomType = getCorrelationsByAtomType(
        correlations.values,
        atomType,
      );
      if (atomType !== 'H') {
        // for all heavy atoms
        for (let j = 0; j < atoms[atomType]; j++) {
          if (
            correlationsAtomType.length > 0 &&
            j < correlationsAtomType.length
          ) {
            const correlation = correlationsAtomType[j];
            _rows.push(
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations.values}
                correlation={correlation}
                key={`correlation${atomType}${correlation.getID()}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={{
                  color: getLabelColor(correlations, correlation),
                }}
                onSaveEditCount={editCountSaveHandler}
              />,
            );
            lodash
              .get(correlation.getAttachments(), 'H', [])
              .forEach((index) => {
                const correlationProton = correlations.values[index];
                _rows.push(
                  <CorrelationTableRow
                    additionalColumns={additionalColumns}
                    correlations={correlations.values}
                    correlation={correlationProton}
                    key={`correlation${atomType}${correlationProton.getID()}_${correlation.getID()}`}
                    styleRow={{ backgroundColor: 'white' }}
                    styleLabel={{
                      color: getLabelColor(correlations, correlationProton),
                    }}
                    onSaveEditCount={editCountSaveHandler}
                  />,
                );
              });
          } else {
            const pseudoCorrelation = new Correlation({
              label: {
                origin:
                  correlationsAtomType.length > 0
                    ? `[${atomType}${j + 1}]` // put brackets around label if it is a missing atom
                    : `${atomType}${j + 1}`,
              },
              atomType,
            });
            // add placeholder rows for missing atoms
            _rows.push(
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations.values}
                correlation={pseudoCorrelation}
                key={`placeholder_correlation$_${_rows.length}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={{
                  color: getLabelColor(correlations, pseudoCorrelation),
                }}
              />,
            );
          }
        }
        if (correlationsAtomType.length > atoms[atomType]) {
          for (let k = atoms[atomType]; k < correlationsAtomType.length; k++) {
            const correlation = correlationsAtomType[k];
            _rows.push(
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations.values}
                correlation={correlation}
                key={`correlation${atomType}${correlation.getID()}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={{
                  color: getLabelColor(correlations, correlation),
                }}
                onSaveEditCount={editCountSaveHandler}
              />,
            );
            lodash
              .get(correlation.getAttachments(), 'H', [])
              .forEach((index) => {
                const correlationProton = correlations.values[index];
                _rows.push(
                  <CorrelationTableRow
                    additionalColumns={additionalColumns}
                    correlations={correlations.values}
                    correlation={correlationProton}
                    key={`correlation${atomType}${correlationProton.getID()}_${correlation.getID()}`}
                    styleRow={{ backgroundColor: 'white' }}
                    styleLabel={{
                      color: getLabelColor(correlations, correlationProton),
                    }}
                    onSaveEditCount={editCountSaveHandler}
                  />,
                );
              });
          }
        }
      } else {
        // in case of protons which are not attached
        for (let k = 0; k < correlationsAtomType.length; k++) {
          const correlationProton = correlationsAtomType[k];
          if (Object.keys(correlationProton.getAttachments()).length === 0) {
            _rows.push(
              <CorrelationTableRow
                additionalColumns={additionalColumns}
                correlations={correlations.values}
                correlation={correlationProton}
                key={`correlation${atomType}${correlationProton.getID()}`}
                styleRow={{ backgroundColor: 'mintcream' }}
                styleLabel={{
                  color: getLabelColor(correlations, correlationProton),
                }}
                onSaveEditCount={editCountSaveHandler}
              />,
            );
          }
        }
      }

      return _rows;
    });

    return _rows;
  }, [additionalColumns, correlations, editCountSaveHandler]);

  return (
    <div className="table-container">
      <table css={tableStyle}>
        <tbody>
          <tr>
            <th>Exp</th>
            <th>Atom</th>
            <th>δ (ppm)</th>
            <th>Count</th>
            {additionalColumns.map((experiment) => (
              <th key={`expCol_${experiment}`}>{experiment.toUpperCase()}</th>
            ))}
          </tr>
          {rows}
        </tbody>
      </table>
    </div>
  );
};

export default CorrelationTable;
