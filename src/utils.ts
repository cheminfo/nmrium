import { forwardRef } from 'react';

export function forwardRefWithAs<T>(component: T): T {
  return forwardRef(component as unknown as any) as any;
}
