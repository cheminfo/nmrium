import lodashCloneDeep from 'lodash/cloneDeep';
import lodashGet from 'lodash/get';
import {
  addLink,
  buildLink,
  getLinkDim,
  removeLink,
  Types,
} from 'nmr-correlation';

import { Datum2D } from '../../../data/data2d/Spectrum2D';
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
  link: Types.Link,
  factor: number,
  xDomain0: number,
  xDomain1: number,
) {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal2D(spectrum, link.signal.id);
    if (signal) {
      const otherAxis = link.axis === 'x' ? 'y' : 'x';
      return (
        signal[otherAxis].delta * factor >= xDomain0 &&
        signal[otherAxis].delta * factor <= xDomain1
      );
    }
  }
  return false;
}

function findSignalMatch2D(
  spectrum: Datum2D,
  link: Types.Link,
  factor: number,
  xDomain0: number,
  xDomain1: number,
  yDomain0: number,
  yDomain1: number,
): boolean {
  if (spectrum && spectrum.info.dimension === 2) {
    const signal = findSignal2D(spectrum, link.signal.id);
    if (signal) {
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

function getAbbreviation(link: Types.Link): string {
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

function buildNewLink2D(link: Types.Link, axis: 'x' | 'y') {
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

function cloneCorrelationAndAddOrRemoveLink(
  correlation: Types.Correlation,
  link: Types.Link,
  axis: 'x' | 'y',
  action: 'add' | 'remove',
): Types.Correlation {
  const linkDim = getLinkDim(link);
  const _correlation = lodashCloneDeep(correlation);
  if (action === 'add') {
    addLink(
      _correlation,
      linkDim === 1 ? buildNewLink1D(link) : buildNewLink2D(link, axis),
    );
  } else {
    const split = link.id.split('_');
    removeLink(_correlation, axis === 'x' ? split[0] : split[1]);
  }

  return _correlation;
}

export {
  buildNewLink1D,
  buildNewLink2D,
  cloneCorrelationAndAddOrRemoveLink,
  findSignalMatch1D,
  findSignalMatch2D,
  getAbbreviation,
  getAtomType,
  getLabelColor,
};
