/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';

const style = css`
  height: 100vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #f4f4f4;

  #title {
    padding: 20px 0;
  }

  #title strong:first-child {
    color: #c25a00;
  }

  #loader {
    border: 1px solid #f3f3f3;
    border-top: 3px solid #c25a00;
    border-radius: 50%;
    width: 50px;
    height: 50px;
    animation: spin 0.6s linear infinite;
  }

  @keyframes spin {
    0% {
      transform: rotate(0deg);
    }

    100% {
      transform: rotate(360deg);
    }
  }
`;

export function Loading() {
  return (
    <div css={style}>
      <span id="title">
        <strong>NMR</strong>
        <strong>ium</strong> loading ...
      </span>
      <div id="loader" />
    </div>
  );
}
