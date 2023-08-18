import styled from '@emotion/styled';
import { MouseEvent } from 'react';
import { Button, useOnOff } from 'react-science/ui';

import { useDispatch } from '../../context/DispatchContext';

export default function AboutUsZakodium() {
  const [isSecretOpen, openSecret] = useOnOff();
  function handleClick(event: MouseEvent) {
    if (event.shiftKey && event.altKey) {
      openSecret();
    }
  }
  return (
    <>
      <span onClick={handleClick}>Zakodium</span>
      {` Sàrl (Switzerland).`}
      {isSecretOpen && <SecretThrower />}
    </>
  );
}

const ThrowerDiv = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
`;

/**
 * This component is here for us so we can test the impact of thrown exceptions
 * in the deployed application.
 */
function SecretThrower() {
  const [shouldThrow, setShouldThrow] = useOnOff();
  const dispatch = useDispatch();

  if (shouldThrow) {
    throw new Error('Error thrown in React render');
  }

  return (
    <ThrowerDiv>
      <Button onClick={setShouldThrow}>Throw in React render</Button>
      <Button
        onClick={() =>
          dispatch({
            type: 'SECRET_THROW_ERROR',
            payload: { randomNumber: Math.random() },
          })
        }
      >
        Throw in main reducer
      </Button>
    </ThrowerDiv>
  );
}
