import lodashCloneDeep from 'lodash/cloneDeep';
import lodashGet from 'lodash/get';
import {
  addLink,
  buildCorrelation,
  buildLink,
  getLinkDim,
  removeLink,
  Link,
  Correlation,
} from 'nmr-correlation';

import { Datum2D } from '../../../data/types/data2d';
import { findSignal2D } from '../../../data/utilities/FindUtilities';

import { ErrorColors } from './CorrelationTable/Constants';

function getAtomType(nucleus: string): string {
  return nucleus.split(/\d+/)[1];
}

function getLabelColor(correlationData, correlation) {
  const error = lodashGet(
    correlationData,
    `state.${correlation.atomType}.error`,
    null,
  );

  if (error) {
    for (let { key, color } of ErrorColors) {
      if (
        key !== 'incomplete' && // do not consider this for a single atom type
        (key === 'notAttached' || key === 'ambiguousAttachment') &&
        lodashGet(error, `${key}`, []).some(
          (index) => correlationData.values[index].id === correlation.id,
        )
      ) {
        return color;
      }
    }
  }

  return null;
}

function findSignalMatch1D(
  spectrum: Datum2D,
  link: Link,
  factor: number,
  xDomain0: number,
  xDomain1: number,
) {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal2D(spectrum, link.signal.id);
    if (signal) {
      const otherAxis = link.axis === 'x' ? 'y' : 'x';
      const delta = signal[otherAxis]?.delta;
      if (delta !== undefined) {
        return delta * factor >= xDomain0 && delta * factor <= xDomain1;
      }
    }
  }
  return false;
}

function findSignalMatch2D(
  spectrum: Datum2D,
  link: Link,
  factor: number,
  xDomain0: number,
  xDomain1: number,
  yDomain0: number,
  yDomain1: number,
): boolean {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal2D(spectrum, link.signal.id);
    if (signal?.x.delta && signal?.y.delta) {
      return (
        signal.x.delta * factor >= xDomain0 &&
        signal.x.delta * factor <= xDomain1 &&
        signal.y.delta * factor >= yDomain0 &&
        signal.y.delta * factor <= yDomain1
      );
    }
  }
  return false;
}

function getAbbreviation(link: Link): string {
  if (link.experimentType === 'hsqc' || link.experimentType === 'hmqc') {
    return !link.signal || link.signal.sign === 0
      ? 'S'
      : `S${link.signal.sign === 1 ? '+' : '-'}`;
  } else if (
    link.experimentType === 'hmbc' ||
    link.experimentType === 'cosy' ||
    link.experimentType === 'tocsy'
  ) {
    return 'M';
  } else if (
    link.experimentType === 'noesy' ||
    link.experimentType === 'roesy'
  ) {
    return 'NOE';
  } else if (link.experimentType === 'inadequate') {
    return 'I';
  } else if (link.experimentType === 'adequate') {
    return 'A';
  }

  return 'X';
}

function buildNewLink1D(link) {
  return buildLink({
    ...link,
    edited: {
      ...link.edited,
      moved: true,
    },
  });
}

function buildNewLink2D(link: Link, axis: 'x' | 'y') {
  const linkIDs = link.id.split('_');
  return buildLink({
    ...link,
    id: linkIDs[axis === 'x' ? 0 : 1],
    axis,
    match: [],
    edited: {
      ...link.edited,
      moved: true,
    },
  });
}

function cloneCorrelationAndEditLink(
  correlation: Correlation,
  link: Link,
  axis: 'x' | 'y',
  action: 'add' | 'remove' | 'unmove',
): Correlation {
  const linkDim = getLinkDim(link);
  const _correlation = lodashCloneDeep(correlation);
  const split = link.id.split('_');
  if (action === 'add') {
    addLink(
      _correlation,
      linkDim === 1 ? buildNewLink1D(link) : buildNewLink2D(link, axis),
    );
  } else if (action === 'remove' || action === 'unmove') {
    removeLink(_correlation, axis === 'x' ? split[0] : split[1]);
  }

  return _correlation;
}

function getEditedCorrelations({
  correlationDim1,
  correlationDim2,
  selectedCorrelationValueDim1,
  selectedCorrelationValueDim2,
  action,
  link,
  correlations,
}) {
  const selectedCorrelationDim1 = correlations.find(
    (correlation) => correlation.id === selectedCorrelationValueDim1,
  );
  const selectedCorrelationDim2 = correlations.find(
    (correlation) => correlation.id === selectedCorrelationValueDim2,
  );
  const hasChangedDim1 = selectedCorrelationDim1?.id !== correlationDim1.id;
  const hasChangedDim2 =
    correlationDim2 && selectedCorrelationDim2?.id !== correlationDim2?.id;
  const linkDim = getLinkDim(link);

  const editedCorrelations: Correlation[] = [];
  const buildCorrelationDataOptions: {
    skipDataUpdate?: boolean;
  } = {};

  if (action === 'move') {
    if (linkDim === 1) {
      // modify current cell correlation
      const _correlationDim1 = cloneCorrelationAndEditLink(
        correlationDim1,
        link,
        'x',
        'remove',
      );
      // modify selected correlation
      let newCorrelationDim1: Correlation;
      if (selectedCorrelationDim1) {
        newCorrelationDim1 = cloneCorrelationAndEditLink(
          hasChangedDim1 ? selectedCorrelationDim1 : _correlationDim1,
          link,
          'x',
          'add',
        );
      } else {
        newCorrelationDim1 = buildCorrelation({
          atomType: correlationDim1.atomType,
          link: [buildNewLink1D(link)],
        });
      }
      editedCorrelations.push(_correlationDim1, newCorrelationDim1);
      buildCorrelationDataOptions.skipDataUpdate = true;
    } else if (linkDim === 2) {
      // modify current cell correlations
      const _correlationDim1 = cloneCorrelationAndEditLink(
        correlationDim1,
        link,
        'x',
        'remove',
      );
      editedCorrelations.push(_correlationDim1);
      const _correlationDim2 = cloneCorrelationAndEditLink(
        correlationDim2,
        link,
        'y',
        'remove',
      );
      editedCorrelations.push(_correlationDim2);

      // modify selected correlations
      if (selectedCorrelationDim1 && selectedCorrelationDim2) {
        editedCorrelations.push(
          cloneCorrelationAndEditLink(
            hasChangedDim1 ? selectedCorrelationDim1 : _correlationDim1,
            link,
            'x',
            'add',
          ),
        );
        editedCorrelations.push(
          cloneCorrelationAndEditLink(
            hasChangedDim2 ? selectedCorrelationDim2 : _correlationDim2,
            link,
            'y',
            'add',
          ),
        );
      } else if (
        selectedCorrelationDim1 &&
        selectedCorrelationValueDim2 === 'new'
      ) {
        editedCorrelations.push(
          cloneCorrelationAndEditLink(
            hasChangedDim1 ? selectedCorrelationDim1 : _correlationDim1,
            link,
            'x',
            'add',
          ),
        );
        editedCorrelations.push(
          buildCorrelation({
            atomType: correlationDim2.atomType,
            link: [buildNewLink2D(link, 'y')],
          }),
        );
      } else if (
        selectedCorrelationValueDim1 === 'new' &&
        selectedCorrelationDim2
      ) {
        editedCorrelations.push(
          buildCorrelation({
            atomType: correlationDim1.atomType,
            link: [buildNewLink2D(link, 'x')],
          }),
        );
        editedCorrelations.push(
          cloneCorrelationAndEditLink(
            hasChangedDim2 ? selectedCorrelationDim2 : _correlationDim2,
            link,
            'y',
            'add',
          ),
        );
      } else if (
        selectedCorrelationValueDim1 === 'new' &&
        selectedCorrelationValueDim2 === 'new'
      ) {
        editedCorrelations.push(
          buildCorrelation({
            atomType: correlationDim1.atomType,
            link: [buildNewLink2D(link, 'x')],
          }),
        );
        editedCorrelations.push(
          buildCorrelation({
            atomType: correlationDim2.atomType,
            link: [buildNewLink2D(link, 'y')],
          }),
        );
      }
      buildCorrelationDataOptions.skipDataUpdate = true;
    }
  } else if (action === 'remove') {
    const _correlationDim1 = cloneCorrelationAndEditLink(
      correlationDim1,
      link,
      'x',
      'remove',
    );
    editedCorrelations.push(_correlationDim1);
    if (getLinkDim(link) === 2) {
      const _correlationDim2 = cloneCorrelationAndEditLink(
        correlationDim2,
        link,
        'y',
        'remove',
      );
      editedCorrelations.push(_correlationDim2);
    }
  } else if (action === 'unmove') {
    if (linkDim === 1) {
      if (selectedCorrelationDim1) {
        editedCorrelations.push(
          cloneCorrelationAndEditLink(
            selectedCorrelationDim1,
            link,
            'x',
            'unmove',
          ),
        );
      }
    } else if (linkDim === 2) {
      if (selectedCorrelationDim1 && selectedCorrelationDim2) {
        editedCorrelations.push(
          cloneCorrelationAndEditLink(
            selectedCorrelationDim1,
            link,
            'x',
            'unmove',
          ),
        );
        editedCorrelations.push(
          cloneCorrelationAndEditLink(
            selectedCorrelationDim2,
            link,
            'y',
            'unmove',
          ),
        );
      }
    }
  }

  return { editedCorrelations, buildCorrelationDataOptions };
}

export {
  buildNewLink1D,
  buildNewLink2D,
  cloneCorrelationAndEditLink,
  findSignalMatch1D,
  findSignalMatch2D,
  getAbbreviation,
  getAtomType,
  getEditedCorrelations,
  getLabelColor,
};
