import lodashGet from 'lodash/get';
import { Spectrum } from 'nmr-load-save';

interface RenderAsHTMLProps {
  data: Spectrum;
  jpath: string | string[];
}

function formatValueAsHTML(value) {
  if (value) {
    value = value.replaceAll(/(?<value>\d+)/g, '<sub>$<value></sub>');
  }
  return value;
}

export function RenderAsHTML(props: RenderAsHTMLProps) {
  const { data, jpath } = props;

  const value = lodashGet(data, jpath);

  if (!value) {
    return null;
  }
  return (
    <div
      // style={styles.info}
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: formatValueAsHTML(value),
      }}
    />
  );
}
