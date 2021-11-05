/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { getCorrelationDelta, Types } from 'nmr-correlation';
import { useCallback, useState } from 'react';

import Select from '../../../../elements/Select';

const moveLinkStyles = css`
  width: 100%;
  height: 100%;
  margin-top: 10px;
  text-align: center;

  p {
    font-size: 14px;
  }

  .selection-container {
    margin-top: 10px;
    width: 100%;
    text-align: center;
  }

  button {
    flex: 2;
    padding: 5px;
    border: 1px solid gray;
    border-radius: 5px;
    height: 30px;
    margin: 0 auto;
    margin-top: 15px;
    display: block;
    width: 60px;

    color: white;
    background-color: gray;
  }
`;

interface MoveLinkProps {
  correlationDim1: Types.Correlation;
  correlationDim2: Types.Correlation;
  link: Types.Link;
  correlations: Types.Correlation[];
  onEdit: (
    action: string,
    valueDim1: string,
    valueDim2: string | undefined,
  ) => void;
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

  function getCorrelationLabel(correlation: Types.Correlation) {
    const delta = getCorrelationDelta(correlation);
    return `${delta ? delta.toFixed(2) : '?'}`;
  }

  const getSelection = useCallback(
    (correlation: Types.Correlation, dim: 0 | 1) => {
      const selectionData = correlations.reduce((arr, _correlation) => {
        if (
          _correlation.pseudo === false &&
          _correlation.atomType === link.atomType[dim]
        ) {
          arr.push({
            key: _correlation.id,
            value: _correlation.id,
            label: `${_correlation.label.origin}: ${getCorrelationLabel(
              _correlation,
            )}`,
          });
        }
        return arr;
      }, []);
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
          data={selectionData}
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
    <div css={moveLinkStyles}>
      <p>Move of signals on either one or both axes.</p>
      <p>&quot;New&quot; means to separate into a new row or column.</p>
      <div className="selection-container">
        {getSelection(correlationDim1, 0)}
        {correlationDim2 && getSelection(correlationDim2, 1)}
      </div>
      <button
        type="button"
        onClick={() =>
          onEdit('move', selectedCorrelationIdDim1, selectedCorrelationIdDim2)
        }
      >
        Move
      </button>
    </div>
  );
}

export default MoveLink;
