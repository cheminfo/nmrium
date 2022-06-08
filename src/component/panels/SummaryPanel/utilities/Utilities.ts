import { FromTo } from 'cheminfo-types';
import lodashCloneDeep from 'lodash/cloneDeep';
import lodashGet from 'lodash/get';
import {
  addLink,
  buildCorrelation,
  buildLink,
  getLinkDelta,
  getLinkDim,
  removeLink,
  Correlation,
  Link,
} from 'nmr-correlation';

import DefaultPathLengths from '../../../../data/constants/DefaultPathLengths';
import { Datum2D } from '../../../../data/types/data2d';
import {
  findSignal2D,
  findSpectrum,
} from '../../../../data/utilities/FindUtilities';
import { Spectra } from '../../../NMRium';
import isDefaultPathLength from '../../../modal/editZone/validation/isDefaultPathLength';
import { ActiveSpectrum } from '../../../reducer/Reducer';
import { DISPLAYER_MODE } from '../../../reducer/core/Constants';
import { ErrorColors } from '../CorrelationTable/Constants';

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
  let abbreviation = 'X';
  if (link.experimentType === 'hsqc' || link.experimentType === 'hmqc') {
    abbreviation =
      !link.signal || link.signal.sign === 0
        ? 'S'
        : `S${link.signal.sign === 1 ? '+' : '-'}`;
  } else if (
    link.experimentType === 'hmbc' ||
    link.experimentType === 'cosy' ||
    link.experimentType === 'tocsy'
  ) {
    abbreviation = 'M';
  } else if (
    link.experimentType === 'noesy' ||
    link.experimentType === 'roesy'
  ) {
    abbreviation = 'NOE';
  } else if (link.experimentType === 'inadequate') {
    abbreviation = 'I';
  } else if (link.experimentType === 'adequate') {
    abbreviation = 'A';
  }

  const pathLength: FromTo | undefined = link.signal.j?.pathLength;
  if (pathLength) {
    const isDefaultCorrelation =
      DefaultPathLengths[link.experimentType] &&
      pathLength.from >= DefaultPathLengths[link.experimentType].from &&
      pathLength.from <= DefaultPathLengths[link.experimentType].to &&
      pathLength.to >= DefaultPathLengths[link.experimentType].from &&
      pathLength.to <= DefaultPathLengths[link.experimentType].to;

    return `${abbreviation}${isDefaultCorrelation ? '' : '*'}`;
  }

  return abbreviation;
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
  selectedCorrelationIdDim1,
  selectedCorrelationIdDim2,
  action,
  link,
  correlations,
}: {
  correlationDim1: Correlation;
  correlationDim2: Correlation;
  action: 'move' | 'remove' | 'unmove' | 'setPathLength';
  selectedCorrelationIdDim1: string | undefined;
  selectedCorrelationIdDim2: string | undefined;
  link: Link;
  correlations: Correlation[];
}) {
  const selectedCorrelationDim1 = correlations.find(
    (correlation) => correlation.id === selectedCorrelationIdDim1,
  );
  const selectedCorrelationDim2 = correlations.find(
    (correlation) => correlation.id === selectedCorrelationIdDim2,
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
        selectedCorrelationIdDim2 === 'new'
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
        selectedCorrelationIdDim1 === 'new' &&
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
        selectedCorrelationIdDim1 === 'new' &&
        selectedCorrelationIdDim2 === 'new'
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
  } else if (action === 'setPathLength') {
    editedCorrelations.push(
      cloneCorrelationAndSetPathLength(correlationDim1, link, 'x'),
    );
    editedCorrelations.push(
      cloneCorrelationAndSetPathLength(correlationDim2, link, 'y'),
    );
  }

  return { editedCorrelations, buildCorrelationDataOptions };
}

function cloneCorrelationAndSetPathLength(
  correlation: Correlation,
  editedLink: Link,
  axis: 'x' | 'y',
): Correlation {
  const _correlation = lodashCloneDeep(correlation);
  const linkDim = getLinkDim(editedLink);
  if (linkDim === 2) {
    const editedLinkID = editedLink.id.split('_')[axis === 'x' ? 0 : 1];
    const _link = _correlation.link.find((link) => link.id === editedLinkID);
    if (_link) {
      const newPathLength: FromTo = editedLink.signal.j?.pathLength;
      // remove (previous) pathLength if it is same as default
      if (isDefaultPathLength(newPathLength, _link.experimentType)) {
        delete _link.signal.j?.pathLength;
        if (_link.signal.j && Object.keys(_link.signal.j).length === 0) {
          delete _link.signal.j;
        }
        delete _link.edited.pathLength;
      } else {
        if (!_link.signal.j) {
          _link.signal.j = { pathLength: newPathLength };
        } else {
          _link.signal.j.pathLength = newPathLength;
        }
        _link.edited.pathLength = true;
      }
    }
  }

  return _correlation;
}

function convertValuesString(
  valuesString: string,
  key: 'protonsCount' | 'hybridization',
): number[] {
  valuesString = valuesString
    .toLowerCase()
    .replace(/\s+/g, '')
    .split(',')
    .map((token) => (token === 'sp' ? 'sp1' : token))
    .join(',');
  valuesString = valuesString.replaceAll('sp', '');

  let values: number[] = [];
  const regex = /^(?:[0-9],{0,1})+$/g;
  if (regex.test(valuesString)) {
    // allow digits followed by optional comma only
    values = valuesString
      .split(',')
      .filter((char) => char.length > 0)
      .map((char) => Number(char));
  }

  // allow key specific values only
  // protonsCount: [0, 1, 2, 3, ...], hybridization: [1, 2, 3]
  values = values.filter(
    (value) =>
      value >= (key === 'protonsCount' ? 0 : 1) &&
      (key === 'protonsCount' || value <= 3),
  );

  // unique values
  return values.filter((index, i, a) => a.indexOf(index) === i);
}

function isInView(
  spectraData: Spectra,
  activeTab: string,
  activeSpectrum: ActiveSpectrum | null,
  xDomain: number[],
  yDomain: number[],
  displayerMode: string,
  correlation: Correlation,
): boolean {
  if (correlation.pseudo === true) {
    return false;
  }

  if (
    activeSpectrum === null ||
    !correlation.link.some((link) => link.experimentID === activeSpectrum.id)
  ) {
    return false;
  }

  const atomTypesInView = activeTab.split(',').map((tab) => getAtomType(tab));

  const factor = 10000;
  const xDomain0 = xDomain[0] * factor;
  const xDomain1 = xDomain[1] * factor;
  const yDomain0 = yDomain[0] * factor;
  const yDomain1 = yDomain[1] * factor;

  if (displayerMode === DISPLAYER_MODE.DM_1D) {
    const firstLink1D = correlation.link.find((link) => getLinkDim(link) === 1);
    if (!firstLink1D) {
      return false;
    }
    let delta = getLinkDelta(firstLink1D);
    if (delta === undefined) {
      return false;
    }
    delta *= factor;
    const spectrum = findSpectrum(spectraData, firstLink1D.experimentID, true);
    if (
      spectrum &&
      atomTypesInView[0] === correlation.atomType &&
      delta >= xDomain0 &&
      delta <= xDomain1
    ) {
      return true;
    }
    // try to find a link which contains the belonging 2D signal in the spectra in view
    if (
      correlation.link.some((link) => {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          true,
        ) as Datum2D;
        return findSignalMatch1D(spectrum, link, factor, xDomain0, xDomain1);
      })
    ) {
      return true;
    }
  } else if (displayerMode === DISPLAYER_MODE.DM_2D) {
    if (!atomTypesInView.includes(correlation.atomType)) {
      return false;
    }
    const firstLink2D = correlation.link.find((link) => getLinkDim(link) === 2);
    if (!firstLink2D) {
      return false;
    }
    const spectrum = findSpectrum(
      spectraData,
      firstLink2D.experimentID,
      true,
    ) as Datum2D;
    // correlation is represented by a 2D signal
    if (
      findSignalMatch2D(
        spectrum,
        firstLink2D,
        factor,
        xDomain0,
        xDomain1,
        yDomain0,
        yDomain1,
      )
    ) {
      return true;
    }
    // try to find a link which contains the belonging 2D signal in the spectra in view
    else if (
      correlation.link.some((link) => {
        const spectrum = findSpectrum(
          spectraData,
          link.experimentID,
          true,
        ) as Datum2D;
        return findSignalMatch2D(
          spectrum,
          link,
          factor,
          xDomain0,
          xDomain1,
          yDomain0,
          yDomain1,
        );
      })
    ) {
      return true;
    }
  }
  // do not show correlation
  return false;
}

export {
  buildNewLink1D,
  buildNewLink2D,
  cloneCorrelationAndEditLink,
  convertValuesString,
  findSignalMatch1D,
  findSignalMatch2D,
  getAbbreviation,
  getAtomType,
  getEditedCorrelations,
  getLabelColor,
  isInView,
};
