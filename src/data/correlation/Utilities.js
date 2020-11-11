import lodash from 'lodash';
import { MF } from 'mf-parser';

import Correlation from './Correlation';
import Link from './Link';

const getAtoms = (correlations) => {
  return lodash.get(correlations, 'options.mf', false)
    ? new MF(correlations.options.mf).getInfo().atoms
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
    lodash.cloneDeep(signals1D[atomType]).forEach((signal) => {
      correlations.push(
        new Correlation({
          ...signal,
        }),
      );
    });
  });
};

const setCorrelations = (correlations, signals2D, tolerance) => {
  Object.keys(signals2D).forEach((experimentType) =>
    signals2D[experimentType].forEach((experiment) =>
      experiment.signals.forEach((signal2D) =>
        experiment.atomType.forEach((atomType, dim) => {
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
            experimentType: experiment.experimentType,
            experimentID: experiment.experimentID,
            signalID: signal2D.signal.id,
            axis,
            atomType: experiment.atomType,
          });
          // in case of no signal match -> add new signal from 2D
          if (matchedCorrelationIndices.length === 0) {
            const newCorrelation = new Correlation({
              experimentType: experiment.experimentType,
              experimentID: experiment.experimentID,
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
          const indexCorrelationOtherAtomType = correlations.findIndex(
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
              linkOtherAtomType.getAxis() !== link.getAxis() &&
              !link
                .getMatches()
                .some(
                  (matchIndex) => matchIndex === indexCorrelationOtherAtomType,
                )
            ) {
              link.addMatch(indexCorrelationOtherAtomType);
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

const buildCorrelationsData = (signals1D, signals2D, tolerance) => {
  const correlations = [];
  // add all 1D signals
  addFromData1D(correlations, signals1D);
  // add signals from 2D if 1D signals for an atom type are missing
  // add correlations: 1D -> 2D
  setCorrelations(correlations, signals2D, tolerance);
  // link signals via matches to same 2D signal: e.g. 13C -> HSQC <- 1H
  setMatches(correlations);
  // set attachments via HSQC or HMQC, including labels
  setAttachments(correlations);

  return correlations;
};

const buildCorrelationsState = (correlations) => {
  const state = {};
  const atoms = getAtoms(correlations);

  const atomTypesInSpectra = correlations.values
    .map((correlation) => correlation.getAtomType())
    .filter((atomType, i, a) => a.indexOf(atomType) === i);

  atomTypesInSpectra.forEach((atomType) => {
    const correlationsAtomType = getCorrelationsByAtomType(
      correlations.values,
      atomType,
    );
    const atomCount = atoms[atomType];
    state[atomType] = {
      current: correlationsAtomType.length,
      total: atomCount,
      complete: correlationsAtomType.length === atomCount ? true : false,
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
      const attachedCount = correlationsAtomType.filter(
        (correlation) => Object.keys(correlation.getAttachments()).length > 0,
      ).length;
      const notAttached = correlations.values
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
      const ambiguousAttachment = correlations.values
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
      const outOfLimit = correlations.values
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
