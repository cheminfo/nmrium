import { css } from '@emotion/react';

import type { InputStyle } from '../Input.js';

const ReactTableStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  max-height: 100%;
  font-size: 12px;

  .react-contextmenu-wrapper {
    display: contents;
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
    background-color: white;
    z-index: 0;
    top: 0;
  }
  th,
  td {
    margin: 0;
    padding: 0.15rem 0.4rem;
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;
  }
`;

const tableInputStyle: InputStyle = {
  input: {
    width: '100%',
    backgroundColor: 'transparent',
  },
  inputWrapper: {
    borderRadius: 0,
    borderWidth: 0,
  },
};

export { ReactTableStyle, tableInputStyle };
