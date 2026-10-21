import type { ACSExportOptions } from '@zakodium/nmrium-core';

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
    <div>
      {shiftsOnly ? (
        <span>{value} ppm</span>
      ) : (
        // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
        <div dangerouslySetInnerHTML={{ __html: value }} />
      )}
    </div>
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

  return assignments.map((assignment) => (
    <AssignmentShift
      key={assignment.spectrum.id}
      assignment={assignment}
      shiftsOnly={options.row.isHydrogen}
    />
  ));
}
