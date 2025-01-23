import styled from '@emotion/styled';
import { useCallback } from 'react';

const Container = styled.div`
  margin-top: 10px;
  padding: 5px;
  text-align: center;

  p {
    font-size: 14px;
  }

  button {
    flex: 2;
    padding: 5px;
    border: 1px solid gray;
    border-radius: 5px;
    height: 30px;
    margin: 0 auto;
    margin-top: 15px;
    display: block;
    width: 90px;
    color: white;
    background-color: gray;
  }

  button:focus {
    outline: none;
  }
`;

interface EditLinkConfirmationProps {
  description: string;
  onConfirm: () => void;
}

function EditLinkConfirmation({
  description,
  onConfirm,
}: EditLinkConfirmationProps) {
  const handleOnConfirm = useCallback(
    (e) => {
      e.preventDefault();
      e.stopPropagation();

      onConfirm();
    },
    [onConfirm],
  );

  return (
    <Container>
      <p>{description}</p>
      <button type="button" onClick={handleOnConfirm}>
        Confirm
      </button>
    </Container>
  );
}

export default EditLinkConfirmation;
