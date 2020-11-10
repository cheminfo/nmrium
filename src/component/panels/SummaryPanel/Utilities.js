import lodash from 'lodash';

import Correlation from '../../../data/correlation/Correlation';
import Link from '../../../data/correlation/Link';

import { ErrorColors, Errors } from './CorrelationTable/Constants';

const addToExperiments = (
  experiments,
  experimentsType,
  type,
  checkAtomType,
  experimentKey,
) => {
  const _experiments = lodash
    .get(experiments, `${type}`, []) // don't consider DEPT etc. here
    .filter((_experiment) => {
      const hasValues =
        lodash.get(
          _experiment,
          type.includes('1D') ? 'ranges.values' : 'zones.values',
          [],
        ).length > 0;
      return checkAtomType === true
        ? getAtomType(_experiment.info.nucleus) === experimentKey && hasValues
        : hasValues;
    });

  if (_experiments.length > 0) {
    experimentsType[experimentKey] = _experiments;
  }
  return _experiments;
};

const getAtomType = (nucleus) => nucleus.split(/\d+/)[1];

const getLabel = (correlation) => {
  let label = Object.keys(correlation.getAttachments())
    .map((otherAtomType) =>
      correlation
        .getAttachments()
        // eslint-disable-next-line no-unexpected-multiline
        [otherAtomType].map((index) =>
          correlation.getLabel(`${otherAtomType}${index + 1}`),
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
    .getCorrelation()
    .filter((_correlation) => _correlation.getExperimentType === experimentType)
    .map((_correlation) =>
      _correlation.match
        .map((match) => {
          const otherAtomType =
            _correlation.atomType[_correlation.axis === 'x' ? 1 : 0]; // reversed to get the other atom type
          const matchingCorrelation = correlations[otherAtomType][match.index];
          return getLabel(matchingCorrelation);
        })
        .flat(),
    )
    .flat()
    .filter((label, i, a) => label.length > 0 && a.indexOf(label) === i);

  return sortLabels(labels);
};

const getLabelColor = (state, correlation) => {
  const error = lodash.get(
    state,
    `atomType.${correlation.getAtomType()[0]}.error`,
    null,
  );
  if (error) {
    for (let errorIndex in Errors) {
      if (
        ErrorColors[errorIndex].key !== 'incomplete' && // do not consider this for a single atom
        lodash
          .get(error, `${ErrorColors[errorIndex].key}`, [])
          .some((id) => id === correlation.getID())
      ) {
        return ErrorColors[errorIndex].color;
      }
    }
  }

  return null;
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
            // .getValues()
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
                  // correlations.getValuesByAtomType(atomType).length + 1
                  correlations.filter(
                    (correlation) => correlation.getAtomType() === atomType,
                  ).length + 1
                }`,
              },
              signal: {
                id: signal2D.signal.id,
                delta: signal2D.signal[axis].delta,
              },
            });
            newCorrelation.addLink(link);
            // correlations.addValue(newCorrelation);
            correlations.push(newCorrelation);
          } else {
            matchedCorrelationIndices.forEach((index) => {
              if (
                !correlations[index] // .getValues()
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
                // correlations.getValues()[index].addLink(link);
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
  // correlations.getValues().forEach((correlation) => {
  correlations.forEach((correlation) => {
    correlation.getLinks().forEach((link) => {
      const otherAtomType =
        link.axis === 'x' ? link.atomType[1] : link.atomType[0];
      correlations
        // .getValuesByAtomType(otherAtomType)
        .filter((correlation) => correlation.getAtomType() === otherAtomType)
        .forEach((correlationOtherAtomType) => {
          // const indexCorrelationOtherAtomType = correlations.getValueIndex(
          //   correlationOtherAtomType.getID(),
          // );
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
        });
    });
  });
};

const setAttachments = (correlations) => {
  // update attachment information between heavy atoms and protons via HSQC or HMQC
  // correlations.getValues().forEach((correlation) => {
  correlations.forEach((correlation) => {
    const correlationIndexAtomType = correlations
      // .getValuesByAtomType(correlation.getAtomType())
      .filter(
        (_correlation) =>
          _correlation.getAtomType() === correlation.getAtomType(),
      )
      .findIndex(
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
            // const correlationProton = correlations.getValues()[matchIndex];
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

export {
  addFromData1D,
  addToExperiments,
  checkSignalMatch,
  getAtomType,
  getLabel,
  getLabels,
  getLabelColor,
  setAttachments,
  setCorrelations,
  setMatches,
};
