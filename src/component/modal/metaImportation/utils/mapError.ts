import { ParseError } from 'papaparse';

export function mapError(errors: ParseError[]) {
  const result = {};
  for (const error of errors) {
    result[error.row] = error.message;
  }
  return result;
}
