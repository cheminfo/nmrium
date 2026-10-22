import { Fragment } from 'react';

import { useACSSettings } from '../../../hooks/use_acs_settings.js';
import { formatAssignmentACS } from '../utilities/formatAssignmentACS.js';
import { formatAssignmentShifts } from '../utilities/formatAssignmentShifts.js';
import { getAssignmentSignals } from '../utilities/getAssignmentSignals.js';
import type {
  AssignmentSignals,
  GetAssignmentSignalsOptions,
} from '../utilities/types.js';

interface AssignmentShiftLineProps {
  assignment: AssignmentSignals;
  shiftsOnly: boolean;
}

function AssignmentShift(options: AssignmentShiftLineProps) {
  const { assignment, shiftsOnly } = options;
  const { spectrum } = assignment;
  const acs = useACSSettings(spectrum.info.nucleus);
  const value = shiftsOnly
    ? formatAssignmentShifts({ assignment, deltaFormat: acs.deltaFormat })
    : formatAssignmentACS({ assignment, acs });

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
