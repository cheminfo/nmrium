import dlv from 'dlv';
import type { Spectrum } from 'nmr-load-save';

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

  const value = dlv(data, jpath);

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
