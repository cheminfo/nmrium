/* eslint-disable prefer-named-capture-group */
/* eslint-disable react/no-danger */

import { HTMLAttributes } from 'react';

interface IsotopesViewerProps extends HTMLAttributes<HTMLDivElement> {
  value?: string;
}

function IsotopesViewer({ value = '', ...othersProps }: IsotopesViewerProps) {
  return (
    <div
      {...othersProps}
      dangerouslySetInnerHTML={{
        __html: value.replace(/([0-9]+)/g, '<sup>$1</sup>'),
      }}
    />
  );
}

export default IsotopesViewer;
