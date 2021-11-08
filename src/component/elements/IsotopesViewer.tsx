import { HTMLAttributes } from 'react';

interface IsotopesViewerProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
}

function IsotopesViewer({ value = '', ...othersProps }: IsotopesViewerProps) {
  return (
    <div
      {...othersProps}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: value.replace(/(?<isotope>[0-9]+)/g, '<sup>$<isotope></sup>'),
      }}
    />
  );
}

export default IsotopesViewer;
