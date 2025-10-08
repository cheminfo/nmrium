import type { ParseError } from 'papaparse';

export function mapErrors(errors: ParseError[]) {
  const result: Record<string, string> = {};
  for (const error of errors) {
    if (error?.row) {
      result[error.row] = error.message;
    }
  }
  return result;
}
