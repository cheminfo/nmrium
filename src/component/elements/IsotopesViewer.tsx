import type { HTMLAttributes } from 'react';

interface IsotopesViewerProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
}

function renderIsotope(value: string) {
  return value.replaceAll(/(?<isotope>\d+)/g, '<sup>$<isotope></sup>');
}

function IsotopesViewer({ value = '', ...othersProps }: IsotopesViewerProps) {
  return (
    <div
      {...othersProps}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: renderIsotope(value),
      }}
    />
  );
}

export default IsotopesViewer;
