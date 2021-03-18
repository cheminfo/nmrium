import { Link, Utilities } from 'nmr-correlation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { buildID } from '../../../../data/utilities/Concatenation';
import generateID from '../../../../data/utilities/generateID';
import ContextMenu from '../../../elements/ContextMenu';
import { useHighlight } from '../../../highlight';
import { findRangeOrZoneID } from '../Utilities';

function AdditionalColumnField({
  rowCorrelation,
  columnCorrelation,
  commonLinks,
  correlations,
  spectraData,
  onEdit,
}) {
  const contextRef = useRef();
  const [isEdited, setIsEdited] = useState(false);

  const highlightIDsCommonLinks = useMemo(() => {
    const ids = [];
    commonLinks.forEach((link) => {
      if (link.getPseudo() === false) {
        ids.push(link.signal.id);
        ids.push(buildID(link.signal.id, 'Crosshair'));
        const _id = findRangeOrZoneID(spectraData, link);
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
    if (commonLinks.some((commonLink) => commonLink.getPseudo() === true)) {
      setIsEdited(true);
    } else {
      setIsEdited(false);
    }
  }, [commonLinks]);

  const contextMenuHandler = useCallback(
    (e, rowData) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, rowData);
    },
    [contextRef],
  );

  const onEditHandler = useCallback(
    (experimentType, action, commonLink) => {
      const pseudoLinkCountHSQC = rowCorrelation
        .getLinks()
        .filter(
          (link) =>
            link.getExperimentType() === 'hsqc' ||
            link.getExperimentType() === 'hmqc',
        ).length;

      if (action === 'add') {
        const pseudoLinkID = generateID();
        const pseudoExperimentID = generateID();
        const pseudoCommonLink = new Link({
          experimentType,
          experimentID: pseudoExperimentID,
          atomType: [
            columnCorrelation.getAtomType(),
            rowCorrelation.getAtomType(),
          ],
          id: pseudoLinkID,
          pseudo: true,
        });

        columnCorrelation.addLink(
          new Link({
            ...pseudoCommonLink,
            axis: 'x',
            match: [
              Utilities.getCorrelationIndex(correlations, rowCorrelation),
            ],
          }),
        );
        rowCorrelation.addLink(
          new Link({
            ...pseudoCommonLink,
            axis: 'y',
            match: [
              Utilities.getCorrelationIndex(correlations, columnCorrelation),
            ],
          }),
        );
        if (!rowCorrelation.getEdited().protonsCount) {
          rowCorrelation.setProtonsCount([pseudoLinkCountHSQC + 1]);
        }
      } else if (action === 'remove') {
        rowCorrelation.removeLink(commonLink.getID());
        columnCorrelation.removeLink(commonLink.getID());
        if (!rowCorrelation.getEdited().protonsCount) {
          rowCorrelation.setProtonsCount(
            pseudoLinkCountHSQC - 1 > 0 ? [pseudoLinkCountHSQC - 1] : [],
          );
        }
      }

      onEdit(rowCorrelation, columnCorrelation);
    },
    [rowCorrelation, onEdit, columnCorrelation, correlations],
  );

  const contextMenu = useMemo(() => {
    // allow the edition of pseudo correlations and pseudo HSQC only (for now)
    // assumption here that only one pseudo HSQC can be added to a pseudo correlation
    const commonLinkHSQC = commonLinks.find(
      (commonLink) =>
        commonLink.experimentType === 'hsqc' && commonLink.getPseudo() === true,
    );

    return rowCorrelation.getPseudo() === true
      ? commonLinkHSQC
        ? [
            {
              label: 'remove HSQC',
              onClick: () => {
                onEditHandler('hsqc', 'remove', commonLinkHSQC);
              },
            },
          ]
        : [
            {
              label: 'add HSQC',
              onClick: () => {
                onEditHandler('hsqc', 'add');
              },
            },
          ]
      : [];
  }, [commonLinks, onEditHandler, rowCorrelation]);

  const content = useMemo(() => {
    const linkSet = new Set();
    commonLinks.forEach((commonLink) => {
      if (
        commonLink.getExperimentType() === 'hsqc' ||
        commonLink.getExperimentType() === 'hmqc'
      ) {
        linkSet.add(
          !commonLink.getSignal() || commonLink.getSignal().sign === 0
            ? 'S'
            : `S${commonLink.getSignal().sign === 1 ? '+' : '-'}`,
        );
      } else if (
        commonLink.getExperimentType() === 'hmbc' ||
        commonLink.getExperimentType() === 'cosy' ||
        commonLink.getExperimentType() === 'tocsy'
      ) {
        linkSet.add('M');
      } else if (
        commonLink.getExperimentType() === 'noesy' ||
        commonLink.getExperimentType() === 'roesy'
      ) {
        linkSet.add('NOE');
      }
    });

    return [...linkSet];
  }, [commonLinks]);

  return (
    <td
      onContextMenu={(e) => {
        if (contextMenu.length > 0) {
          contextMenuHandler(e, rowCorrelation);
        }
      }}
      style={{
        backgroundColor: highlightCommonLinks.isActive
          ? '#ff6f0057'
          : isEdited
          ? '#F7F2E0'
          : 'inherit',
      }}
      onMouseEnter={mouseEnterHandler}
      onMouseLeave={mouseLeaveHandler}
    >
      {content.join('/')}
      <ContextMenu ref={contextRef} context={contextMenu} />
    </td>
  );
}

export default AdditionalColumnField;
