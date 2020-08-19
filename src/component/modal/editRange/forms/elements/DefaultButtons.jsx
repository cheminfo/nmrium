import { jsx } from '@emotion/core';
/** @jsx jsx */
import { useFormikContext } from 'formik';
import { memo } from 'react';

import Button from './Button';

const SaveButton = memo(() => {
  const { handleSubmit, isSubmitting } = useFormikContext();

  return (
    <Button onClick={handleSubmit} disabled={isSubmitting}>
      Save
    </Button>
  );
});

const ResetButton = memo(() => {
  const { handleReset, isSubmitting } = useFormikContext();

  return (
    <Button onClick={handleReset} disabled={isSubmitting}>
      Reset
    </Button>
  );
});

const CloseButton = memo(({ onClose }) => {
  const { isSubmitting } = useFormikContext();

  return (
    <Button onClick={onClose} disabled={isSubmitting}>
      Close
    </Button>
  );
});

const CancelButton = memo(({ onCancel }) => {
  const { isSubmitting } = useFormikContext();

  return (
    <Button onClick={onCancel} disabled={isSubmitting}>
      Cancel
    </Button>
  );
});

export { SaveButton, ResetButton, CloseButton, CancelButton };
