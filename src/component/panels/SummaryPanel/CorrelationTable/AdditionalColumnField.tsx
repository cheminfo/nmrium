import lodashCloneDeep from 'lodash/cloneDeep';
import { addLink, buildLink, getCorrelationIndex } from 'nmr-correlation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

import { Datum2D } from '../../../../data/data2d/Spectrum2D';
import { buildID } from '../../../../data/utilities/Concatenation';
import generateID from '../../../../data/utilities/generateID';
import { useAssignmentData } from '../../../assignment';
import { useDispatch } from '../../../context/DispatchContext';
import ContextMenu from '../../../elements/ContextMenu';
import { useHighlight } from '../../../highlight';
import { DELETE_2D_SIGNAL } from '../../../reducer/types/Types';
import {
  findRangeOrZoneID,
  findSignal2D,
  findSpectrum,
  findZone,
  getAbbreviation,
} from '../Utilities';

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
  const dispatch = useDispatch();
  const assignmentData = useAssignmentData();

  const highlightIDsCommonLinks = useMemo(() => {
    const ids: Array<any> = [];
    commonLinks.forEach((link) => {
      if (link.pseudo === false) {
        ids.push(link.signal.id);
        ids.push(buildID(link.signal.id, 'Crosshair'));
        const _id = findRangeOrZoneID(spectraData, link, true);
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
    (experimentType: string, action: string, commonLink) => {
      const _rowCorrelation = lodashCloneDeep(rowCorrelation);
      const _columnCorrelation = lodashCloneDeep(columnCorrelation);
      const pseudoLinkCountHSQC = _rowCorrelation.link.filter(
        (link) =>
          link.experimentType === 'hsqc' || link.experimentType === 'hmqc',
      ).length;

      if (action === 'add') {
        const pseudoLinkID = generateID();
        const pseudoExperimentID = generateID();
        const commonPseudoLink = buildLink({
          experimentType,
          experimentID: pseudoExperimentID,
          atomType: [_columnCorrelation.atomType, _rowCorrelation.atomType],
          id: pseudoLinkID,
          pseudo: true,
          signal: { id: generateID(), sign: 0 }, // pseudo signal
        });

        addLink(
          _columnCorrelation,
          buildLink({
            ...commonPseudoLink,
            axis: 'x',
            match: [getCorrelationIndex(correlations, _rowCorrelation)],
          }),
        );
        addLink(
          _rowCorrelation,
          buildLink({
            ...commonPseudoLink,
            axis: 'y',
            match: [getCorrelationIndex(correlations, _columnCorrelation)],
          }),
        );
        if (!_rowCorrelation.edited.protonsCount) {
          _rowCorrelation.protonsCount = [pseudoLinkCountHSQC + 1];
        }
      } else if (action === 'remove') {
        // const split = commonLink.id.split('_');
        // const rowLinkID = split[0];
        // const columnLinkID = split[1];
        // removeLink(_rowCorrelation, rowLinkID);
        // removeLink(_columnCorrelation, columnLinkID);
        const spectrum = findSpectrum(
          spectraData,
          commonLink,
          false,
        ) as Datum2D;
        const zone = findZone(spectrum, commonLink);
        const signal = findSignal2D(spectrum, commonLink);

        dispatch({
          type: DELETE_2D_SIGNAL,
          payload: {
            spectrumID: spectrum.id,
            zoneID: zone?.id,
            signalID: signal?.id,
            assignmentData,
          },
        });

        if (!_rowCorrelation.edited.protonsCount) {
          _rowCorrelation.protonsCount =
            pseudoLinkCountHSQC - 1 > 0 ? [pseudoLinkCountHSQC - 1] : [];
        }
      } else if (action === 'move') {
        console.log('MOVE action');
      }

      onEdit(_rowCorrelation, _columnCorrelation);
    },
    [
      rowCorrelation,
      columnCorrelation,
      onEdit,
      correlations,
      spectraData,
      dispatch,
      assignmentData,
    ],
  );

  const contextMenu = useMemo(() => {
    // allow the movement or deletion of correlations
    const commonLinksMenu = commonLinks
      .map((commonLink) =>
        commonLink.pseudo === false
          ? [
              {
                label: `move ${getAbbreviation(
                  commonLink,
                )} (${commonLink.experimentType.toUpperCase()})`,
                onClick: () =>
                  onEditHandler(commonLink.experimentType, 'move', commonLink),
              },
              {
                label: `delete ${getAbbreviation(
                  commonLink,
                )} (${commonLink.experimentType.toUpperCase()})`,
                onClick: () => {
                  onEditHandler(
                    commonLink.experimentType,
                    'remove',
                    commonLink,
                  );
                },
              },
            ]
          : [],
      )
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
          onClick: () => {
            onEditHandler('hsqc', 'remove', commonPseudoLinkHSQC);
          },
        });
      } else {
        commonLinksMenu.push({
          label: 'add pseudo HSQC',
          onClick: () => {
            onEditHandler('hsqc', 'add', undefined);
          },
        });
      }
    }

    return commonLinksMenu;
  }, [commonLinks, onEditHandler, rowCorrelation.pseudo]);

  const content = useMemo(() => {
    const linkSet = new Set();
    commonLinks.forEach((commonLink) => {
      linkSet.add(getAbbreviation(commonLink));
    });

    return [...linkSet];
  }, [commonLinks]);

  const title = useMemo(
    () =>
      commonLinks
        .reduce((arr, link) => {
          if (!arr.includes(link.experimentType.toUpperCase())) {
            arr.push(link.experimentType.toUpperCase());
          }
          return arr;
        }, [])
        .sort()
        .join('/'),
    [commonLinks],
  );

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
