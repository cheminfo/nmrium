import { css } from '@emotion/react';

export const ModalStyles = css`
  overflow: auto;
  height: 100%;
  width: 100%;
  display: flex;
  flex-direction: column;
  user-select: none;

  button:focus {
    outline: none;
  }

  .container {
    padding: 20px;
  }

  .center-container {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  ul {
    list-style-type: disc;
    margin-left: 20px;
  }

  span,
  li {
    user-select: text;
  }

  span.title {
    font-weight: bold;
    color: #ea580c;
  }

  span.content {
    color: #2b143e;
    font-size: 14px;
    text-align: left;
  }

  img {
    width: 100px;
  }

  a {
    color: #969696;
  }

  a:hover,
  a:focus {
    color: #00bcd4;
  }

  .separator {
    border-bottom: 1px solid gray;
    width: 15px;
    height: 1px;
    margin: 10px 0;
  }

  .header {
    width: 100%;
    display: flex;
    justify-content: center;
    .header-title {
      color: #464646;
      font-size: 15px;
      user-select: none;
    }
  }

  .tab-content {
    width: 100%;
  }
  .row {
    display: flex;
  }

  .inner-content {
    padding: 15px 30px;
    width: 100%;
    overflow: auto;
  }

  .footer-container {
    display: flex;
    flex-direction: row;
    align-items: end;
    justify-content: end;

    background: rgb(242, 242, 242);
    background: linear-gradient(
      0deg,
      rgba(242, 242, 242, 1) 0%,
      rgba(245, 245, 245, 1) 37%,
      rgba(255, 255, 255, 1) 90%
    );
    padding: 6px 15px;
    height: 55px;
  }

  .section-header {
    font-size: 13px;
    color: #2ca8ff;
    margin-bottom: 10px;
    border-bottom: 0.55px solid #f9f9f9;
    padding: 6px 2px;
  }

  .custom-label {
    font-size: 12px;
    font-weight: bold;
    margin-right: 10px;
    width: 120px;
  }
  .margin-10 {
    margin: 10px 0;
  }
  .padding-h-10 {
    margin: 10px;
  }

  .close-bt {
    border: none;
    color: red;
    background-color: transparent;
    outline: none;
    position: absolute;
    right: 10px;
    top: 2px;
    width: 30px;
    height: 30px;
  }
`;
