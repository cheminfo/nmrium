import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import Link from '../../../../data/correlation/Link';
import generateID from '../../../../data/utilities/generateID';
import ContextMenu from '../../../elements/ContextMenu';

const AdditionalColumnField = ({ correlation, fieldCorrelation, onEdit }) => {
  const contextRef = useRef();
  const contextMenuHandler = useCallback(
    (e, rowData) => {
      e.preventDefault();
      contextRef.current.handleContextMenu(e, rowData);
    },
    [contextRef],
  );

  const commonLinks = useMemo(() => {
    const _commonLinks = [];
    correlation.getLinks().forEach((link) => {
      fieldCorrelation.getLinks().forEach((_link) => {
        if (
          link.getAxis() !== _link.getAxis() &&
          link.getExperimentID() === _link.getExperimentID() &&
          link.getSignalID() === _link.getSignalID()
        ) {
          let experimentLabel = link.getExperimentType();
          if (link.getSignal() && link.getSignal().sign !== 0) {
            experimentLabel += ' (edited)';
          }
          _commonLinks.push(
            new Link({
              ...link,
              experimentLabel,
              axis: undefined,
            }),
          );
        }
      });
    });

    return _commonLinks;
  }, [correlation, fieldCorrelation]);

  const onEditHandler = useCallback(
    (experimentType, action, commonLink) => {
      const pseudoLinkCountHSQC = correlation
        .getLinks()
        .filter(
          (link) =>
            link.getExperimentType() === 'hsqc' ||
            link.getExperimentType() === 'hmqc',
        ).length;

      if (action === 'add') {
        const pseudoLinkID = generateID();
        const pseudoExperimentID = generateID();
        const pseudoCommonLinkXAxis = new Link({
          experimentType,
          experimentID: pseudoExperimentID,
          atomType: [fieldCorrelation.getAtomType(), correlation.getAtomType()],
          axis: 'x',
          match: [correlation.getIndex()],
          id: pseudoLinkID,
          pseudo: true,
        });
        const pseudoCommonLinkYAxis = new Link({
          experimentType,
          experimentID: pseudoExperimentID,
          atomType: [fieldCorrelation.getAtomType(), correlation.getAtomType()],
          axis: 'y',
          match: [fieldCorrelation.getIndex()],
          id: pseudoLinkID,
          pseudo: true,
        });
        correlation.addLink(pseudoCommonLinkYAxis);
        fieldCorrelation.addLink(pseudoCommonLinkXAxis);
        if (!correlation.getEdited().protonsCount) {
          correlation.setProtonsCount([pseudoLinkCountHSQC + 1]);
        }
      } else if (action === 'remove') {
        correlation.removeLink(commonLink.getID());
        fieldCorrelation.removeLink(commonLink.getID());
        if (!correlation.getEdited().protonsCount) {
          correlation.setProtonsCount(
            pseudoLinkCountHSQC - 1 > 0 ? [pseudoLinkCountHSQC - 1] : [],
          );
        }
      }

      onEdit(correlation, fieldCorrelation);
    },
    [correlation, fieldCorrelation, onEdit],
  );

  const contextMenu = useMemo(() => {
    // allow the edition of pseudo correlations and pseudo HSQC only (for now)
    // assumption here that only one pseudo HSQC can be added to a pseudo correlation
    const commonLinkHSQC = commonLinks.find(
      (commonLink) =>
        commonLink.experimentType === 'hsqc' && commonLink.getPseudo() === true,
    );

    return correlation.getPseudo() === true
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
  }, [commonLinks, correlation, onEditHandler]);

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

  const [isEdited, setIsEdited] = useState(false);

  useEffect(() => {
    if (commonLinks.some((commonLink) => commonLink.getPseudo() === true)) {
      setIsEdited(true);
    } else {
      setIsEdited(false);
    }
  }, [commonLinks]);

  return (
    <td
      onContextMenu={(e) => {
        if (contextMenu.length > 0) {
          contextMenuHandler(e, correlation);
        }
      }}
      style={isEdited ? { backgroundColor: '#F7F2E0' } : {}}
    >
      {content.join('/')}
      <ContextMenu ref={contextRef} context={contextMenu} />
    </td>
  );
};

export default AdditionalColumnField;
