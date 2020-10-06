/* eslint-disable prefer-named-capture-group */
/* eslint-disable react/no-danger */
import React from 'react';

const IsotopesViewer = ({ value = '', ...othersProps }) => {
  return (
    <div
      {...othersProps}
      dangerouslySetInnerHTML={{
        __html: value.replace(/([0-9]+)/g, '<sup>$1</sup>'),
      }}
    />
  );
};

export default IsotopesViewer;
