import styled from '@emotion/styled';

const LoadingContainer = styled.div`
  align-items: center;
  background-color: #f4f4f4;
  display: flex;
  flex-direction: column;
  height: 100vh;
  justify-content: center;

  #title {
    padding: 20px 0;
  }

  #title strong:first-child {
    color: #c25a00;
  }

  #loader {
    animation: spin 0.6s linear infinite;
    border: 1px solid #f3f3f3;
    border-radius: 50%;
    border-top: 3px solid #c25a00;
    height: 50px;
    width: 50px;
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
    <LoadingContainer>
      <span id="title">
        <strong>NMR</strong>
        <strong>ium</strong> loading ...
      </span>
      <div id="loader" />
    </LoadingContainer>
  );
}
