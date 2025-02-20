import { DialogBody } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

export const StyledDialogBody = styled(DialogBody)<
  Pick<CSSProperties, 'padding' | 'backgroundColor'>
>`
  padding: ${({ padding = '15px' }) => padding};
  background-color: ${({ backgroundColor = 'white' }) => backgroundColor};
  margin: 0;
`;
