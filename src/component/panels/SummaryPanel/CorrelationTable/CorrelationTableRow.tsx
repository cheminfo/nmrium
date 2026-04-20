import type { Spectrum } from '@zakodium/nmrium-core';
import type { Correlation, CorrelationData, Link } from 'nmr-correlation';
import {
  buildLink,
  getCorrelationDelta,
  getLabel,
  getLinkDim,
} from 'nmr-correlation';
import type { CSSProperties } from 'react';
import { useCallback, useMemo } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation.js';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities.js';
import { useAlert } from '../../../elements/Alert.js';
import type { ContextMenuItem } from '../../../elements/ContextMenuBluePrint.js';
import { ContextMenu } from '../../../elements/ContextMenuBluePrint.js';
import { useDialog } from '../../../elements/DialogManager.js';
import { EditableColumn } from '../../../elements/EditableColumn.js';
import { useHighlight } from '../../../highlight/index.js';
import { convertValuesString } from '../utilities/Utilities.js';
import useInView from '../utilities/useInView.js';

import AdditionalColumnField from './AdditionalColumnField.js';
import type { AdditionalColumnHeaderProps } from './AdditionalColumnHeader.tsx';
import type { EditLinkDialogData } from './editLink/EditLinkModal.js';
import { EditLinkModal } from './editLink/EditLinkModal.js';

export interface CorrelationTableRowProps {
  additionalColumnData: Correlation[];
  correlations: CorrelationData;
  correlation: Correlation;
  styleLabel: CSSProperties;
  onSaveEditEquivalences: (correlation: Correlation, value: number) => void;
  onSaveEditNumericValues: (params: {
    correlation: Correlation;
    values: number[];
    key: 'hybridization' | 'protonsCount';
  }) => void;
  onEditCorrelationTableCellHandler: AdditionalColumnHeaderProps['onEdit'];
  spectraData: Spectrum[];
}

export default function CorrelationTableRow(props: CorrelationTableRowProps) {
  const {
    additionalColumnData,
    correlations,
    correlation,
    styleLabel,
    onSaveEditEquivalences,
    onSaveEditNumericValues,
    onEditCorrelationTableCellHandler,
    spectraData,
  } = props;

  const { openDialog } = useDialog();
  const alert = useAlert();

  const highlightIDsRow = useMemo(() => {
    if (correlation.pseudo === true) {
      return [];
    }

    return correlation.link.flatMap((link: any) => {
      const ids: string[] = [];
      if (link.pseudo === false) {
        ids.push(link.signal.id, buildID(link.signal.id, 'Crosshair_Y'));
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
  const highlightRow = useHighlight(highlightIDsRow);

  const onSaveEquivalencesHandler = useCallback(
    (value: string | number) => {
      onSaveEditEquivalences(correlation, Number(value));
    },
    [correlation, onSaveEditEquivalences],
  );

  const onSaveEditNumericValuesHandler = useCallback(
    (value: string | number, key: 'protonsCount' | 'hybridization') => {
      onSaveEditNumericValues({
        correlation,
        values: convertValuesString(String(value), key),
        key,
      });
    },
    [correlation, onSaveEditNumericValues],
  );

  const additionalColumnFields = useMemo(() => {
    return additionalColumnData.map((_correlation: Correlation) => {
      const commonLinks: Link[] = [];
      for (const link of correlation.link) {
        for (const _link of _correlation.link) {
          if (
            link.axis !== _link.axis &&
            link.experimentID === _link.experimentID &&
            link.signal.id === _link.signal.id &&
            !commonLinks.some(
              (_commonLink) => _commonLink.signal.id === link.signal.id,
            )
          ) {
            let experimentLabel = link.experimentType;
            if (link.signal && link.signal.sign !== 0) {
              experimentLabel += link.signal.sign === 1 ? ' (+)' : ' (-)';
            }
            commonLinks.push(
              buildLink({
                ...link,
                experimentLabel,
                axis: undefined,
                id: `${_link.id}_${link.id}`,
              }),
            );
          }
        }
      }

      return (
        <AdditionalColumnField
          key={`addColData_${correlation.id}_${_correlation.id}`}
          rowCorrelation={correlation}
          columnCorrelation={_correlation}
          commonLinks={commonLinks}
          spectraData={spectraData}
          onEdit={onEditCorrelationTableCellHandler}
        />
      );
    });
  }, [
    additionalColumnData,
    correlation,
    onEditCorrelationTableCellHandler,
    spectraData,
  ]);

  const equivalenceCellStyle = useMemo(() => {
    return correlation.edited.equivalence
      ? { color: 'blue' }
      : {
          color: correlation.equivalence === 1 ? '#bebebe' : 'black',
        };
  }, [correlation]);

  const mouseEnterHandler = useCallback(
    (event: any) => {
      event.currentTarget.focus();
      highlightRow.show();
    },
    [highlightRow],
  );
  const mouseLeaveHandler = useCallback(
    (event: any) => {
      event.currentTarget.blur();
      highlightRow.hide();
    },
    [highlightRow],
  );

  const isInView = useInView({ correlation });

  const tableDataProps = useMemo(() => {
    const correlationLinks = correlation.link.map((link: any) => {
      if (link.pseudo === false) {
        return link.experimentType.toUpperCase();
      }
      return undefined;
    });
    correlationLinks.sort();
    const title = Array.from(new Set(correlationLinks)).join('/');

    return {
      style: {
        backgroundColor: highlightRow.isActive
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
    correlation.link,
    correlation.pseudo,
    highlightRow.isActive,
    isInView,
    mouseEnterHandler,
    mouseLeaveHandler,
  ]);

  const deleteCorrelationLink = useCallback(() => {
    const message = `All signals of ${correlation.label.origin} (${(
      getCorrelationDelta(correlation) as number
    ).toFixed(2)}) will be deleted. Are you sure?`;

    alert.showAlert({
      message,
      buttons: [
        {
          text: 'Yes',
          onClick: () => {
            onEditCorrelationTableCellHandler([correlation], 'removeAll');
          },
          intent: 'danger',
        },
        { text: 'No' },
      ],
    });
    highlightRow.hide();
  }, [alert, correlation, highlightRow, onEditCorrelationTableCellHandler]);

  const contextMenus = useMemo(() => {
    if (correlation.pseudo !== false) {
      return [];
    }

    const contextMenus: ContextMenuItem[] = [
      {
        text: `Delete ${correlation.label.origin}`,
        icon: 'trash',
        data: { action: 'delete' },
      },
    ];

    for (const link of correlation?.link || []) {
      const isValidLink = getLinkDim(link) === 1 && link.pseudo === false;

      if (isValidLink) {
        const contextMenu: ContextMenuItem = {
          text: `Edit 1D (${link.signal.delta.toFixed(3)})${
            link.edited?.moved === true ? '[MOVED]' : ''
          }`,
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

  function contextMenuHandler(selectedItem: any) {
    const { action, data } = selectedItem;
    switch (action) {
      case 'delete': {
        deleteCorrelationLink();
        break;
      }
      case 'edit': {
        highlightRow.hide();
        openDialog<EditLinkDialogData>(EditLinkModal, data);
        break;
      }
      default:
        break;
    }
  }

  const { title, ...otherTableDataProps } = tableDataProps;
  const t = title || '';

  return (
    <tr style={{ backgroundColor: 'mintcream' }}>
      <ContextMenu
        as="td"
        options={contextMenus}
        title={t}
        {...{
          ...otherTableDataProps,
          style: { ...tableDataProps.style, styleLabel },
        }}
        onSelect={contextMenuHandler}
      >
        {getLabel(correlations, correlation)}
      </ContextMenu>
      <td title={t} {...otherTableDataProps}>
        {getCorrelationDelta(correlation)
          ? getCorrelationDelta(correlation)?.toFixed(2)
          : ''}
      </td>
      <td title={t} {...otherTableDataProps}>
        {correlation.atomType !== 'H' ? (
          <EditableColumn
            type="number"
            value={correlation.equivalence}
            style={equivalenceCellStyle}
            onSave={onSaveEquivalencesHandler}
            validate={(val) => val !== ''}
          />
        ) : (
          <span style={equivalenceCellStyle}>{correlation.equivalence}</span>
        )}
      </td>
      <td title={t} {...otherTableDataProps}>
        {correlation.atomType !== 'H' ? (
          <EditableColumn
            type="text"
            value={correlation.protonsCount.join(',')}
            style={correlation.edited.protonsCount ? { color: 'blue' } : {}}
            onSave={(value) =>
              onSaveEditNumericValuesHandler(value, 'protonsCount')
            }
            validate={(val) => val !== ''}
          />
        ) : (
          ''
        )}
      </td>
      <td
        title={t}
        {...{
          ...otherTableDataProps,
          style: { ...tableDataProps.style, borderRight: '1px solid' },
        }}
      >
        {correlation.atomType !== 'H' ? (
          <EditableColumn
            type="text"
            value={correlation.hybridization
              .map((hybrid: any) => `sp${hybrid}`)
              .join(',')}
            style={correlation.edited.hybridization ? { color: 'blue' } : {}}
            onSave={(value) =>
              onSaveEditNumericValuesHandler(value, 'hybridization')
            }
            validate={(val) => val !== ''}
          />
        ) : (
          ''
        )}
      </td>
      {additionalColumnFields}
    </tr>
  );
}
