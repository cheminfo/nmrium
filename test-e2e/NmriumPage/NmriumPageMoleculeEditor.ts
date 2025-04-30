import type { Locator, Page } from '@playwright/test';

const TOOL_MARGIN = 2;
const TOOL_SIZE = 21;
const TOOL_OFFSET = TOOL_SIZE / 2;

const tools = {
  hexane: { row: 8, col: 1 },
  aromaticRing: { row: 9, col: 1 },
};

type ToolName = keyof typeof tools;

export class NmriumPageMoleculeEditor {
  readonly page: Page;
  readonly toolbarLocator: Locator;
  readonly drawAreaLocator: Locator;

  constructor(page: Page) {
    this.page = page;
    const canvasLocator = page
      .locator('_react=CanvasMoleculeEditor')
      .locator('canvas');
    this.toolbarLocator = canvasLocator.nth(0);
    this.drawAreaLocator = canvasLocator.nth(1);
  }

  clickTool(toolName: ToolName) {
    const tool = tools[toolName];
    return this.toolbarLocator.click({
      position: {
        x: TOOL_MARGIN + tool.col * TOOL_SIZE + TOOL_OFFSET,
        y: TOOL_MARGIN + tool.row * TOOL_SIZE + TOOL_OFFSET,
      },
    });
  }

  clickDrawArea(coordinates: { x: number; y: number }) {
    return this.drawAreaLocator.click({
      position: {
        x: coordinates.x,
        y: coordinates.y,
      },
    });
  }
}
