import { ComponentType, forwardRef, Ref } from 'react';

export function forwardRefWithAs<PropsType, RefType extends Ref<any> = any>(
  component: ComponentType<PropsType>,
): ComponentType<PropsType & { ref?: RefType }> {
  // eslint-disable-next-line no-restricted-syntax
  return forwardRef(component as unknown as any) as any;
}
