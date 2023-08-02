import { ReactNode } from 'react';
import { Modal, useOnOff } from 'react-science/ui';

import {
  ChangeSumModalContents,
  ChangeSumModalContentsProps,
} from './ChangeSumModalContents';

export interface ChangeSumModalProps
  extends Omit<ChangeSumModalContentsProps, 'onClose'> {
  renderButton: (onClick: () => void) => ReactNode;
}

export default function ChangeSumModal({
  renderButton,
  ...otherProps
}: ChangeSumModalProps) {
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);
  return (
    <>
      {renderButton(openDialog)}

      <Modal
        isOpen={isOpenDialog}
        onRequestClose={closeDialog}
        width={500}
        height={400}
      >
        <ChangeSumModalContents {...otherProps} onClose={closeDialog} />
      </Modal>
    </>
  );
}
