import {
  buildLink,
  getCorrelationDelta,
  getLabel,
  getLinkDim,
  Link,
} from 'nmr-correlation';
import { useCallback, useMemo, useRef } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities';
import ContextMenu from '../../../elements/ContextMenu';
import EditableColumn from '../../../elements/EditableColumn';
import { positions, useModal } from '../../../elements/popup/Modal';
import { useHighlight } from '../../../highlight';
import IsInView from '../utilities/IsInView';
import { convertValuesString } from '../utilities/Utilities';

import AdditionalColumnField from './AdditionalColumnField';
import EditLinkModal from './editLink/EditLinkModal';

function CorrelationTableRow({
  additionalColumnData,
  correlations,
  correlation,
  styleRow,
  styleLabel,
  onSaveEditEquivalences,
  onSaveEditNumericValues,
  onEditCorrelationTableCellHandler,
  spectraData,
}) {
  const contextRef = useRef<any>();
  const modal = useModal();

  const highlightIDsRow = useMemo(() => {
    if (correlation.pseudo === true) {
      return [];
    }
    const ids: string[] = [];

    correlation.link.forEach((link) => {
      if (link.pseudo === false) {
        ids.push(link.signal.id);
        ids.push(buildID(link.signal.id, 'Crosshair_Y'));
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
    });

    return ids;
  }, [correlation, spectraData]);
  const highlightRow = useHighlight(highlightIDsRow);

  const onSaveEquivalencesHandler = useCallback(
    (e) => {
      onSaveEditEquivalences(correlation, e.target.value);
    },
    [correlation, onSaveEditEquivalences],
  );

  const onSaveEditNumericValuesHandler = useCallback(
    (e, key: 'protonsCount' | 'hybridization') => {
      onSaveEditNumericValues({
        correlation,
        values: convertValuesString(e.target.value, key),
        key,
      });
    },
    [correlation, onSaveEditNumericValues],
  );

  const additionalColumnFields = useMemo(() => {
    return additionalColumnData.map((_correlation) => {
      const commonLinks: Link[] = [];
      correlation.link.forEach((link) => {
        _correlation.link.forEach((_link) => {
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
        });
      });

      return (
        <AdditionalColumnField
          key={`addColData_${correlation.id}_${_correlation.id}`}
          rowCorrelation={correlation}
          columnCorrelation={_correlation}
          commonLinks={commonLinks}
          correlations={correlations}
          spectraData={spectraData}
          onEdit={onEditCorrelationTableCellHandler}
        />
      );
    });
  }, [
    additionalColumnData,
    correlation,
    correlations,
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
    (event) => {
      event.currentTarget.focus();
      highlightRow.show();
    },
    [highlightRow],
  );
  const mouseLeaveHandler = useCallback(
    (event) => {
      event.currentTarget.blur();
      highlightRow.hide();
    },
    [highlightRow],
  );

  const isInView = IsInView({ correlation });

  const tableDataProps = useMemo(() => {
    return {
      style: {
        ...styleRow,
        backgroundColor: highlightRow.isActive
          ? '#ff6f0057'
          : isInView
          ? '#f5f5dc'
          : 'inherit',
      },
      title:
        correlation.pseudo === false &&
        correlation.link
          .reduce((arr, link) => {
            if (
              link.pseudo === false &&
              !arr.includes(link.experimentType.toUpperCase())
            ) {
              arr.push(link.experimentType.toUpperCase());
            }
            return arr;
          }, [])
          .sort()
          .join('/'),
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
    styleRow,
  ]);

  const contextMenu = useMemo(() => {
    return correlation.pseudo === false
      ? correlation.link
          .filter((link) => getLinkDim(link) === 1 && link.pseudo === false)
          .map((link) => {
            return {
              label: `edit 1D (${link.signal.delta.toFixed(3)})${
                link.edited?.moved === true ? '[MOVED]' : ''
              }`,
              onClick: () => {
                highlightRow.hide();
                modal.show(
                  <EditLinkModal
                    onClose={() => modal.close()}
                    onEdit={onEditCorrelationTableCellHandler}
                    link={link}
                    correlationDim1={correlation}
                    correlationDim2={undefined}
                    correlations={correlations}
                  />,
                  {
                    position: positions.MIDDLE_RIGHT,
                    isBackgroundBlur: false,
                  },
                );
              },
            };
          })
          .concat([
            {
              label: `delete ${correlation.label.origin}`,
              onClick: () => {
                modal.showConfirmDialog({
                  message: `All signals of ${correlation.label.origin} (${(
                    getCorrelationDelta(correlation) as number
                  ).toFixed(2)}) will be deleted. Are you sure?`,
                  buttons: [
                    {
                      text: 'Yes',
                      handler: () => {
                        onEditCorrelationTableCellHandler(
                          [correlation],
                          'removeAll',
                        );
                      },
                    },
                    { text: 'No' },
                  ],
                });
                highlightRow.hide();
              },
            },
          ])
      : [];
  }, [
    correlation,
    highlightRow,
    modal,
    onEditCorrelationTableCellHandler,
    correlations,
  ]);

  const contextMenuHandler = useCallback(
    (e) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e);
    },
    [contextRef],
  );

  const { title, ...otherTableDataProps } = tableDataProps;
  const t = !title ? '' : title;

  return (
    <tr style={styleRow}>
      <td
        title={t}
        {...{
          ...otherTableDataProps,
          style: { ...tableDataProps.style, styleLabel },
        }}
        onContextMenu={(e) => {
          if (contextMenu.length > 0) {
            contextMenuHandler(e);
          }
        }}
      >
        {getLabel(correlations, correlation)}
        <ContextMenu ref={contextRef} context={contextMenu} />
      </td>
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
          />
        ) : (
          <text style={equivalenceCellStyle}>{correlation.equivalence}</text>
        )}
      </td>
      <td title={t} {...otherTableDataProps}>
        {correlation.atomType !== 'H' ? (
          <EditableColumn
            type="text"
            value={correlation.protonsCount.join(',')}
            style={correlation.edited.protonsCount ? { color: 'blue' } : {}}
            onSave={(e) => onSaveEditNumericValuesHandler(e, 'protonsCount')}
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
              .map((hybrid) => `sp${hybrid}`)
              .join(',')}
            style={correlation.edited.hybridization ? { color: 'blue' } : {}}
            onSave={(e) => onSaveEditNumericValuesHandler(e, 'hybridization')}
          />
        ) : (
          ''
        )}
      </td>
      {additionalColumnFields}
    </tr>
  );
}

export default CorrelationTableRow;
