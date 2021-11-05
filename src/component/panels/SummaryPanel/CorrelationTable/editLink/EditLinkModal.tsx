/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { getLinkDim } from 'nmr-correlation';
import { useCallback, useMemo, useState } from 'react';

import CloseButton from '../../../../elements/CloseButton';
import Select from '../../../../elements/Select';
import { getEditedCorrelations } from '../../Utilities';
import { EditLinkActions } from '../Constants';

import EditLinkConfirmation from './Confirmation';
import MoveLink from './MoveLink';

const modalContainer = css`
  overflow: auto;
  width: 380px;
  height: 230px;
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

  .select-action-container {
    margin-top: 10px;
    width: 100%;
    text-align: center;
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
  const [selectedAction, setSelectedActions] = useState<string>('-');

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

  const handleOnEdit = useCallback(
    (
      action: string,
      selectedCorrelationValueDim1,
      selectedCorrelationValueDim2,
    ) => {
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
    [correlationDim1, correlationDim2, correlations, link, onClose, onEdit],
  );

  const component = useMemo(() => {
    switch (selectedAction) {
      case 'delete':
        return (
          <EditLinkConfirmation
            description="Deletion of signal."
            onConfirm={() => handleOnEdit('remove', undefined, undefined)}
          />
        );
      case 'move':
        return (
          <MoveLink
            correlationDim1={correlationDim1}
            correlationDim2={correlationDim2}
            link={link}
            correlations={correlations}
            onEdit={handleOnEdit}
          />
        );
      case 'unmove':
        return (
          <EditLinkConfirmation
            description="Movement of signal to its original place."
            onConfirm={() =>
              handleOnEdit('unmove', correlationDim1.id, correlationDim2.id)
            }
          />
        );
      default:
        return null;
    }
  }, [
    correlationDim1,
    correlationDim2,
    correlations,
    link,
    handleOnEdit,
    selectedAction,
  ]);

  return (
    <div css={modalContainer}>
      <div className="header handle">
        <CloseButton onClick={onClose} />
        <p className="header-info">{`${link.experimentType.toUpperCase()} signal at ${getLinkLabel()}`}</p>
      </div>
      <div className="select-action-container">
        <Select
          data={EditLinkActions}
          onChange={(action) => setSelectedActions(action)}
          defaultValue={selectedAction}
          style={{ width: 120, height: 25, margin: 0 }}
        />
      </div>
      {component}
      <div />
    </div>
  );
}
