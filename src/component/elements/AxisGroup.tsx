import styled from '@emotion/styled';

export const AxisGroup = styled.g`
  user-select: none;

  path,
  line {
    fill: none;
    stroke: black;
    stroke-width: 1;
    shape-rendering: crispedges;
    user-select: none;
  }
`;
