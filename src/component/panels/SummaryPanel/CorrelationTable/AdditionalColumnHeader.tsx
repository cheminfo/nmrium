/** @jsxImportSource @emotion/react */
import { getCorrelationDelta, getLinkDim } from 'nmr-correlation';
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities';
import { useAlert } from '../../../elements/Alert';
import {
  ContextMenu,
  ContextMenuItem,
} from '../../../elements/ContextMenuBluePrint';
import { useDialog } from '../../../elements/DialogManager';
import { useHighlight } from '../../../highlight';
import { getLabelColor } from '../utilities/Utilities';
import useInView from '../utilities/useInView';

import { EditLinkModal, EditLinkDialogData } from './editLink/EditLinkModal';

function AdditionalColumnHeader({
  spectraData,
  correlationsData,
  correlation,
  onEdit,
}) {
  const alert = useAlert();

  const { openDialog } = useDialog();
  const highlightIDsAdditionalColumn = useMemo(() => {
    if (correlation.pseudo === true) {
      return [];
    }
    return correlation.link.flatMap((link) => {
      const ids: string[] = [];
      if (link.pseudo === false) {
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
    (event) => {
      event.currentTarget.focus();
      highlightAdditionalColumn.show();
    },
    [highlightAdditionalColumn],
  );
  const mouseLeaveHandler = useCallback(
    (event) => {
      event.currentTarget.blur();
      highlightAdditionalColumn.hide();
    },
    [highlightAdditionalColumn],
  );

  const isInView = useInView({ correlation });

  const tableHeaderProps = useMemo(() => {
    const title = [
      ...new Set(
        correlation.link
          .map((link) => {
            if (link.pseudo === false) {
              return link.experimentType.toUpperCase();
            }
            return undefined;
          })
          .sort(),
      ),
    ].join('/');

    return {
      style: {
        color: getLabelColor(correlationsData, correlation) || undefined,
        backgroundColor: highlightAdditionalColumn.isActive
          ? '#ff6f0057'
          : isInView
            ? '#f5f5dc'
            : 'inherit',
      },
      title: correlation.pseudo === false && title,
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
    if (correlation.pseudo !== false) {
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
      const isValidLink = getLinkDim(link) === 1 && link.pseudo === false;

      if (isValidLink) {
        const contextMenu: ContextMenuItem = {
          text: `Edit 1D (${link.signal.delta.toFixed(3)}${
            link.edited?.moved === true ? '[MOVED]' : ''
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
        getCorrelationDelta(correlation) as number
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

  function contextMenuHandler(selectedItem) {
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
      onSelect={(selected) => contextMenuHandler(selected)}
      options={contextMenu}
      as="th"
      {...thProps}
      title={title === false ? undefined : title}
    >
      <p>{correlation.label.origin}</p>
      <p>
        {getCorrelationDelta(correlation)
          ? getCorrelationDelta(correlation)?.toFixed(2)
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
