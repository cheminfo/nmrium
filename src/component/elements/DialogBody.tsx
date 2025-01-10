import { DialogBody as BaseDialogBody } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { CSSProperties } from 'react';

export const DialogBody = styled(BaseDialogBody)<
  Pick<CSSProperties, 'padding' | 'backgroundColor'>
>`
  padding: ${({ padding = '15px' }) => padding};
  background-color: ${({ backgroundColor = 'white' }) => backgroundColor};
`;
