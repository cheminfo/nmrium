/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { getLinkDim, Types } from 'nmr-correlation';
import { useCallback, useMemo, useState } from 'react';

import CloseButton from '../../../../elements/CloseButton';
import Tab from '../../../../elements/Tab/Tab';
import Tabs, { PositionsEnum } from '../../../../elements/Tab/Tabs';
import { getEditedCorrelations } from '../../Utilities';

import EditLinkConfirmation from './Confirmation';
import EditPathLengths from './EditPathLengths';
import MoveLink from './MoveLink';

const modalContainer = css`
  width: 490px;
  height: 220px;
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

  .tabs-container {
    width: 100%;
    flex: 1;
    overflow: auto;
    border: none;
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
  const [activeTab, setActiveTab] = useState<string>('move');

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
      action: 'move' | 'remove' | 'unmove' | 'setPathLength',
      selectedCorrelationIdDim1: string | undefined,
      selectedCorrelationIdDim2: string | undefined,
      editedLink?: Types.Link,
    ) => {
      const { editedCorrelations, buildCorrelationDataOptions } =
        getEditedCorrelations({
          correlationDim1,
          correlationDim2,
          selectedCorrelationIdDim1,
          selectedCorrelationIdDim2,
          action,
          link: editedLink || link,
          correlations,
        });
      onEdit(
        editedCorrelations,
        action,
        editedLink || link,
        buildCorrelationDataOptions,
      );

      onClose?.();
    },
    [correlationDim1, correlationDim2, correlations, link, onClose, onEdit],
  );

  const tabsContainer = useMemo(
    () => (
      <div className="tabs-container">
        <Tabs
          position={PositionsEnum.TOP}
          activeTab={activeTab}
          onClick={(tab) => setActiveTab(tab.tabid)}
        >
          <Tab tablabel="Move" tabid={'move'}>
            <MoveLink
              correlationDim1={correlationDim1}
              correlationDim2={correlationDim2}
              link={link}
              correlations={correlations}
              onEdit={(correlationIdDim1, correlationIdDim2) =>
                handleOnEdit('move', correlationIdDim1, correlationIdDim2)
              }
            />
          </Tab>
          <Tab tablabel="Unmove" tabid="unmove">
            <EditLinkConfirmation
              description="Movement of signal to its original place."
              onConfirm={() =>
                handleOnEdit('unmove', correlationDim1.id, correlationDim2.id)
              }
            />
          </Tab>
          <Tab tablabel="Remove" tabid={'remove'}>
            <EditLinkConfirmation
              description="Deletion of signal."
              onConfirm={() => handleOnEdit('remove', undefined, undefined)}
            />
          </Tab>
          <Tab tablabel="J Coupling" tabid={'setPathLength'}>
            <EditPathLengths
              link={link}
              onEdit={(editedLink) =>
                handleOnEdit(
                  'setPathLength',
                  correlationDim1,
                  correlationDim2,
                  editedLink,
                )
              }
            />
          </Tab>
        </Tabs>
      </div>
    ),
    [
      activeTab,
      correlationDim1,
      correlationDim2,
      correlations,
      handleOnEdit,
      link,
    ],
  );

  return (
    <div css={modalContainer}>
      <div className="header handle">
        <CloseButton onClick={onClose} />
        <p className="header-info">{`${link.experimentType.toUpperCase()} signal at ${getLinkLabel()}`}</p>
      </div>
      {tabsContainer}
    </div>
  );
}
