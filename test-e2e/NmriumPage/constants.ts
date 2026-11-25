import { accordions as panels } from '../../src/component/panels/accordionItems.tsx';
import { options as tools } from '../../src/component/toolbar/ToolTypes.ts';

export type NmrViewerToolId = keyof typeof tools;

export const NMR_VIEWER_TOOLS = Object.freeze(
  Object.fromEntries(
    Object.entries(tools).map(([key, value]) => [key, value.label]),
  ) as Record<NmrViewerToolId, string>,
);

export type PanelId = keyof typeof panels;

export const PANELS = Object.freeze(
  Object.fromEntries(
    Object.entries(panels).map(([key, value]) => [key, value.title]),
  ) as Record<PanelId, string>,
);
