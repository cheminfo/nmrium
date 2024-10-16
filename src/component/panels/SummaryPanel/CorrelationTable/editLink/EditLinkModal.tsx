/** @jsxImportSource @emotion/react */
import { DialogBody, Tab, Tabs } from '@blueprintjs/core';
import type { Correlation, Link } from 'nmr-correlation';
import { getLinkDim } from 'nmr-correlation';

import { useChartData } from '../../../../context/ChartContext.js';
import type { DialogProps } from '../../../../elements/DialogManager.js';
import { DraggableDialog } from '../../../../elements/DraggableDialog.js';
import type { OnEditCorrelationCallback } from '../../SummaryPanel.js';
import { getEditedCorrelations } from '../../utilities/Utilities.js';

import EditLinkConfirmation from './Confirmation.js';
import EditPathLength from './EditPathLength.js';
import MoveLink from './MoveLink.js';

export interface EditLinkDialogData {
  correlationDim1: Correlation;
  correlationDim2: Correlation;
  link: Link;
}
interface EditLinkModalProps extends DialogProps<EditLinkDialogData> {
  onEdit: OnEditCorrelationCallback;
}

export function EditLinkModal(props: EditLinkModalProps) {
  const { onCloseDialog, dialogData, onEdit } = props;
  const { correlations: correlationData } = useChartData();
  const correlations: Correlation[] = correlationData?.values || [];
  const { correlationDim1, correlationDim2, link } = dialogData;

  function getLinkLabel() {
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
  }

  function handleOnEdit(
    action: 'move' | 'remove' | 'unmove' | 'setPathLength',
    selectedCorrelationIdDim1: string | undefined,
    selectedCorrelationIdDim2: string | undefined,
    editedLink?: Link,
  ) {
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

    onCloseDialog?.();
  }

  return (
    <DraggableDialog
      hasBackdrop={false}
      canOutsideClickClose={false}
      style={{ width: 500 }}
      title={`${link.experimentType.toUpperCase()} signal at ${getLinkLabel()}`}
      isOpen
      onClose={onCloseDialog}
      placement="center-right"
    >
      <DialogBody>
        <Tabs defaultSelectedTabId="move">
          <Tab
            title="Move"
            id="move"
            panel={
              <MoveLink
                correlationDim1={correlationDim1}
                correlationDim2={correlationDim2}
                link={link}
                correlations={correlations}
                onEdit={(correlationIdDim1, correlationIdDim2) =>
                  handleOnEdit('move', correlationIdDim1, correlationIdDim2)
                }
              />
            }
          />

          <Tab
            title="Unmove"
            id="unmove"
            panel={
              <EditLinkConfirmation
                description="Movement of signal to its original place."
                onConfirm={() =>
                  handleOnEdit('unmove', correlationDim1.id, correlationDim2.id)
                }
              />
            }
          />

          <Tab
            title="Remove"
            id="remove"
            panel={
              <EditLinkConfirmation
                description="Deletion of signal."
                onConfirm={() => handleOnEdit('remove', undefined, undefined)}
              />
            }
          />

          <Tab
            title="J Coupling"
            id="setPathLength"
            panel={
              <EditPathLength
                signal={link.signal}
                experimentType={link.experimentType}
                onEdit={(editedSignal) => {
                  const editedLink = { ...link, signal: editedSignal };
                  handleOnEdit(
                    'setPathLength',
                    correlationDim1,
                    correlationDim2,
                    editedLink,
                  );
                }}
              />
            }
          />
        </Tabs>
      </DialogBody>
    </DraggableDialog>
  );
}
