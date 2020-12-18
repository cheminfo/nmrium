import lodash from 'lodash';
import { MF } from 'mf-parser';

import Correlation from './Correlation';
import Link from './Link';

const getAtomsByMF = (mf) => {
  return mf ? new MF(mf).getInfo().atoms : [];
};

const getAtoms = (correlations) => {
  return lodash.get(correlations, 'options.mf', false)
    ? getAtomsByMF(correlations.options.mf)
    : {};
};

const getLabel = (correlations, correlation) => {
  let label = Object.keys(correlation.getAttachments())
    .map((otherAtomType) =>
      correlation
        .getAttachments()
        // eslint-disable-next-line no-unexpected-multiline
        [otherAtomType].map((index) =>
          correlation.getLabel(correlations[index].getLabel('origin')),
        )
        .filter((_label) => _label),
    )
    .flat()
    .filter((_label, i, a) => a.indexOf(_label) === i)
    .sort((a, b) =>
      Number(a.split(/[a-z]+/i)[1]) - Number(b.split(/[a-z]+/i)[1]) < 0
        ? -1
        : Number(a.split(/[a-z]+/i)[1]) - Number(b.split(/[a-z]+/i)[1]) === 0 &&
          a.split(/\d+/)[1] < b.split(/\d+/)[1]
        ? -1
        : 1,
    )
    .join('/');

  if (label.length > 0) {
    return label;
  }

  return correlation.getLabel('origin');
};

const sortLabels = (labels) => {
  return labels.sort((a, b) =>
    Number(a.split(/[a-z]+/i)[1]) - Number(b.split(/[a-z]+/i)[1]) < 0
      ? -1
      : Number(a.split(/[a-z]+/i)[1]) - Number(b.split(/[a-z]+/i)[1]) === 0 &&
        a.split(/\d+/)[1] < b.split(/\d+/)[1]
      ? -1
      : 1,
  );
};

const getLabels = (correlations, correlation, experimentType) => {
  const labels = correlation
    .getLinks()
    .filter((link) => link.getExperimentType() === experimentType)
    .map((link) =>
      link
        .getMatches()
        .map((match) => {
          const matchingCorrelation = correlations[match];
          return getLabel(correlations, matchingCorrelation);
        })
        .flat(),
    )
    .flat()
    .filter((label, i, a) => label.length > 0 && a.indexOf(label) === i);

  return sortLabels(labels);
};

const checkSignalMatch = (signal1, signal2, tolerance) =>
  signal1.delta - tolerance <= signal2.delta &&
  signal2.delta <= signal1.delta + tolerance;

const letters = [...Array(26).keys()].map((i) => String.fromCharCode(i + 97));

const getLetter = (number) => {
  return letters[number];
};

const addFromData1D = (correlations, signals1D) => {
  Object.keys(signals1D).forEach((atomType) => {
    lodash.cloneDeep(signals1D[atomType]).forEach((signal1D) => {
      correlations.push(
        new Correlation({
          ...signal1D,
        }),
      );
    });
  });
};

const setCorrelations = (correlations, signals2D, tolerance) => {
  Object.keys(signals2D).forEach((experimentType) =>
    signals2D[experimentType].forEach((signal2D) =>
      signal2D.atomType.forEach((atomType, dim) => {
        const axis = dim === 0 ? 'x' : 'y';
        const matchedCorrelationIndices = correlations
          .map((correlation, k) =>
            correlation.getAtomType() === atomType &&
            checkSignalMatch(
              correlation.getSignal(),
              signal2D.signal[axis],
              tolerance[atomType],
            )
              ? k
              : -1,
          )
          .filter((index) => index >= 0)
          .filter((index, i, a) => a.indexOf(index) === i);

        const link = new Link({
          experimentType: signal2D.experimentType,
          experimentID: signal2D.experimentID,
          signalID: signal2D.signal.id,
          axis,
          atomType: signal2D.atomType,
        });
        // in case of no signal match -> add new signal from 2D
        if (matchedCorrelationIndices.length === 0) {
          const newCorrelation = new Correlation({
            experimentType: signal2D.experimentType,
            experimentID: signal2D.experimentID,
            atomType,
            label: {
              origin: `${atomType}${
                getCorrelationsByAtomType(correlations, atomType).length + 1
              }`,
            },
            signal: {
              id: signal2D.signal.id,
              delta: signal2D.signal[axis].delta,
            },
          });
          newCorrelation.addLink(link);
          correlations.push(newCorrelation);
        } else {
          matchedCorrelationIndices.forEach((index) => {
            if (
              !correlations[index]
                .getLinks()
                .some(
                  (_link) =>
                    _link.getExperimentType() === link.getExperimentType() &&
                    _link.getExperimentID() === link.getExperimentID() &&
                    lodash.isEqual(_link.getAtomType(), link.getAtomType()) &&
                    _link.getSignalID() === link.getSignalID() &&
                    _link.getAxis() === link.getAxis(),
                )
            ) {
              correlations[index].addLink(link);
            }
          });
        }
      }),
    ),
  );
};

const setMatches = (correlations) => {
  correlations.forEach((correlation) => {
    correlation.getLinks().forEach((link) => {
      const otherAtomType =
        link.axis === 'x' ? link.atomType[1] : link.atomType[0];
      getCorrelationsByAtomType(correlations, otherAtomType).forEach(
        (correlationOtherAtomType) => {
          const correlationIndexOtherAtomType = correlations.findIndex(
            (_correlation) =>
              _correlation.getID() === correlationOtherAtomType.getID(),
          );
          correlationOtherAtomType.getLinks().forEach((linkOtherAtomType) => {
            // check for correlation match and avoid possible duplicates
            if (
              linkOtherAtomType.getExperimentType() ===
                link.getExperimentType() &&
              linkOtherAtomType.getExperimentID() === link.getExperimentID() &&
              lodash.isEqual(
                linkOtherAtomType.getAtomType(),
                link.getAtomType(),
              ) &&
              linkOtherAtomType.getSignalID() === link.getSignalID() &&
              linkOtherAtomType.getAxis() !== link.getAxis()
            ) {
              link.addMatch(correlationIndexOtherAtomType);
            }
          });
        },
      );
    });
  });
};

const setAttachments = (correlations) => {
  // update attachment information between heavy atoms and protons via HSQC or HMQC
  correlations.forEach((correlation) => {
    const correlationIndexAtomType = getCorrelationsByAtomType(
      correlations,
      correlation.getAtomType(),
    ).findIndex(
      (correlationAtomType) =>
        correlationAtomType.getID() === correlation.getID(),
    );
    correlation
      .getLinks()
      .filter(
        (link) =>
          link.getExperimentType() === 'hsqc' ||
          link.getExperimentType() === 'hmqc',
      )
      .forEach((link) => {
        const otherAtomType = link.getAtomType()[
          link.getAxis() === 'x' ? 1 : 0
        ];
        link.getMatches().forEach((matchIndex) => {
          correlation.addAttachment(otherAtomType, matchIndex);
          if (otherAtomType === 'H') {
            const correlationProton = correlations[matchIndex];
            correlationProton.setLabel(
              `${correlation.getAtomType()}${correlationIndexAtomType + 1}`,
              `H${correlationIndexAtomType + 1}${getLetter(
                correlation.getAttachments()[otherAtomType].length - 1,
              )}`,
            );
          }
        });
      });
  });
};

const getCorrelationsByAtomType = (correlations, atomType) => {
  return correlations
    ? correlations.filter(
        (correlation) => correlation.getAtomType() === atomType,
      )
    : [];
};

const setProtonsCountViaDEPT = (
  correlations,
  signalsDEPT,
  tolerance,
  atomType,
) => {
  const _correlations = correlations.filter(
    (correlation) => correlation.getAtomType() === atomType,
  );
  const signalsDEPT90 = lodash
    .get(signalsDEPT, '90', [])
    .filter((signalDEPT90) => signalDEPT90.atomType === atomType);
  const signalsDEPT135 = lodash
    .get(signalsDEPT, '135', [])
    .filter((signalDEPT135) => signalDEPT135.atomType === atomType);

  for (let i = 0; i < _correlations.length; i++) {
    const match = [-1, -1];
    for (let k = 0; k < signalsDEPT90.length; k++) {
      if (
        signalsDEPT90[k].signal.position === 1 &&
        checkSignalMatch(
          _correlations[i].signal,
          signalsDEPT90[k].signal,
          tolerance[atomType],
        )
      ) {
        match[0] = k;
        break;
      }
    }
    for (let k = 0; k < signalsDEPT135.length; k++) {
      if (
        checkSignalMatch(
          _correlations[i].signal,
          signalsDEPT135[k].signal,
          tolerance[atomType],
        )
      ) {
        match[1] = k;
        break;
      }
    }

    if (match[0] >= 0) {
      // signal match in DEPT90
      // CH
      _correlations[i].setProtonsCount(1);
    } else {
      // no signal match in DEPT90
      if (match[1] >= 0) {
        // signal match in DEPT135
        if (signalsDEPT135[match[1]].signal.position === 1) {
          // positive signal
          // CH3
          _correlations[i].setProtonsCount(3);
        } else {
          // negative signal
          // CH2
          _correlations[i].setProtonsCount(2);
        }
      } else {
        // no signal match in both spectra
        // qC
        _correlations[i].setProtonsCount(0);
      }
    }
  }
};

// const setProtonsCountViaEditedHSQC = (correlations, signals2D, tolerance) => {};

const addPseudoCorrelations = (correlations, mf) => {
  const atoms = getAtomsByMF(mf);
  Object.keys(atoms).forEach((atomType) => {
    const atomTypeCountInCorrelations = correlations.filter(
      (correlation) => correlation.getAtomType() === atomType,
    ).length;
    for (let i = atomTypeCountInCorrelations; i < atoms[atomType]; i++) {
      correlations.push(
        new Correlation({
          atomType,
          label: { origin: atomType + (i + 1) },
          pseudo: true,
        }),
      );
    }
  });

  return correlations;
};

const buildCorrelationsData = (
  signals1D,
  signals2D,
  signalsDEPT,
  tolerance,
  mf,
) => {
  if (!mf) {
    return [];
  }
  const correlations = [];
  // add all 1D signals
  addFromData1D(correlations, signals1D);
  // add signals from 2D if 1D signals for an atom type and belonging shift are missing
  // add correlations: 1D -> 2D
  setCorrelations(correlations, signals2D, tolerance);
  // link signals via matches to same 2D signal: e.g. 13C -> HSQC <- 1H
  setMatches(correlations);
  // set the number of attached protons via DEPT, for now C only -> extendable
  setProtonsCountViaDEPT(correlations, signalsDEPT, tolerance, 'C');
  // set attachments via HSQC or HMQC, including labels
  setAttachments(correlations);
  // add pseudo correlations regarding molecular formula
  addPseudoCorrelations(correlations, mf);

  // console.log(correlations);

  return correlations;
};

const buildCorrelationsState = (correlations) => {
  const state = {};
  const atoms = getAtoms(correlations);

  const _correlations = {
    ...correlations,
    values: correlations.values.filter(
      (correlation) => correlation.getPseudo() === false,
    ),
  };

  const atomTypesInCorrelations = _correlations.values
    .map((correlation) => correlation.getAtomType())
    .filter((atomType, i, a) => a.indexOf(atomType) === i);

  atomTypesInCorrelations.forEach((atomType) => {
    const correlationsAtomType = getCorrelationsByAtomType(
      _correlations.values,
      atomType,
    );
    const atomCountAtomType = correlationsAtomType.reduce(
      (sum, correlation) => sum + 1 + correlation.getEquivalences(),
      0,
    );
    const atomCount = atoms[atomType];
    state[atomType] = {
      current: atomCountAtomType,
      total: atomCount,
      complete: atomCountAtomType === atomCount ? true : false,
    };
    const createErrorProperty = () => {
      if (!lodash.get(state, `${atomType}.error`, false)) {
        state[atomType].error = {};
      }
    };
    if (!state[atomType].complete) {
      createErrorProperty();
      state[atomType].error.incomplete = true;
    }
    if (atomType === 'H') {
      const attachedCount = correlationsAtomType
        .filter(
          (correlation) => Object.keys(correlation.getAttachments()).length > 0,
        )
        .reduce((sum, correlation) => sum + correlation.getEquivalences(), 0);
      const notAttached = _correlations.values
        .map((correlation, k) =>
          correlation.getAtomType() === atomType &&
          Object.keys(correlation.getAttachments()).length === 0
            ? k
            : -1,
        )
        .filter((index) => index >= 0);
      if (notAttached.length > 0) {
        createErrorProperty();
        state[atomType].error.notAttached = notAttached;
      }
      const outOfLimit = notAttached
        .map((correlationIndex, k) =>
          k >= Math.abs(attachedCount - atomCount) ? correlationIndex : -1,
        )
        .filter((index) => index >= 0);
      if (outOfLimit.length > 0) {
        createErrorProperty();
        state[atomType].error.outOfLimit = outOfLimit;
      }
      const ambiguousAttachment = _correlations.values
        .map((correlation, k) =>
          correlation.getAtomType() === atomType &&
          (Object.keys(correlation.getAttachments()).length > 1 ||
            Object.keys(correlation.getAttachments()).some(
              (otherAtomType) =>
                correlation.getAttachments()[otherAtomType].length > 1,
            ))
            ? k
            : -1,
        )
        .filter((index) => index >= 0);
      if (ambiguousAttachment.length > 0) {
        createErrorProperty();
        state[atomType].error.ambiguousAttachment = ambiguousAttachment;
      }
    } else {
      let counter = 0;
      const outOfLimit = _correlations.values
        .map((correlation, k) => {
          if (correlation.getAtomType() === atomType) {
            if (counter >= atomCount) {
              return k;
            }
            counter++;
          }
          return -1;
        })
        .filter((index) => index >= 0);
      if (outOfLimit.length > 0) {
        createErrorProperty();
        state[atomType].error.outOfLimit = outOfLimit;
      }
    }
  });

  return state;
};

export {
  addFromData1D,
  buildCorrelationsData,
  buildCorrelationsState,
  checkSignalMatch,
  getAtoms,
  getCorrelationsByAtomType,
  getLabel,
  getLabels,
  getLetter,
  setCorrelations,
  setAttachments,
  setMatches,
};
