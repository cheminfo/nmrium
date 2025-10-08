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
    background-color: gray;
    border: 1px solid gray;
    border-radius: 5px;
    color: white;
    display: block;
    flex: 2;
    height: 30px;
    margin: 0 auto;
    margin-top: 15px;
    padding: 5px;
    width: 90px;
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
    (e: any) => {
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
