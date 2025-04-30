import { useEffect, useRef } from 'react';
import type { DeepPartial, FieldValues, UseFormReturn } from 'react-hook-form';
import { useWatch } from 'react-hook-form';

interface UseWatchFormProps<F extends FieldValues = FieldValues>
  extends Pick<UseFormReturn<F>, 'control'>,
    Partial<Pick<UseFormReturn<F>, 'reset'>> {
  initialValues?: F;
  onChange?: (values: DeepPartial<F>) => void;
}

export function useWatchForm<F extends FieldValues = FieldValues>(
  options: UseWatchFormProps<F>,
) {
  const { control, reset, initialValues, onChange } = options;
  const isMountedRef = useRef(false);
  const onChangeRef = useRef(onChange);
  const watchedValues = useWatch({ control });

  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  useEffect(() => {
    if (initialValues !== undefined) {
      isMountedRef.current = false;
      reset?.(initialValues);
    }
  }, [initialValues, reset]);

  useEffect(() => {
    if (isMountedRef.current) {
      onChangeRef.current?.(watchedValues);
    }
    isMountedRef.current = true;
  }, [watchedValues]);
}
