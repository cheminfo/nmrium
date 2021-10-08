import { buildLink, Types } from 'nmr-correlation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import { findRangeOrZoneID } from '../../../../data/utilities/FindUtilities';
import generateID from '../../../../data/utilities/generateID';
import ContextMenu from '../../../elements/ContextMenu';
import { positions, useModal } from '../../../elements/popup/Modal';
import { useHighlight } from '../../../highlight';
import {
  cloneCorrelationAndAddOrRemoveLink,
  getAbbreviation,
} from '../Utilities';

import EditLinkModal from './EditLinkModal';

function AdditionalColumnField({
  rowCorrelation,
  columnCorrelation,
  commonLinks,
  correlations,
  spectraData,
  onEdit,
}) {
  const contextRef = useRef<any>();
  const [isEdited, setIsEdited] = useState(false);
  const modal = useModal();

  const highlightIDsCommonLinks = useMemo(() => {
    const ids: Array<any> = [];
    commonLinks.forEach((link) => {
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

  useEffect(() => {
    if (commonLinks.some((commonLink) => commonLink.pseudo === true)) {
      setIsEdited(true);
    } else {
      setIsEdited(false);
    }
  }, [commonLinks]);

  const contextMenuHandler = useCallback(
    (e) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e);
    },
    [contextRef],
  );

  const handleEditPseudoHSQC = useCallback(
    (action: 'add' | 'remove', link?: Types.Link) => {
      const pseudoLinkCountHSQC = rowCorrelation.link.filter(
        (_link) =>
          (_link.experimentType === 'hsqc' ||
            _link.experimentType === 'hmqc') &&
          _link.pseudo === true,
      ).length;

      let _correlationDim1: Types.Correlation;
      let _correlationDim2: Types.Correlation;
      if (action === 'add') {
        const commonPseudoLink = buildLink({
          experimentType: 'hsqc',
          experimentID: generateID(),
          atomType: [columnCorrelation.atomType, rowCorrelation.atomType],
          id: generateID(),
          pseudo: true,
          signal: { id: generateID(), sign: 0 }, // pseudo signal
        });
        _correlationDim1 = cloneCorrelationAndAddOrRemoveLink(
          columnCorrelation,
          commonPseudoLink,
          'x',
          'add',
        );
        _correlationDim2 = cloneCorrelationAndAddOrRemoveLink(
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
        _correlationDim1 = cloneCorrelationAndAddOrRemoveLink(
          columnCorrelation,
          link,
          'x',
          'remove',
        );
        _correlationDim2 = cloneCorrelationAndAddOrRemoveLink(
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

      onEdit([_correlationDim1, _correlationDim2], action, link);
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
        })`;

        return commonLink.pseudo === false
          ? [
              {
                label: `edit ${commonLinkContextMenuLabel}`,
                onClick: () =>
                  modal.show(
                    <EditLinkModal
                      onClose={() => modal.close()}
                      onEdit={onEdit}
                      link={commonLink}
                      correlationDim1={columnCorrelation}
                      correlationDim2={rowCorrelation}
                      correlations={correlations}
                    />,
                    { position: positions.TOP_LEFT, isBackgroundBlur: false },
                  ),
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
    modal,
    onEdit,
    rowCorrelation,
  ]);

  const content = useMemo(
    () => commonLinks.map((commonLink) => getAbbreviation(commonLink)),
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
          : isEdited
          ? '#F7F2E0'
          : 'inherit',
      }}
      title={title}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {content.join('/')}
      <ContextMenu ref={contextRef} context={contextMenu} />
    </td>
  );
}

export default AdditionalColumnField;
