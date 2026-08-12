import type { MenuItemProps } from '@blueprintjs/core';
import type { Signal1D, Signal2D, Spectra } from '@zakodium/nmr-types';
import type { Correlation, CorrelationLink } from 'nmr-processing';
import { correlationApi } from 'nmr-processing';
import type { MouseEvent } from 'react';
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation.js';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities.js';
import { ContextMenu } from '../../../elements/ContextMenuBluePrint.js';
import { useDialog } from '../../../elements/DialogManager.js';
import { useHighlight } from '../../../highlight/index.js';
import {
  cloneCorrelationAndEditLink,
  getAbbreviation,
} from '../utilities/Utilities.js';
import useInView from '../utilities/useInView.js';

import type { EditLinkDialogData } from './editLink/EditLinkModal.js';
import { EditLinkModal } from './editLink/EditLinkModal.js';

function getLinkText(link: CorrelationLink) {
  const { signal, edited } = link;
  const { x, y } = signal as Signal2D;

  const deltaX = x?.delta?.toFixed(2) ?? '?';
  const deltaY = y?.delta?.toFixed(2) ?? '?';
  const movedLabel = edited?.moved ? '[MOVED]' : '';

  return `${getAbbreviation(link)} (${deltaX} , ${deltaY}) ${movedLabel}`;
}

interface AdditionalColumnFieldProps {
  rowCorrelation: Correlation;
  columnCorrelation: Correlation;
  commonLinks: CorrelationLink[];
  spectraData: Spectra;
  onEdit: any;
}

export default function AdditionalColumnField(
  props: AdditionalColumnFieldProps,
) {
  const {
    rowCorrelation,
    columnCorrelation,
    commonLinks,
    spectraData,
    onEdit,
  } = props;

  const { openDialog } = useDialog();

  const highlightIDsCommonLinks = useMemo(() => {
    return commonLinks.flatMap((link: CorrelationLink) => {
      const ids: string[] = [];
      if (!link.pseudo) {
        ids.push(link.signal.id, buildID(link.signal.id, 'Crosshair'));
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
  }, [commonLinks, spectraData]);
  const highlightCommonLinks = useHighlight(highlightIDsCommonLinks);

  const mouseEnterHandler = useCallback(
    (event: MouseEvent<HTMLTableCellElement>) => {
      event.currentTarget.focus();
      highlightCommonLinks.show();
    },
    [highlightCommonLinks],
  );
  const mouseLeaveHandler = useCallback(
    (event: MouseEvent<HTMLTableCellElement>) => {
      event.currentTarget.blur();
      highlightCommonLinks.hide();
    },
    [highlightCommonLinks],
  );

  function contextMenuHandler(data: EditLinkDialogData) {
    highlightCommonLinks.hide();
    openDialog(EditLinkModal, data);
  }

  const handleEditPseudoHSQC = useCallback(
    (action: 'add' | 'remove', link?: CorrelationLink) => {
      const pseudoLinkCountHSQC = rowCorrelation.link.filter(
        (_link) =>
          (_link.experimentType === 'hsqc' ||
            _link.experimentType === 'hmqc') &&
          _link.pseudo,
      ).length;

      let _correlationDim1: Correlation;
      let _correlationDim2: Correlation;
      if (action === 'add') {
        const commonPseudoLink = correlationApi.buildLink({
          experimentType: 'hsqc',
          experimentID: crypto.randomUUID(),
          atomType: [columnCorrelation.atomType, rowCorrelation.atomType],
          id: crypto.randomUUID(),
          pseudo: true,
          signal: { id: crypto.randomUUID(), sign: 0 } as unknown as Signal1D, // pseudo signal
        });
        _correlationDim1 = cloneCorrelationAndEditLink(
          columnCorrelation,
          commonPseudoLink,
          'x',
          'add',
        );
        _correlationDim2 = cloneCorrelationAndEditLink(
          rowCorrelation,
          commonPseudoLink,
          'y',
          'add',
        );
        // increase number of attached protons if no value was specified manually before
        if (!_correlationDim2.edited.protonsCount) {
          _correlationDim2.protonsCount = [pseudoLinkCountHSQC + 1];
        }
      } else {
        _correlationDim1 = cloneCorrelationAndEditLink(
          columnCorrelation,
          link as CorrelationLink,
          'x',
          'remove',
        );
        _correlationDim2 = cloneCorrelationAndEditLink(
          rowCorrelation,
          link as CorrelationLink,
          'y',
          'remove',
        );
        // decrease number of attached protons if no value was specified manually before
        if (!_correlationDim2.edited.protonsCount) {
          _correlationDim2.protonsCount =
            pseudoLinkCountHSQC - 1 > 0 ? [pseudoLinkCountHSQC - 1] : [];
        }
      }

      onEdit([_correlationDim1, _correlationDim2], action, link, {
        skipDataUpdate: true,
      });
    },
    [columnCorrelation, onEdit, rowCorrelation],
  );

  const contextMenu = useMemo(() => {
    // allow the edition of correlations
    const commonLinksMenu: MenuItemProps[] = commonLinks.flatMap(
      (commonLink) => {
        if (commonLink.pseudo) {
          return [];
        }

        return [
          {
            text: `Edit ${getLinkText(commonLink)}`,
            icon: 'edit',
            data: {
              link: commonLink,
              correlationDim1: columnCorrelation,
              correlationDim2: rowCorrelation,
            },
          },
        ];
      },
    );
    // allow addition or removal of a pseudo HSQC link between pseudo heavy atom and proton
    const commonPseudoLinkHSQC = commonLinks.find(
      (commonLink) => commonLink.pseudo && commonLink.experimentType === 'hsqc',
    );
    if (rowCorrelation.pseudo) {
      if (commonPseudoLinkHSQC) {
        commonLinksMenu.push({
          text: 'remove pseudo HSQC',
          onClick: () => handleEditPseudoHSQC('remove', commonPseudoLinkHSQC),
        });
      } else {
        commonLinksMenu.push({
          text: 'add pseudo HSQC',
          onClick: () => handleEditPseudoHSQC('add'),
        });
      }
    }

    return commonLinksMenu;
  }, [columnCorrelation, commonLinks, handleEditPseudoHSQC, rowCorrelation]);

  const contentLabel = useMemo(
    () =>
      commonLinks.map((commonLink: any, i: any) => (
        <label key={commonLink.id}>
          <label
            style={{
              color:
                commonLink.pseudo === true || commonLink.edited?.moved === true
                  ? 'blue'
                  : 'black',
            }}
          >
            {getAbbreviation(commonLink)}
          </label>
          {i < commonLinks.length - 1 && <label>/</label>}
        </label>
      )),
    [commonLinks],
  );

  const isInViewRow = useInView({ correlation: rowCorrelation });
  const isInViewColumn = useInView({ correlation: columnCorrelation });

  return (
    <ContextMenu
      as="td"
      options={contextMenu}
      onSelect={contextMenuHandler}
      style={{
        backgroundColor: highlightCommonLinks.isActive
          ? '#ff6f0057'
          : isInViewColumn || isInViewRow
            ? '#f5f5dc'
            : 'inherit',
      }}
      title={getTitle(commonLinks)}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {contentLabel}
    </ContextMenu>
  );
}

function getTitle(commonLinks: CorrelationLink[]) {
  if (commonLinks?.length === 0) {
    return '';
  }

  return [
    ...new Set(
      commonLinks?.map((link) => {
        return link.experimentType.toUpperCase();
      }),
    ),
  ].join('/');
}
