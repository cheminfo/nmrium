import { Dialog } from '@blueprintjs/core';
import { SvgNmrSum } from 'cheminfo-font';
import { Toolbar, useOnOff } from 'react-science/ui';

import type { ChangeSumModalContentsProps } from './ChangeSumModalContents.js';
import { ChangeSumModalContents } from './ChangeSumModalContents.js';

export interface ChangeSumModalProps
  extends Omit<ChangeSumModalContentsProps, 'onClose'> {
  currentSum: number | null;
  sumType: string;
  disabled?: boolean;
}

export default function ChangeSumModal(props: ChangeSumModalProps) {
  const { disabled = false, currentSum, sumType, ...otherProps } = props;
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);

  return (
    <>
      <Toolbar.Item
        disabled={disabled}
        icon={<SvgNmrSum />}
        tooltip={
          currentSum
            ? `Change ${sumType} sum (${currentSum.toFixed(2)})`
            : `Change ${sumType} sum`
        }
        onClick={openDialog}
      />

      {isOpenDialog && (
        <Dialog
          isOpen
          onClose={closeDialog}
          style={{ width: 500 }}
          title={
            currentSum
              ? `Set new ${sumType} sum (Current: ${currentSum.toFixed(2)})`
              : `Set new ${sumType} Sum`
          }
        >
          <ChangeSumModalContents {...otherProps} onClose={closeDialog} />
        </Dialog>
      )}
    </>
  );
}
