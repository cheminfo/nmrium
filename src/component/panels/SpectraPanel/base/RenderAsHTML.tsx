import type { Spectrum } from '@zakodium/nmrium-core';
import dlv from 'dlv';

interface RenderAsHTMLProps {
  data: Spectrum;
  jpath: string | string[];
}

export function RenderAsHTML(props: RenderAsHTMLProps) {
  const { data, jpath } = props;

  const value = dlv(data, jpath);

  if (typeof value !== 'string') {
    return value;
  }

  return (
    <div
      // eslint-disable-next-line react/no-danger
      dangerouslySetInnerHTML={{
        __html: formatValueAsHTML(value),
      }}
    />
  );
}

function formatValueAsHTML(value: string) {
  return value.replaceAll(/(?<value>\d+)/g, '<sub>$<value></sub>');
}
