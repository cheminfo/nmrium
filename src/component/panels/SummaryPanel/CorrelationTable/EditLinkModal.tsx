/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { getCorrelationDelta, getLinkDim, Types } from 'nmr-correlation';
import { useCallback, useState } from 'react';

import CloseButton from '../../../elements/CloseButton';
import Select from '../../../elements/Select';
import { getEditedCorrelations } from '../Utilities';

const modalContainer = css`
  overflow: auto;
  width: 400px;
  height: 550px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    align-items: center;

    button {
      height: 36px;
      margin: 2px;
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
    }

    p {
      font-weight: bold;

      margin-bottom: 5px;
      margin-right: 30px;
      padding: 0px 10px;
      width: 100%;

      text-align: center;
    }
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
    width: 20%;

    color: white;
    background-color: gray;
  }

  .info {
    margin-top: 0;
    margin-bottom: 10px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }

  .optional {
    margin-top: 20px;
    margin-bottom: 5px;
    padding: 0px 10px;

    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
  .optional2 {
    margin-top: 5px;
    margin-bottom: 25px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }

  .selection-container {
    width: 100%;
    text-align: center;
    .selection-box {
      height: 25px;
      border: 1px solid grey;
    }
  }
`;

export default function EditLinkModal({
  correlationDim1,
  correlationDim2,
  link,
  correlations,
  onClose,
  onEdit,
}) {
  const [selectedCorrelationValueDim1, setSelectedCorrelationValueDim1] =
    useState<string>(correlationDim1.id);
  const [selectedCorrelationValueDim2, setSelectedCorrelationValueDim2] =
    useState<string>(correlationDim2?.id || undefined);

  const getLinkLabel = useCallback(() => {
    const linkDim = getLinkDim(link);
    if (linkDim === 1) {
      return ` 1D (${link.signal.delta.toFixed(3)})`;
    } else if (linkDim === 2) {
      return `${link.signal.x ? `${link.signal.x.delta.toFixed(2)}` : '?'} (${
        correlationDim1.label.origin
      }), ${link.signal.y ? link.signal.y.delta.toFixed(2) : '?'} (${
        correlationDim2.label.origin
      })`;
    }

    return '';
  }, [correlationDim1.label.origin, link, correlationDim2]);

  function getCorrelationLabel(correlation: Types.Correlation) {
    const delta = getCorrelationDelta(correlation);
    return `${delta ? delta.toFixed(2) : '?'}`;
  }

  const onEditHandler = useCallback(
    (action: string) => {
      const { editedCorrelations, buildCorrelationDataOptions } =
        getEditedCorrelations({
          correlationDim1,
          correlationDim2,
          selectedCorrelationValueDim1,
          selectedCorrelationValueDim2,
          action,
          link,
          correlations,
        });

      onEdit(editedCorrelations, action, link, buildCorrelationDataOptions);

      onClose?.();
    },
    [
      correlationDim1,
      correlationDim2,
      correlations,
      link,
      onClose,
      onEdit,
      selectedCorrelationValueDim1,
      selectedCorrelationValueDim2,
    ],
  );

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
        label: 'new',
      });

      return (
        <Select
          className="selection-box"
          onChange={(selection: string) => {
            if (dim === 0) {
              setSelectedCorrelationValueDim1(selection);
            } else {
              setSelectedCorrelationValueDim2(selection);
            }
          }}
          data={selectionData}
          defaultValue={correlation.id}
        />
      );
    },
    [correlations, link.atomType],
  );

  return (
    <div css={modalContainer}>
      <div className="header handle">
        <CloseButton onClick={onClose} />
        <p className="header-info">{`${link.experimentType.toUpperCase()} signal at ${getLinkLabel()}`}</p>
      </div>
      <button type="button" onClick={() => onEditHandler('remove')}>
        Delete
      </button>
      <p className="optional">OR</p>
      <div>
        <div className="selection-container">
          {getSelection(correlationDim1, 0)}
          {correlationDim2 && getSelection(correlationDim2, 1)}
        </div>
        <button type="button" onClick={() => onEditHandler('move')}>
          Move
        </button>
      </div>
      {link.edited?.moved === true && (
        <div>
          <p className="optional">OR</p>
          <button type="button" onClick={() => onEditHandler('unmove')}>
            Unmove
          </button>
        </div>
      )}

      <div />
    </div>
  );
}
