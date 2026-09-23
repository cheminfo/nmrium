import { Tooltip } from '@blueprintjs/core';
import type { Spectrum } from '@zakodium/nmrium-core';
import dlv from 'dlv';
import type { HTMLAttributes } from 'react';

interface RenderAsHTMLProps {
  data: Spectrum;
  jpath: string | string[];
}

interface HTMLContentProps extends HTMLAttributes<HTMLDivElement> {
  html: string;
}

function HTMLContent({ html }: HTMLContentProps) {
  return (
    // eslint-disable-next-line @eslint-react/dom-no-dangerously-set-innerhtml
    <div dangerouslySetInnerHTML={{ __html: html }} />
  );
}

export function RenderAsHTML(props: RenderAsHTMLProps) {
  const { data, jpath } = props;

  const value = dlv(data, jpath);

  if (typeof value !== 'string') {
    return value;
  }

  const formattedHTML = formatValueAsHTML(value);

  return (
    <Tooltip
      content={<HTMLContent html={formattedHTML} />}
      renderTarget={({ isOpen, ...targetProps }) => {
        return (
          <div {...targetProps}>
            <HTMLContent html={formattedHTML} />
          </div>
        );
      }}
    />
  );
}

function formatValueAsHTML(value: string) {
  return value.replaceAll(/(?<value>\d+)/g, '<sub>$<value></sub>');
}
