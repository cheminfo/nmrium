import type { Locator } from '@playwright/test';

/**
 * Get the body rows of a table, without the header rows.
 * @param table - The table locator.
 */
export function getTableRows(table: Locator) {
  return table.getByRole('row').filter({ has: table.page().getByRole('cell') });
}

/**
 * Get a cell of a table body, by its row index and its column header.
 * The table must have a single header row, and no cell spanning multiple
 * columns before the requested column.
 * @param table - The table locator.
 * @param row - The index of the row in the table body. Negative indices count from the end.
 * @param column - The text of the column header.
 */
export async function getTableCell(
  table: Locator,
  row: number,
  column: string,
) {
  const columnHeaders = table.getByRole('columnheader');
  await columnHeaders.first().waitFor();
  const headers = await columnHeaders.allInnerTexts();
  const columnIndex = headers.findIndex((header) => header.trim() === column);
  if (columnIndex === -1) {
    throw new Error(
      `Column "${column}" not found in table headers: ${JSON.stringify(headers)}`,
    );
  }
  return getTableRows(table).nth(row).getByRole('cell').nth(columnIndex);
}
