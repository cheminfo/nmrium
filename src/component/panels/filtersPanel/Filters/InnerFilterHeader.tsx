import styled from '@emotion/styled';

import { Sections } from '../../../elements/Sections';

export const StickyHeader = styled(Sections.Header)`
  position: sticky;
  top: 40px;
  background-color: white;
  z-index: 1;
  box-shadow: rgb(0 0 0 / 16%) 0 1px 4px;
`;

export const HeaderContainer = styled.div`
  display: flex;
  justify-content: space-between;
`;
