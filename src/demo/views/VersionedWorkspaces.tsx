import type { CustomWorkspacesInput } from '@zakodium/nmrium-core';

import View from './View.js';

const legacyPeaksPreferences = {
  showSerialNumber: true,
  deltaPPM: { show: true, format: '0.00' },
  deltaHz: { show: true, format: '0.00' },
  peakWidth: { show: false, format: '0.00' },
  intensity: { show: true, format: '0.00' },
  fwhm: { show: true, format: '0.0000' },
  mu: { show: false, format: '0.0000' },
  gamma: { show: false, format: '0.0000' },
  showDeleteAction: true,
  showEditPeakShapeAction: true,
  showKind: true,
  defaultPeakShape: { kind: 'pseudoVoigt', fwhm: 1, mu: 0.5 },
};

const legacyRangesPreferences = {
  jGraphTolerance: 0.2,
  isSumConstant: true,
  showSerialNumber: true,
  from: { show: true, format: '0.00' },
  to: { show: true, format: '0.00' },
  absolute: { show: false, format: '0.00' },
  relative: { show: true, format: '0.00' },
  deltaPPM: { show: true, format: '0.00' },
  deltaHz: { show: false, format: '0.00' },
  coupling: { show: true, format: '0.00' },
  showMultiplicity: true,
  showAssignment: true,
  showAssignmentLabel: false,
  showKind: true,
  showDeleteAction: true,
  showZoomAction: true,
  showEditAction: true,
};

/**
 * Two workspaces stored in the version 19 shape: the peaks and ranges
 * preferences are still flat, and the peaks areas do not exist yet. NMRium
 * migrates both of them to the current version on load.
 */
const customWorkspaces = {
  version: 19,
  workspaces: {
    legacyPeaks: {
      label: 'Legacy peaks (v19)',
      visible: true,
      display: {
        panels: {
          peaksPanel: { display: true, visible: true, open: true },
          rangesPanel: { display: false, visible: false, open: false },
        },
      },
      panels: { peaks: { nuclei: { '1H': legacyPeaksPreferences } } },
    },
    legacyRanges: {
      label: 'Legacy ranges (v19)',
      visible: true,
      display: {
        panels: {
          peaksPanel: { display: false, visible: false, open: false },
          rangesPanel: { display: true, visible: true, open: true },
        },
      },
      panels: { ranges: { nuclei: { '1H': legacyRangesPreferences } } },
    },
  },
} as unknown as CustomWorkspacesInput;

export default function VersionedWorkspaces(props: any) {
  return (
    <View
      {...props}
      workspace="legacyPeaks"
      customWorkspaces={customWorkspaces}
    />
  );
}
