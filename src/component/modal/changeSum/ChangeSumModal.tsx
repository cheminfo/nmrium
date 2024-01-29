import { Dialog } from '@blueprintjs/core';
import { ReactNode } from 'react';
import { useOnOff } from 'react-science/ui';

import {
  ChangeSumModalContents,
  ChangeSumModalContentsProps,
} from './ChangeSumModalContents';

export interface ChangeSumModalProps
  extends Omit<ChangeSumModalContentsProps, 'onClose'> {
  renderButton: (onClick: () => void) => ReactNode;
  currentSum: number | null;
  sumType: string;
}

export default function ChangeSumModal(props: ChangeSumModalProps) {
  const { renderButton, currentSum, sumType, ...otherProps } = props;
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);

  return (
    <>
      {renderButton(openDialog)}

      <Dialog
        isOpen={isOpenDialog}
        onClose={closeDialog}
        style={{ width: 500, height: 400 }}
        title={
          currentSum
            ? `Set new ${sumType} sum (Current: ${currentSum.toFixed(2)})`
            : `Set new ${sumType} Sum`
        }
      >
        <ChangeSumModalContents {...otherProps} onClose={closeDialog} />
      </Dialog>
    </>
  );
}
