import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

import { useTextMetrics } from '../hooks/useTextMetrics.ts';

const Container = styled.div`
  container-type: inline-size;
  container-name: header-cell;
  white-space: nowrap;
  overflow: hidden;
`;

const FullLabel = styled.span<{ widthThreshold: number }>`
  display: inline;

  @container header-cell (max-width: ${(props) => props.widthThreshold}px) {
    display: none;
  }
`;

const ShortLabel = styled.span<{ widthThreshold: number }>`
  display: none;

  @container header-cell (max-width: ${(props) => props.widthThreshold}px) {
    display: inline;
  }
`;

interface TableHeaderLabelProps extends Pick<
  CSSProperties,
  'fontStyle' | 'fontWeight'
> {
  text: string;
  shortText: string;
  widthThreshold?: number;
  fontSize?: number;
}

export function TableHeaderLabel(props: TableHeaderLabelProps) {
  const { text, shortText, widthThreshold, fontSize, fontStyle, fontWeight } =
    props;
  const textMetric = useTextMetrics({ fontSize, fontStyle, fontWeight });
  const targetWidth = widthThreshold ?? textMetric.getTextWidth(text) + 2;

  return (
    <Container>
      <FullLabel widthThreshold={targetWidth}>{text}</FullLabel>
      <ShortLabel widthThreshold={targetWidth}>{shortText}</ShortLabel>
    </Container>
  );
}
