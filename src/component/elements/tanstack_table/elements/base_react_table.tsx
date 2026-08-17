import styled from '@emotion/styled';

export const BaseReactTable = styled.table`
  border: 1px solid #dedede;
  border-spacing: 0;
  font-size: 12px;
  max-height: 100%;
  width: 100%;

  .react-contextmenu-wrapper {
    display: contents;
  }

  th,
  td {
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;
    margin: 0;
    padding: 0.15rem 0.4rem;
  }

  tr {
    :last-child {
      td {
        border-bottom: 0;
      }
    }
  }

  th {
    position: sticky;
    top: 0;
    background-color: white;
    z-index: 0;
  }
`;
