import { DialogBody } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

export const StyledDialogBody = styled(DialogBody)<
  Pick<CSSProperties, 'padding' | 'backgroundColor'>
>`
  background-color: ${({ backgroundColor = 'white' }) => backgroundColor};
  margin: 0;
  padding: ${({ padding = '15px' }) => padding};
`;
