import type { Signal1D } from '@zakodium/nmr-types';
import type { Spectrum } from '@zakodium/nmrium-core';
import type {
  Correlation,
  CorrelationBuildOptions,
  CorrelationData,
  CorrelationLink,
} from 'nmr-processing';
import { correlationApi } from 'nmr-processing';
import type { MouseEvent } from 'react';
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation.js';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities.js';
import { useAlert } from '../../../elements/Alert.js';
import type { ContextMenuItem } from '../../../elements/ContextMenuBluePrint.js';
import { ContextMenu } from '../../../elements/ContextMenuBluePrint.js';
import { useDialog } from '../../../elements/DialogManager.js';
import { useHighlight } from '../../../highlight/index.js';
import { getLabelColor } from '../utilities/Utilities.js';
import useInView from '../utilities/useInView.js';

import type { EditLinkDialogData } from './editLink/EditLinkModal.js';
import { EditLinkModal } from './editLink/EditLinkModal.js';

export interface AdditionalColumnHeaderProps {
  spectraData: Spectrum[];
  correlationsData: CorrelationData;
  correlation: Correlation;
  onEdit: (
    editedCorrelations: Correlation[],
    action: string,
    link?: CorrelationLink,
    options?: CorrelationBuildOptions,
  ) => void;
}

function AdditionalColumnHeader(props: AdditionalColumnHeaderProps) {
  const { spectraData, correlationsData, correlation, onEdit } = props;

  const alert = useAlert();

  const { openDialog } = useDialog();
  const highlightIDsAdditionalColumn = useMemo(() => {
    if (correlation.pseudo) {
      return [];
    }
    return correlation.link.flatMap((link) => {
      const ids: string[] = [];
      if (!link.pseudo) {
        ids.push(link.signal.id, buildID(link.signal.id, 'Crosshair_X'));
        const _id = findRangeOrZoneID(
          spectraData,
          link.experimentID,
          link.signal.id,
          true,
        );
        if (_id) {
          ids.push(_id);
        }
      }
      return ids;
    });
  }, [correlation, spectraData]);
  const highlightAdditionalColumn = useHighlight(highlightIDsAdditionalColumn);

  const mouseEnterHandler = useCallback(
    (event: MouseEvent<HTMLTableCellElement>) => {
      event.currentTarget.focus();
      highlightAdditionalColumn.show();
    },
    [highlightAdditionalColumn],
  );
  const mouseLeaveHandler = useCallback(
    (event: MouseEvent<HTMLTableCellElement>) => {
      event.currentTarget.blur();
      highlightAdditionalColumn.hide();
    },
    [highlightAdditionalColumn],
  );

  const isInView = useInView({ correlation });

  const tableHeaderProps = useMemo(() => {
    const correlationLinks = correlation.link.map((link) => {
      if (!link.pseudo) {
        return link.experimentType.toUpperCase();
      }
      return 'undefined';
    });
    correlationLinks.sort((l1, l2) => l1.localeCompare(l2));
    const title = Array.from(new Set(correlationLinks)).join('/');

    return {
      style: {
        color: getLabelColor(correlationsData, correlation) || undefined,
        backgroundColor: highlightAdditionalColumn.isActive
          ? '#ff6f0057'
          : isInView
            ? '#f5f5dc'
            : 'inherit',
      },
      title: !correlation.pseudo && title,
      onMouseEnter: mouseEnterHandler,
      onMouseLeave: mouseLeaveHandler,
    };
  }, [
    correlation,
    correlationsData,
    highlightAdditionalColumn.isActive,
    isInView,
    mouseEnterHandler,
    mouseLeaveHandler,
  ]);

  const equivalenceTextStyle = useMemo(() => {
    return correlation.edited.equivalence
      ? { backgroundColor: '#F7F2E0' }
      : {
          color: Number.isInteger(correlation.equivalence)
            ? correlation.equivalence === 1
              ? '#bebebe'
              : 'black'
            : 'red',
        };
  }, [correlation]);

  const contextMenu = useMemo(() => {
    if (correlation.pseudo) {
      return [];
    }

    const contextMenus: ContextMenuItem[] = [
      {
        text: `Delete all (${correlation.label.origin})`,
        icon: 'trash',
        data: { action: 'removeAll' },
      },
    ];

    for (const link of correlation.link) {
      const isValidLink = correlationApi.getLinkDim(link) === 1 && !link.pseudo;

      if (isValidLink) {
        const signalDelta = (link.signal as Signal1D).delta;
        const contextMenu: ContextMenuItem = {
          text: `Edit 1D (${signalDelta.toFixed(3)}${
            link.edited?.moved ? '[MOVED]' : ''
          })`,
          icon: 'edit',
          data: {
            action: 'edit',
            data: {
              link,
              correlationDim1: correlation,
              correlationDim2: null,
            },
          },
        };
        contextMenus.push(contextMenu);
      }
    }
    return contextMenus;
  }, [correlation]);

  function removeAllLinks() {
    alert.showAlert({
      message: `All signals of ${correlation.label.origin} (${(
        correlationApi.getCorrelationDelta(correlation) as number
      ).toFixed(2)}) will be deleted. Are you sure?`,
      buttons: [
        {
          text: 'Yes',
          onClick: () => {
            onEdit([correlation], 'removeAll');
          },
          intent: 'danger',
        },
        { text: 'No' },
      ],
    });
    highlightAdditionalColumn.hide();
  }

  function contextMenuHandler(selectedItem: any) {
    const { action, data } = selectedItem;
    switch (action) {
      case 'removeAll': {
        removeAllLinks();
        break;
      }
      case 'edit': {
        highlightAdditionalColumn.hide();
        openDialog<EditLinkDialogData>(EditLinkModal, data);
        break;
      }
      default:
        break;
    }
  }
  const { title, ...thProps } = tableHeaderProps;

  return (
    <ContextMenu
      onSelect={(selected: any) => contextMenuHandler(selected)}
      options={contextMenu}
      as="th"
      {...thProps}
      title={title === false ? undefined : title}
    >
      <p>{correlation.label.origin}</p>
      <p>
        {correlationApi.getCorrelationDelta(correlation)
          ? correlationApi.getCorrelationDelta(correlation)?.toFixed(2)
          : ''}
      </p>
      <p style={equivalenceTextStyle}>
        {Number.isInteger(correlation.equivalence)
          ? correlation.equivalence
          : correlation.equivalence.toFixed(2)}
      </p>
    </ContextMenu>
  );
}

export default AdditionalColumnHeader;
