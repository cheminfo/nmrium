import type { ACSExportOptions } from '@zakodium/nmrium-core';
import { Fragment } from 'react';

import { useACSSettings } from '../../hooks/use_acs_settings.js';

import type {
  AssignmentSignals,
  GetAssignmentSignalsOptions,
} from './assignmentSignals.js';
import {
  formatAssignmentSignals,
  getAssignmentSignals,
} from './assignmentSignals.js';

interface AssignmentShiftLineProps {
  assignment: AssignmentSignals;
  shiftsOnly: boolean;
}

const acsOptions: Partial<ACSExportOptions> = {
  signalKind: 'signal',
  ascending: true,
  format: 'IMJ',
  textStyle: {},
};

function AssignmentShift(options: AssignmentShiftLineProps) {
  const { assignment, shiftsOnly } = options;
  const { spectrum } = assignment;
  const acs = useACSSettings(spectrum.info.nucleus);
  const value = formatAssignmentSignals({
    assignment,
    acs: {
      ...acs,
      ...acsOptions,
    },
    format: shiftsOnly ? 'shifts' : 'acs',
  });

  return (
    <span>
      {shiftsOnly ? (
        <span>{value} ppm</span>
      ) : (
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
        <span dangerouslySetInnerHTML={{ __html: value }} />
      )}
    </span>
  );
}

interface AssignmentChemicalShiftCellProps {
  options: GetAssignmentSignalsOptions;
}

export function AssignmentChemicalShiftCell(
  props: AssignmentChemicalShiftCellProps,
) {
  const { options } = props;
  const assignments = getAssignmentSignals(options);

  // Separate spectra's values with commas while retaining per-spectrum formatting.
  return assignments.map((assignment, index) => (
    <Fragment key={assignment.spectrum.id}>
      {index > 0 && ', '}
      <AssignmentShift
        assignment={assignment}
        shiftsOnly={options.row.isHydrogen}
      />
    </Fragment>
  ));
}
