import React from "react";

export type PropsOf<T = unknown> = T extends React.ElementType
  ? React.ComponentProps<T>
  : never;

export function forwardRefWithAs<T>(component: T): T {
  return React.forwardRef(component as unknown as any) as any;
}