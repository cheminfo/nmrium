import styled from '@emotion/styled';
import { FallbackProps } from 'react-error-boundary';

const WrongP = styled.p`
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  font-size: 30px;
  text-align: center;
`;

const Details = styled.details`
  margin-top: 10px;
  white-space: pre-wrap;
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  color: red;
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
