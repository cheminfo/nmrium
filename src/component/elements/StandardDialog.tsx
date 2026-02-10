import type { DialogProps } from '@blueprintjs/core';
import { Dialog } from '@blueprintjs/core';

export function StandardDialog(options: DialogProps) {
  const { children, ...otherProps } = options;
  return (
    <Dialog canOutsideClickClose={false} {...otherProps}>
      {children}
    </Dialog>
  );
}
