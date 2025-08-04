import styled from '@emotion/styled';
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
  return (
    <div style={{ margin: 25 }}>
      <WrongP>Something went wrong.</WrongP>
      <Details>
        <p style={{ textDecoration: 'underline' }}>{props.error.message}</p>
        {props.error.stack}
      </Details>
    </div>
  );
}
