import type { Locator } from '@playwright/test';

export type BoundingBox = Exclude<
  Awaited<ReturnType<Locator['boundingBox']>>,
  null
>;
