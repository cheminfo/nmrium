import type { Locator, Page } from '@playwright/test';

import type { BoundingBox } from '../playwright_types.ts';

interface MoveMouseOptions {
  x?: number;
  y?: number;
  steps?: number;
}

export class NmriumPageViewer {
  readonly page: Page;
  readonly locator: Locator;

  constructor(page: Page) {
    this.page = page;
    this.locator = page.getByTestId('viewer');
  }

  async getBoundingBox() {
    const bb = await this.locator.boundingBox();
    if (!bb) {
      throw new Error("Could not get viewer's bounding box");
    }
    return bb;
  }

  async moveMouse(options: MoveMouseOptions = {}) {
    const { x: bbX, y: bbY, width, height } = await this.getBoundingBox();
    const { x = width / 2, y = height / 2, steps = 5 } = options;
    await this.page.mouse.move(bbX + x, bbY + y, { steps });
  }

  async drawRectangle(options: SelectRangeOptions) {
    const { steps = 5, shift = false } = options;

    const boundingBox = await this.getBoundingBox();
    const { x1, y1, x2, y2 } = getBoundary(boundingBox, options);

    // Move the cursor to the starting position.
    await this.page.mouse.move(x1, y1, { steps });

    // Hold down mouse button and optionally shift key.
    if (shift) {
      await this.page.keyboard.down('Shift');
    }
    await this.page.mouse.down();

    // Move the cursor to the ending position.
    await this.page.mouse.move(x2, y2, { steps });

    // Release mouse button and shift key.
    // Shift has to be released first otherwise it doesn't work in Playwright.
    if (shift) {
      await this.page.keyboard.up('Shift');
    }
    await this.page.mouse.up();
  }
}

interface SelectRangeBaseOptions {
  shift?: boolean;
  steps?: number;
}

interface SelectXRangeOptions extends SelectRangeBaseOptions {
  axis: 'x';
  startX: number;
  endX: number;
}

interface SelectYRangeOptions extends SelectRangeBaseOptions {
  axis: 'y';
  startY: number;
  endY: number;
}

interface SelectXYRangeOptions extends SelectRangeBaseOptions {
  axis: 'xy';
  startX: number;
  startY: number;
  endX: number;
  endY: number;
}

type SelectRangeOptions =
  | SelectXRangeOptions
  | SelectYRangeOptions
  | SelectXYRangeOptions;

interface Boundary {
  x1: number;
  y1: number;
  x2: number;
  y2: number;
}

function getBoundary(
  boundingBox: BoundingBox,
  options: SelectRangeOptions,
): Boundary {
  const { x, y, width, height } = boundingBox;
  switch (options.axis) {
    case 'x': {
      const y = height / 2;
      return {
        x1: x + options.startX,
        y1: y,
        x2: x + options.endX,
        y2: y,
      };
    }
    case 'y': {
      const x = width / 2;
      return {
        x1: x,
        y1: y + options.startY,
        x2: x,
        y2: y + options.endY,
      };
    }
    case 'xy': {
      return {
        x1: x + options.startX,
        y1: y + options.startY,
        x2: x + options.endX,
        y2: y + options.endY,
      };
    }
    default: {
      throw new Error('unreachable');
    }
  }
}
