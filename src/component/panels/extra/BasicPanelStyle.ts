import styled from '@emotion/styled';

export const TablePanel = styled.div<{ isFlipped?: boolean }>`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 100%;

  .inner-container {
    height: 100%;
    overflow: hidden;
    isolation: isolate;
  }

  .table-container {
    overflow: auto;
    height: 100%;
    display: block;
    background-color: white;

    ${(props) =>
      props.isFlipped &&
      `
        table,
        th {
          position: relative !important;
        }
      `}
  }
`;
