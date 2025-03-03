import styled from '@emotion/styled';

export interface ContainerQueryWrapperProps {
  widthThreshold: number;
  narrowClassName: string;
  wideClassName: string;
}

export const ContainerQueryWrapper = styled.div<ContainerQueryWrapperProps>`
  container-type: inline-size;
  z-index: 1;

  @container (max-width:${({ widthThreshold }) => widthThreshold}px) {
    .${({ narrowClassName }) => narrowClassName} {
      display: block;
    }

    .${({ wideClassName }) => wideClassName} {
      display: none !important;
    }
  }

  @container (min-width:${({ widthThreshold }) => widthThreshold}px) {
    .${({ narrowClassName }) => narrowClassName} {
      display: none;
    }

    .${({ wideClassName }) => wideClassName} {
      display: block;
    }
  }
`;
