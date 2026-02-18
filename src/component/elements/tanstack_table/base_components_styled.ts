import styled from '@emotion/styled';

export const TableStyled = styled.table`
  border: 1px solid #dedede;
  border-spacing: 0;
  font-size: 12px;
  max-height: 100%;
  width: 100%;
`;

export const TRStyled = styled.tr``;
export const TDStyled = styled.td`
  border-bottom: 1px solid #dedede;
  border-right: 1px solid #dedede;
  margin: 0;
  padding: 0.15rem 0.4rem;
`;
export const THStyled = styled(TDStyled.withComponent('th'))``;

export const THeadStyled = styled.thead`
  position: sticky;
  top: 0;
  z-index: 1;
  color: white;
`;
export const TRHeadStyled = styled(TRStyled)``;
export const THHeadStyled = styled(THStyled)``;

export const TBodyStyled = styled.tbody``;
export const TRBodyStyled = styled(TRStyled)``;
export const TDBodyStyled = styled(TDStyled)``;

export const TRBodyEmptyStyled = styled(TRStyled)``;
export const TDBodyEmptyStyled = styled(TDStyled)``;
export const EmptyStateStyled = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100%;
  width: 100%;
  gap: 1em;
`;

export const TFootStyled = styled.tfoot``;
export const TRFootStyled = styled(TRStyled)``;
export const THFootStyled = styled(THStyled)``;
