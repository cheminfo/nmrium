import styled from '@emotion/styled';
import type { Correlation, Link } from 'nmr-correlation';
import { getCorrelationDelta } from 'nmr-correlation';
import { useCallback, useState } from 'react';

import Select from '../../../../elements/Select.js';

const Container = styled.div`
  height: 100%;
  margin-top: 10px;
  text-align: center;
  width: 100%;

  p {
    font-size: 14px;
  }

  .selection-container {
    margin-top: 10px;
    text-align: center;
    width: 100%;
  }

  button {
    background-color: gray;
    border: 1px solid gray;
    border-radius: 5px;
    color: white;
    display: block;
    flex: 2;
    height: 30px;
    margin: 0 auto;
    margin-top: 15px;
    padding: 5px;
    width: 60px;
  }
`;

interface MoveLinkProps {
  correlationDim1: Correlation;
  correlationDim2: Correlation;
  link: Link;
  correlations: Correlation[];
  onEdit: (
    correlationIdDim1: string,
    correlationIdDim2: string | undefined,
  ) => void;
}

function getCorrelationLabel(correlation: Correlation) {
  const delta = getCorrelationDelta(correlation);
  return delta ? delta.toFixed(2) : '?';
}

function MoveLink({
  correlationDim1,
  correlationDim2,
  link,
  correlations,
  onEdit,
}: MoveLinkProps) {
  const [selectedCorrelationIdDim1, setSelectedCorrelationIdDim1] =
    useState<string>(correlationDim1.id);
  const [selectedCorrelationIdDim2, setSelectedCorrelationIdDim2] =
    useState<string>(correlationDim2?.id || undefined);

  const getSelection = useCallback(
    (correlation: Correlation, dim: 0 | 1) => {
      const selectionData: Array<{
        key?: string;
        value: string;
        label: string;
      }> = [];
      for (const correlation of correlations) {
        if (
          !correlation.pseudo &&
          correlation.atomType === link.atomType[dim]
        ) {
          selectionData.push({
            value: correlation.id,
            label: `${correlation.label.origin}: ${getCorrelationLabel(
              correlation,
            )}`,
          });
        }
      }
      selectionData.push({
        key: 'new',
        value: 'new',
        label: `new -> ${(
          (dim === 0
            ? getCorrelationDelta(correlationDim1)
            : getCorrelationDelta(correlationDim2)) as number
        ).toFixed(2)}`,
      });

      return (
        <Select
          onChange={(selection: string) => {
            if (dim === 0) {
              setSelectedCorrelationIdDim1(selection);
            } else {
              setSelectedCorrelationIdDim2(selection);
            }
          }}
          items={selectionData}
          defaultValue={correlation.id}
          style={{
            width: 110,
            height: 25,
            margin: 0,
            border: '1px solid grey',
          }}
        />
      );
    },
    [correlationDim1, correlationDim2, correlations, link.atomType],
  );

  return (
    <Container>
      <p>Move of signals on either one or both axes.</p>
      <p>&quot;New&quot; means to separate into a new row or column.</p>
      <div className="selection-container">
        {getSelection(correlationDim1, 0)}
        {correlationDim2 && getSelection(correlationDim2, 1)}
      </div>
      <button
        type="button"
        onClick={() =>
          onEdit(selectedCorrelationIdDim1, selectedCorrelationIdDim2)
        }
      >
        Move
      </button>
    </Container>
  );
}

export default MoveLink;
