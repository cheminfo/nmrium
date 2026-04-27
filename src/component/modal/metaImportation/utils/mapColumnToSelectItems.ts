export function mapColumnToSelectItems(fields: string[]) {
  const items = [{ value: '', label: 'Select source field' }];

  for (const fieldName of fields) {
    if (fieldName) {
      items.push({ value: fieldName, label: fieldName });
    }
  }

  return items;
}
