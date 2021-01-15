import lodash from 'lodash';

import Correlation from '../Correlation';
import Link from '../Link';

import {
  checkSignalMatch,
  getAtomCounts,
  getAtomCountsByMF,
  getCorrelationsByAtomType,
} from './GeneralUtilities';
import { setProtonsCountFromData } from './ProtonsCountUtilities';

const addFromData1D = (correlations, signals1D, tolerance) => {
  Object.keys(signals1D).forEach((atomType) => {
    signals1D[atomType].forEach((signal1D) => {
      const match = correlations.some(
        (correlation) =>
          correlation.getPseudo() === false &&
          correlation.getAtomType() === atomType &&
          checkSignalMatch(
            correlation.getSignal(),
            signal1D.signal,
            tolerance[atomType],
          ),
      );
      if (!match) {
        const pseudoIndex = correlations.findIndex(
          (correlation) =>
            correlation.getAtomType() === atomType &&
            correlation.getPseudo() === true &&
            !correlation.hasLinks(),
        );
        if (pseudoIndex >= 0) {
          correlations[pseudoIndex] = new Correlation({
            ...signal1D,
          });
        } else {
          correlations.push(
            new Correlation({
              ...signal1D,
            }),
          );
        }
      }
    });
  });
};

const addFromData2D = (correlations, signals2D, tolerance) => {
  Object.keys(signals2D).forEach((experimentType) =>
    signals2D[experimentType].forEach((signal2D) =>
      signal2D.atomType.forEach((atomType, dim) => {
        const axis = dim === 0 ? 'x' : 'y';
        const matchedCorrelationIndices = correlations
          .map((correlation, k) =>
            correlation.getPseudo() === false &&
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
          signal: signal2D.signal,
          axis,
          atomType: signal2D.atomType,
        });
        // in case of no signal match -> add new signal from 2D
        if (matchedCorrelationIndices.length === 0) {
          const newCorrelation = new Correlation({
            experimentType: signal2D.experimentType,
            experimentID: signal2D.experimentID,
            atomType,
            signal: {
              id: signal2D.signal.id,
              delta: signal2D.signal[axis].delta,
              sign: signal2D.signal.sign,
            },
          });
          newCorrelation.addLink(link);

          const pseudoIndex = correlations.findIndex(
            (correlation) =>
              correlation.getAtomType() === atomType &&
              correlation.getPseudo() === true &&
              !correlation.hasLinks(),
          );
          if (pseudoIndex >= 0) {
            correlations[pseudoIndex] = newCorrelation;
          } else {
            correlations.push(newCorrelation);
          }
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
      // remove previous added matches
      link.removeMatches();
      // add matches
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

  // remove links without any matches
  correlations.forEach((correlation) => {
    const linksToRemove = correlation
      .getLinks()
      .filter((link) => link.getMatches().length === 0);
    linksToRemove.forEach((link) => correlation.removeLink(link.getID()));
  });
};

const setAttachmentsAndProtonEquivalences = (correlations) => {
  // update attachment information between heavy atoms and protons via HSQC or HMQC
  correlations.forEach((correlation) => {
    // remove previous set attachments
    correlation.removeAttachments();
    // add attachments
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
        });
      });
  });
  // reset previously set proton equivalences and set new ones
  // check heavy atoms with an unambiguous protons count
  correlations.forEach((correlation) => {
    if (
      correlation.getAtomType() !== 'H' &&
      correlation.getProtonsCount().length === 1 &&
      correlation.hasAttachmentAtomType('H')
    ) {
      let equivalences = 0;
      if (correlation.getProtonsCount()[0] === 3) {
        equivalences = 2;
      } else if (correlation.getProtonsCount()[0] === 2) {
        equivalences = 1;
      }
      const factor = 1 + correlation.getEquivalences();
      const sharedEquivalences =
        (factor * (1 + equivalences)) / correlation.getAttachments().H.length -
        1;
      correlation.getAttachments().H.forEach((attachedProtonIndex) => {
        correlations[attachedProtonIndex].setEquivalences(sharedEquivalences);
      });
    }
  });
};

const updatePseudoCorrelations = (correlations, mf) => {
  const atoms = getAtomCountsByMF(mf);
  // add pseudo correlations
  addPseudoCorrelations(correlations, atoms);
  // remove pseudo correlations to be replaced by equivalences
  replacePseudoCorrelationsByEquivalences(correlations, atoms);
  // remove pseudo correlations which are out of limit, clean up links and proton counts
  checkPseudoCorrelations(correlations, atoms);
  // update indices
  setIndices(correlations);

  return correlations;
};

const addPseudoCorrelations = (correlations, atoms) => {
  Object.keys(atoms).forEach((atomType) => {
    // consider also pseudo correlations since they do not need to be added again
    const atomTypeCount = getCorrelationsByAtomType(correlations, atomType)
      .length;
    // add missing pseudo correlations
    for (let i = atomTypeCount; i < atoms[atomType]; i++) {
      correlations.push(
        new Correlation({
          atomType,
          pseudo: true,
        }),
      );
    }
  });
};

const replacePseudoCorrelationsByEquivalences = (correlations, atoms) => {
  Object.keys(atoms).forEach((atomType) => {
    // remove pseudo correlations to be replaced by equivalences, starting at the end
    const atomTypeEquivalencesCount = correlations.reduce(
      (sum, correlation) =>
        correlation.getAtomType() === atomType &&
        correlation.getPseudo() === false
          ? sum + correlation.getEquivalences()
          : sum,
      0,
    );
    const pseudoCorrelationsAtomType = correlations.filter(
      (correlation) =>
        correlation.getAtomType() === atomType &&
        correlation.getPseudo() === true,
    );
    for (let i = atomTypeEquivalencesCount - 1; i >= 0; i--) {
      if (pseudoCorrelationsAtomType.length === 0) {
        break;
      }
      const pseudoCorrelationToRemove = pseudoCorrelationsAtomType.pop();
      correlations.splice(correlations.indexOf(pseudoCorrelationToRemove), 1);
    }
  });
};

const checkPseudoCorrelations = (correlations, atoms) => {
  Object.keys(atoms).forEach((atomType) => {
    // consider also pseudo correlations
    const correlationsAtomType = getCorrelationsByAtomType(
      correlations,
      atomType,
    );
    if (correlationsAtomType.length > atoms[atomType]) {
      // remove pseudo correlations which are out of limit and are not linked
      const pseudoCorrelationsAtomType = correlationsAtomType.filter(
        (correlation) =>
          correlation.getPseudo() === true && !correlation.hasLinks(),
      );
      for (let i = correlationsAtomType.length - 1; i >= atoms[atomType]; i--) {
        if (pseudoCorrelationsAtomType.length === 0) {
          break;
        }
        const pseudoCorrelationToRemove = pseudoCorrelationsAtomType.pop();
        correlations.splice(correlations.indexOf(pseudoCorrelationToRemove), 1);
      }
    }
  });
  // check for deleted links and correct proton counts if no HSQC link exists
  correlations.forEach((pseudoCorrelation) => {
    if (pseudoCorrelation.getPseudo() === true) {
      // remove wrong (old) match indices and empty links
      const linksToRemove = [];
      pseudoCorrelation.getLinks().forEach((pseudoLink) => {
        for (let i = 0; i < pseudoLink.getMatches().length; i++) {
          const matchIndex = pseudoLink.getMatches()[i];
          if (
            !correlations[matchIndex] ||
            !correlations[matchIndex]
              .getLinks()
              .some((_link) =>
                _link.getMatches().includes(pseudoCorrelation.getIndex()),
              )
          ) {
            pseudoLink.removeMatch(matchIndex);
          }
        }
        if (pseudoLink.getMatches().length === 0) {
          linksToRemove.push(pseudoLink);
        }
      });
      linksToRemove.forEach((pseudoLink) =>
        pseudoCorrelation.removeLink(pseudoLink.getID()),
      );
      // correct protons count if no HSQC was found and the field was not edited manually
      if (
        !pseudoCorrelation.getEdited().protonsCount &&
        !pseudoCorrelation
          .getLinks()
          .some((pseudoLink) => pseudoLink.getExperimentType() === 'hsqc')
      ) {
        pseudoCorrelation.setProtonsCount([]);
      }
    }
  });
};

const removeDeletedCorrelations = (correlations, signals1D, signals2D) => {
  const _correlations = correlations.filter(
    (correlation) => correlation.getPseudo() === false,
  );
  const removeList = _correlations.slice();
  _correlations.forEach((correlation) => {
    if (correlation.getExperimentType() === '1d') {
      // search in 1D data
      if (
        lodash
          .get(signals1D, correlation.getAtomType(), [])
          .some((signal1D) => signal1D.signal.id === correlation.getSignal().id)
      ) {
        const index = removeList.indexOf(correlation);
        if (index >= 0) {
          removeList.splice(index, 1);
        }
      }
    } else {
      // search in 2D data
      if (
        lodash
          .get(signals2D, `${correlation.getExperimentType()}`, [])
          .some(
            (signal2D) =>
              signal2D.atomType.indexOf(correlation.getAtomType()) !== -1 &&
              signal2D.signal.id === correlation.getSignal().id,
          )
      ) {
        const index = removeList.indexOf(correlation);
        if (index >= 0) {
          removeList.splice(index, 1);
        }
      }
    }
  });

  removeList.forEach((correlation) => {
    const index = correlations.indexOf(correlation); // in case we already removed previously
    if (index >= 0) {
      correlations.splice(index, 1);
    }
  });
};

const setLabels = (correlations) => {
  const atomTypeCounts = {};
  correlations.forEach((correlation) => {
    if (!lodash.get(atomTypeCounts, correlation.getAtomType(), false)) {
      atomTypeCounts[correlation.getAtomType()] = 0;
    }
    atomTypeCounts[correlation.getAtomType()]++;
    correlation.setLabel(
      'origin',
      `${correlation.getAtomType()}${
        atomTypeCounts[correlation.getAtomType()]
      }`,
    );
  });
};

const setIndices = (correlations) => {
  // set indices to correlations
  correlations.forEach((correlation, i) => correlation.setIndex(i));
};

const sortCorrelations = (correlations) => {
  const compare = (corr1, corr2) => {
    if (
      (corr1.getPseudo() === false && corr2.getPseudo() === true) ||
      corr1.getSignal().delta < corr2.getSignal().delta
    ) {
      return -1;
    }
    if (
      (corr1.getPseudo() === true && corr2.getPseudo() === false) ||
      corr1.getSignal().delta > corr2.getSignal().delta
    ) {
      return 1;
    }
    return 0;
  };

  let sortedCorrelations = [];
  const atomTypes = correlations
    .map((correlation) => correlation.getAtomType())
    .filter((atomType, i, a) => a.indexOf(atomType) === i);
  atomTypes.forEach((atomType) => {
    const correlationsAtomType = getCorrelationsByAtomType(
      correlations,
      atomType,
    );
    correlationsAtomType.sort(compare);
    sortedCorrelations = sortedCorrelations.concat(correlationsAtomType);
  });
  // set indices to correlations
  setIndices(sortedCorrelations);

  return sortedCorrelations;
};

const buildCorrelationsState = (correlationData) => {
  const state = {};
  const atoms = getAtomCounts(correlationData);
  const atomTypesInCorrelations = correlationData.values.reduce(
    (array, correlation) =>
      array.includes(correlation.getAtomType())
        ? array
        : array.concat(correlation.getAtomType()),
    [],
  );

  atomTypesInCorrelations.forEach((atomType) => {
    const correlationsAtomType = getCorrelationsByAtomType(
      correlationData.values,
      atomType,
    );
    // create error for specific atom type only if there is at least one real correlation
    if (
      correlationsAtomType.some(
        (correlation) => correlation.getPseudo() === false,
      )
    ) {
      let atomCountAtomType = correlationsAtomType.reduce(
        (sum, correlation) =>
          correlation.getPseudo() === false
            ? sum + 1 + correlation.getEquivalences()
            : sum,
        0,
      );
      // add protons count from pseudo correlations
      if (atomType === 'H') {
        correlationData.values.forEach((correlation) => {
          if (
            correlation.getPseudo() === true &&
            correlation.getAtomType() !== 'H' &&
            correlation.getProtonsCount().length === 1
          ) {
            atomCountAtomType += correlation.getProtonsCount()[0];
          }
        });
      }
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
        const notAttached = correlationsAtomType.reduce(
          (array, correlation) =>
            Object.keys(correlation.getAttachments()).length === 0
              ? array.concat(correlation.getIndex())
              : array,
          [],
        );
        if (notAttached.length > 0) {
          createErrorProperty();
          state[atomType].error.notAttached = notAttached;
        }
        const ambiguousAttachment = correlationsAtomType.reduce(
          (array, correlation) =>
            Object.keys(correlation.getAttachments()).length > 1 ||
            Object.keys(correlation.getAttachments()).some(
              (otherAtomType) =>
                correlation.getAttachments()[otherAtomType].length > 1,
            )
              ? array.concat(correlation.getIndex())
              : array,
          [],
        );
        if (ambiguousAttachment.length > 0) {
          createErrorProperty();
          state[atomType].error.ambiguousAttachment = ambiguousAttachment;
        }
      }

      const outOfLimit = correlationsAtomType.some(
        (correlation, k) =>
          correlation.getPseudo() === false &&
          correlation.getAtomType() === atomType &&
          k >= atomCount,
      );
      if (outOfLimit) {
        createErrorProperty();
        state[atomType].error.outOfLimit = true;
      }
    }
  });

  return state;
};

const buildCorrelationsData = (
  signals1D,
  signals2D,
  signalsDEPT,
  mf,
  tolerance,
  correlations,
) => {
  let _correlations = correlations.slice();
  // remove deleted correlations
  removeDeletedCorrelations(_correlations, signals1D, signals2D);
  // add all 1D signals
  addFromData1D(_correlations, signals1D, tolerance);
  // add signals from 2D if 1D signals for an atom type and belonging shift are missing
  // add correlations: 1D -> 2D
  addFromData2D(_correlations, signals2D, tolerance);
  // set the number of attached protons via DEPT or edited HSQC
  setProtonsCountFromData(_correlations, signalsDEPT, signals2D, tolerance);

  updateCorrelationsData(_correlations, mf);

  return _correlations;
};

const updateCorrelationsData = (correlations, mf) => {
  // sort by atom type and shift value
  correlations = sortCorrelations(correlations);
  // link signals via matches to same 2D signal: e.g. 13C -> HSQC <- 1H
  setMatches(correlations);
  // set attachments via HSQC or HMQC
  setAttachmentsAndProtonEquivalences(correlations);
  // update pseudo correlation
  updatePseudoCorrelations(correlations, mf);
  // set labels
  setLabels(correlations);

  return correlations;
};

export {
  buildCorrelationsData,
  buildCorrelationsState,
  updateCorrelationsData,
};
