/* eslint-disable prefer-named-capture-group */
/* eslint-disable react/no-danger */

function IsotopesViewer({ value = '', ...othersProps }) {
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
