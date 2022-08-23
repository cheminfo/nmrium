import { v4 } from '@lukeed/uuid';
import { buildLink, Correlation, Link } from 'nmr-correlation';
import { useCallback, useMemo, useRef } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities';
import ContextMenu from '../../../elements/ContextMenu';
import { positions, useModal } from '../../../elements/popup/Modal';
import { useHighlight } from '../../../highlight';
import {
  cloneCorrelationAndEditLink,
  getAbbreviation,
} from '../utilities/Utilities';
import useInView from '../utilities/useInView';

import EditLinkModal from './editLink/EditLinkModal';

function AdditionalColumnField({
  rowCorrelation,
  columnCorrelation,
  commonLinks,
  correlations,
  spectraData,
  onEdit,
}) {
  const contextRef = useRef<any>();
  const modal = useModal();

  const highlightIDsCommonLinks = useMemo(() => {
    const ids: Array<any> = [];
    commonLinks.forEach((link: Link) => {
      if (link.pseudo === false) {
        ids.push(link.signal.id);
        ids.push(buildID(link.signal.id, 'Crosshair'));
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
  }, [commonLinks, spectraData]);
  const highlightCommonLinks = useHighlight(highlightIDsCommonLinks);

  const mouseEnterHandler = useCallback(
    (event) => {
      event.currentTarget.focus();
      highlightCommonLinks.show();
    },
    [highlightCommonLinks],
  );
  const mouseLeaveHandler = useCallback(
    (event) => {
      event.currentTarget.blur();
      highlightCommonLinks.hide();
    },
    [highlightCommonLinks],
  );

  const contextMenuHandler = useCallback(
    (e) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e);
    },
    [contextRef],
  );

  const handleEditPseudoHSQC = useCallback(
    (action: 'add' | 'remove', link?: Link) => {
      const pseudoLinkCountHSQC = rowCorrelation.link.filter(
        (_link) =>
          (_link.experimentType === 'hsqc' ||
            _link.experimentType === 'hmqc') &&
          _link.pseudo === true,
      ).length;

      let _correlationDim1: Correlation;
      let _correlationDim2: Correlation;
      if (action === 'add') {
        const commonPseudoLink = buildLink({
          experimentType: 'hsqc',
          experimentID: v4(),
          atomType: [columnCorrelation.atomType, rowCorrelation.atomType],
          id: v4(),
          pseudo: true,
          signal: { id: v4(), sign: 0 }, // pseudo signal
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
          link,
          'x',
          'remove',
        );
        _correlationDim2 = cloneCorrelationAndEditLink(
          rowCorrelation,
          link,
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
    const commonLinksMenu = commonLinks
      .map((commonLink) => {
        const commonLinkContextMenuLabel = `${getAbbreviation(commonLink)} (${
          commonLink.signal.x ? commonLink.signal.x.delta.toFixed(2) : '?'
        }, ${
          commonLink.signal.y ? commonLink.signal.y.delta.toFixed(2) : '?'
        })${commonLink.edited?.moved === true ? '[MOVED]' : ''}`;

        return commonLink.pseudo === false
          ? [
              {
                label: `edit ${commonLinkContextMenuLabel}`,
                onClick: () => {
                  highlightCommonLinks.hide();
                  modal.show(
                    <EditLinkModal
                      onClose={() => modal.close()}
                      onEdit={onEdit}
                      link={commonLink}
                      correlationDim1={columnCorrelation}
                      correlationDim2={rowCorrelation}
                      correlations={correlations}
                    />,
                    {
                      position: positions.MIDDLE_RIGHT,
                      isBackgroundBlur: false,
                    },
                  );
                },
              },
            ]
          : [];
      })
      .flat();
    // allow addition or removal of a pseudo HSQC link between pseudo heavy atom and proton
    const commonPseudoLinkHSQC = commonLinks.find(
      (commonLink) =>
        commonLink.pseudo === true && commonLink.experimentType === 'hsqc',
    );
    if (rowCorrelation.pseudo === true) {
      if (commonPseudoLinkHSQC) {
        commonLinksMenu.push({
          label: 'remove pseudo HSQC',
          onClick: () => handleEditPseudoHSQC('remove', commonPseudoLinkHSQC),
        });
      } else {
        commonLinksMenu.push({
          label: 'add pseudo HSQC',
          onClick: () => handleEditPseudoHSQC('add'),
        });
      }
    }

    return commonLinksMenu;
  }, [
    columnCorrelation,
    commonLinks,
    correlations,
    handleEditPseudoHSQC,
    highlightCommonLinks,
    modal,
    onEdit,
    rowCorrelation,
  ]);

  const contentLabel = useMemo(
    () =>
      commonLinks.map((commonLink, i) => (
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

  const title = useMemo(
    () =>
      commonLinks
        .reduce((arr, link) => {
          if (!arr.includes(link.experimentType.toUpperCase())) {
            arr.push(link.experimentType.toUpperCase());
          }
          return arr;
        }, [])
        .join('/'),
    [commonLinks],
  );

  const isInViewRow = useInView({ correlation: rowCorrelation });
  const isInViewColumn = useInView({ correlation: columnCorrelation });

  return (
    <td
      onContextMenu={(e) => {
        if (contextMenu.length > 0) {
          contextMenuHandler(e);
        }
      }}
      style={{
        backgroundColor: highlightCommonLinks.isActive
          ? '#ff6f0057'
          : isInViewColumn || isInViewRow
          ? '#f5f5dc'
          : 'inherit',
      }}
      title={title}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {contentLabel}
      <ContextMenu ref={contextRef} context={contextMenu} />
    </td>
  );
}

export default AdditionalColumnField;
