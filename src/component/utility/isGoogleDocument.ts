export function isGoogleDocument(url: string) {
  return /https:\/\/docs\.google\.com\/(?<type>document|spreadsheets)\/d/.test(
    url,
  );
}
