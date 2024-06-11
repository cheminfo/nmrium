import has from 'lodash/has';
import { useCallback } from 'react';
import { useFormContext } from 'react-hook-form';

export function useFormValidateField() {
  const {
    formState: { errors },
  } = useFormContext();

  return useCallback(
    (name: string) => {
      return !has(errors, name);
    },
    [errors],
  );
}
