// https://fettblog.eu/typescript-react-generic-forward-refs/
import type { PropsWithoutRef, ReactElement, Ref, RefAttributes } from 'react';
import { forwardRef } from 'react';

export function forwardRefWithGeneric<T, P = unknown>(
  render: (props: P, ref: Ref<T>) => ReactElement | null,
): (props: PropsWithoutRef<P> & RefAttributes<T>) => ReactElement | null {
  // @ts-expect-error props are incompatible. refs: https://github.com/DefinitelyTyped/DefinitelyTyped/commit/f3052d979fdf41749d43a1f6abea993763f83e21
  return forwardRef(render) as ReturnType<typeof forwardRefWithGeneric<T, P>>;
}
