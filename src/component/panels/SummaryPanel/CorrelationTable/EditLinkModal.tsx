/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import lodashCloneDeep from 'lodash/cloneDeep';
import {
  addLink,
  buildCorrelation,
  buildLink,
  getCorrelationDelta,
  getCorrelationIndex,
  removeLink,
  Types,
} from 'nmr-correlation';
import { useCallback, useState } from 'react';

import CloseButton from '../../../elements/CloseButton';
import Select from '../../../elements/Select';

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

interface EditLinkModalProps {
  onClose: () => void;
  onEdit: (
    editedColumnCorrelation: Types.Correlation,
    editedRowCorrelation: Types.Correlation,
    experimentType: string,
    action: string,
    commonLink: Types.Link,
    newColumnCorrelation?: Types.Correlation,
    newRowCorrelation?: Types.Correlation,
  ) => void;
  link: Types.Link;
  rowCorrelation: Types.Correlation;
  columnCorrelation: Types.Correlation;
  correlations: Array<Types.Correlation>;
}

export default function EditLinkModal({
  onClose,
  onEdit,
  link,
  rowCorrelation,
  columnCorrelation,
  correlations,
}: EditLinkModalProps) {
  const [selectedColumnCorrelationValue, setSelectedColumnCorrelationValue] =
    useState<string>(columnCorrelation.id);
  const [selectedRowCorrelationValue, setSelectedRowCorrelationValue] =
    useState<string>(rowCorrelation.id);

  const getLinkLabel = useCallback(() => {
    return `${link.signal.x ? `${link.signal.x.delta.toFixed(2)}` : '?'} (${
      rowCorrelation.label.origin
    }), ${link.signal.y ? link.signal.y.delta.toFixed(2) : '?'} (${
      columnCorrelation.label.origin
    })`;
  }, [
    columnCorrelation.label.origin,
    link.signal.x,
    link.signal.y,
    rowCorrelation.label.origin,
  ]);

  function getCorrelationLabel(correlation: Types.Correlation) {
    return `${
      getCorrelationDelta(correlation)
        ? getCorrelationDelta(correlation).toFixed(2)
        : '?'
    }`;
  }

  const onEditHandler = useCallback(
    (action: string) => {
      if (action === 'move') {
        // modify current correlations
        const _columnCorrelation = lodashCloneDeep(columnCorrelation);
        const _rowCorrelation = lodashCloneDeep(rowCorrelation);
        const linkIDs = link.id.split('_');
        removeLink(_columnCorrelation, linkIDs[0]);
        removeLink(_rowCorrelation, linkIDs[1]);

        // modify/create selected correlations
        const selectedColumnCorrelation = correlations.find(
          (correlation) => correlation.id === selectedColumnCorrelationValue,
        );
        const selectedRowCorrelation = correlations.find(
          (correlation) => correlation.id === selectedRowCorrelationValue,
        );

        if (selectedColumnCorrelation && selectedRowCorrelation) {
          const newColumnCorrelation = lodashCloneDeep(
            selectedColumnCorrelation,
          );
          const newRowCorrelation = lodashCloneDeep(selectedRowCorrelation);
          addLink(
            newColumnCorrelation,
            buildLink({
              ...link,
              id: linkIDs[0],
              axis: 'x',
              match: [getCorrelationIndex(correlations, newRowCorrelation)],
              edited: {
                ...link.edited,
                moved: true,
              },
            }),
          );
          addLink(
            newRowCorrelation,
            buildLink({
              ...link,
              id: linkIDs[1],
              axis: 'y',
              match: [getCorrelationIndex(correlations, newColumnCorrelation)],
              edited: {
                ...link.edited,
                moved: true,
              },
            }),
          );
          onEdit(
            _columnCorrelation,
            _rowCorrelation,
            link.experimentType,
            action,
            link,
            newColumnCorrelation,
            newRowCorrelation,
          );
        }
        if (
          selectedColumnCorrelation &&
          selectedRowCorrelationValue === 'new'
        ) {
          const newColumnCorrelation = lodashCloneDeep(
            selectedColumnCorrelation,
          );
          addLink(
            newColumnCorrelation,
            buildLink({
              ...link,
              id: linkIDs[0],
              axis: 'x',
              match: [],
              edited: {
                ...link.edited,
                moved: true,
              },
            }),
          );
          const newRowLink = buildLink({
            ...link,
            id: linkIDs[1],
            axis: 'y',
            match: [getCorrelationIndex(correlations, newColumnCorrelation)],
            edited: {
              ...link.edited,
              moved: true,
            },
          });
          const newRowCorrelation = buildCorrelation({
            atomType: rowCorrelation.atomType,
            link: [newRowLink],
          });

          onEdit(
            _columnCorrelation,
            _rowCorrelation,
            link.experimentType,
            action,
            link,
            newColumnCorrelation,
            newRowCorrelation,
          );
        } else if (
          selectedColumnCorrelationValue === 'new' &&
          selectedRowCorrelation
        ) {
          const newRowCorrelation = lodashCloneDeep(selectedRowCorrelation);
          addLink(
            newRowCorrelation,
            buildLink({
              ...link,
              id: linkIDs[1],
              axis: 'y',
              match: [],
              edited: {
                ...link.edited,
                moved: true,
              },
            }),
          );
          const newColumnLink = buildLink({
            ...link,
            id: linkIDs[0],
            axis: 'x',
            match: [getCorrelationIndex(correlations, newRowCorrelation)],
            edited: {
              ...link.edited,
              moved: true,
            },
          });
          const newColumnCorrelation = buildCorrelation({
            atomType: columnCorrelation.atomType,
            link: [newColumnLink],
          });

          onEdit(
            _columnCorrelation,
            _rowCorrelation,
            link.experimentType,
            action,
            link,
            newColumnCorrelation,
            newRowCorrelation,
          );
        } else if (!selectedColumnCorrelation && !selectedRowCorrelation) {
          const newColumnLink = buildLink({
            ...link,
            id: linkIDs[0],
            axis: 'x',
            match: [],
            edited: {
              ...link.edited,
              moved: true,
            },
          });
          const newColumnCorrelation = buildCorrelation({
            atomType: columnCorrelation.atomType,
            link: [newColumnLink],
          });
          const newRowLink = buildLink({
            ...link,
            id: linkIDs[1],
            axis: 'y',
            match: [],
            edited: {
              ...link.edited,
              moved: true,
            },
          });
          const newRowCorrelation = buildCorrelation({
            atomType: rowCorrelation.atomType,
            link: [newRowLink],
          });

          onEdit(
            _columnCorrelation,
            _rowCorrelation,
            link.experimentType,
            action,
            link,
            newColumnCorrelation,
            newRowCorrelation,
          );
        }
      } else {
        onEdit(
          columnCorrelation,
          rowCorrelation,
          link.experimentType,
          action,
          link,
        );
      }

      onClose?.();
    },
    [
      columnCorrelation,
      correlations,
      link,
      onClose,
      onEdit,
      rowCorrelation,
      selectedColumnCorrelationValue,
      selectedRowCorrelationValue,
    ],
  );

  const getSelection = useCallback(
    (correlation: Types.Correlation, axis: 0 | 1) => {
      const selectionData = correlations.reduce((arr, _correlation) => {
        if (
          _correlation.pseudo === false &&
          _correlation.atomType === link.atomType[axis]
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
            if (axis === 0) {
              setSelectedColumnCorrelationValue(selection);
            } else {
              setSelectedRowCorrelationValue(selection);
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
          {getSelection(columnCorrelation, 0)}
          {getSelection(rowCorrelation, 1)}
        </div>
        <button type="button" onClick={() => onEditHandler('move')}>
          Move
        </button>
      </div>
      <div />
    </div>
  );
}
