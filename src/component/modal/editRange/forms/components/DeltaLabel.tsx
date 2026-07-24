import { Tag } from '@blueprintjs/core';
import { useFormContext } from 'react-hook-form';

interface DeltaLabelProps {
  index: number;
}

function hasError(errors: any, i: any) {
  return !!errors?.signals?.[i];
}

export function DeltaLabel({ index }: DeltaLabelProps) {
  const {
    formState: { errors },
  } = useFormContext();
  const isNotValid = hasError(errors, index);

  return <Tag intent={isNotValid ? 'danger' : 'none'}>{index + 1}</Tag>;
}
