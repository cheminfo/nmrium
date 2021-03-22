import lodashCloneDeep from 'lodash/cloneDeep';
import {
  CorrelationUtilities,
  GeneralUtilities,
  LinkUtilities,
} from 'nmr-correlation';
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
      if (link.pseudo === false) {
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
    if (commonLinks.some((commonLink) => commonLink.pseudo === true)) {
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
      const _rowCorrelation = lodashCloneDeep(rowCorrelation);
      const _columnCorrelation = lodashCloneDeep(columnCorrelation);
      const pseudoLinkCountHSQC = _rowCorrelation.link.filter(
        (link) =>
          link.experimentType === 'hsqc' || link.experimentType === 'hmqc',
      ).length;

      if (action === 'add') {
        const pseudoLinkID = generateID();
        const pseudoExperimentID = generateID();
        const pseudoCommonLink = LinkUtilities.buildLink({
          experimentType,
          experimentID: pseudoExperimentID,
          atomType: [_columnCorrelation.atomType, _rowCorrelation.atomType],
          id: pseudoLinkID,
          pseudo: true,
        });

        CorrelationUtilities.addLink(
          _columnCorrelation,
          LinkUtilities.buildLink({
            ...pseudoCommonLink,
            axis: 'x',
            match: [
              GeneralUtilities.getCorrelationIndex(
                correlations,
                _rowCorrelation,
              ),
            ],
          }),
        );
        CorrelationUtilities.addLink(
          _rowCorrelation,
          LinkUtilities.buildLink({
            ...pseudoCommonLink,
            axis: 'y',
            match: [
              GeneralUtilities.getCorrelationIndex(
                correlations,
                _columnCorrelation,
              ),
            ],
          }),
        );
        if (!_rowCorrelation.edited.protonsCount) {
          _rowCorrelation.protonsCount = [pseudoLinkCountHSQC + 1];
        }
      } else if (action === 'remove') {
        CorrelationUtilities.removeLink(_rowCorrelation, commonLink.id);
        CorrelationUtilities.removeLink(_columnCorrelation, commonLink.id);
        if (!_rowCorrelation.edited.protonsCount) {
          _rowCorrelation.protonsCount =
            pseudoLinkCountHSQC - 1 > 0 ? [pseudoLinkCountHSQC - 1] : [];
        }
      }

      onEdit(_rowCorrelation, _columnCorrelation);
    },
    [rowCorrelation, onEdit, columnCorrelation, correlations],
  );

  const contextMenu = useMemo(() => {
    // allow the edition of pseudo correlations and pseudo HSQC only (for now)
    // assumption here that only one pseudo HSQC can be added to a pseudo correlation
    const commonLinkHSQC = commonLinks.find(
      (commonLink) =>
        commonLink.experimentType === 'hsqc' && commonLink.pseudo === true,
    );

    return rowCorrelation.pseudo === true
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
        commonLink.experimentType === 'hsqc' ||
        commonLink.experimentType === 'hmqc'
      ) {
        linkSet.add(
          !commonLink.signal || commonLink.signal.sign === 0
            ? 'S'
            : `S${commonLink.signal.sign === 1 ? '+' : '-'}`,
        );
      } else if (
        commonLink.experimentType === 'hmbc' ||
        commonLink.experimentType === 'cosy' ||
        commonLink.experimentType === 'tocsy'
      ) {
        linkSet.add('M');
      } else if (
        commonLink.experimentType === 'noesy' ||
        commonLink.experimentType === 'roesy'
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
