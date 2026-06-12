export * from './types.js';

export * from './NMRium.js';
export type { NMRiumRefAPI } from './NMRiumRefAPI.js';

// Helpers for plugins that render into the core `molecules_panel.*` UI slots.
export type { Molecule3DData } from '../../data/molecules/Molecule.js';
export { useHighlightData } from '../highlight/index.js';
export { useAssignmentContext } from '../assignment/AssignmentsContext.js';
export { useChartData } from '../context/ChartContext.js';
export { useDispatch } from '../context/DispatchContext.js';
export { useMoleculePanelSlot } from '../panels/MoleculesPanel/MoleculePanelSlotContext.js';
export type { MoleculePanelSlotData } from '../panels/MoleculesPanel/MoleculePanelSlotContext.js';
export { getHighlightsOnHover } from '../panels/MoleculesPanel/utilities/getHighlightsOnHover.js';
export { getCurrentDiaIDsToHighlight } from '../panels/MoleculesPanel/utilities/getCurrentDiaIDsToHighlight.js';
export { default as useAtomAssignment } from '../panels/MoleculesPanel/hooks/useAtomAssignment.js';
