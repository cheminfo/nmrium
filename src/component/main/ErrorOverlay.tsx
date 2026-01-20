import styled from '@emotion/styled';
import type { ReactNode } from 'react';
import type { FallbackProps } from 'react-error-boundary';

const WrongP = styled.p`
  background-color: white;
  border-radius: 10px;
  font-size: 30px;
  padding: 20px;
  text-align: center;
`;

const Details = styled.details`
  background-color: white;
  border-radius: 10px;
  color: red;
  margin-top: 10px;
  padding: 20px;
  white-space: pre-wrap;
`;

export default function ErrorOverlay(props: FallbackProps) {
  const error = props.error;
  const message =
    error && typeof error === 'object' && 'message' in error
      ? error.message
      : null;
  const stack =
    error && typeof error === 'object' && 'stack' in error ? error.stack : null;

  return (
    <div style={{ margin: 25 }}>
      <WrongP>Something went wrong.</WrongP>
      <Details>
        <p style={{ textDecoration: 'underline' }}>{message as ReactNode}</p>
        {stack as ReactNode}
      </Details>
    </div>
  );
}
