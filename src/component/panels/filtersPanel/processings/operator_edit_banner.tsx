import { Classes, Switch } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { assertDefined } from '@zakodium/utils';
import type { ReactNode } from 'react';
import { Button } from 'react-science/ui';

import type { UseLiveEdit } from './use_live_edit.ts';

interface OperatorEditBannerProps {
  isLiveEditable: boolean;
  liveEdit: UseLiveEdit;
  onClose: () => void;
  children: ReactNode;
}

export function OperatorEditBanner(props: OperatorEditBannerProps) {
  const { isLiveEditable, liveEdit, children, onClose } = props;

  return (
    <LiveEditBanner>
      {isLiveEditable && (
        <>
          <Switch
            label="Live preview"
            innerLabelChecked="On"
            innerLabel="Off"
            checked={liveEdit.value?.checked ?? false}
            onChange={(event) => {
              assertDefined(liveEdit.value);

              liveEdit.setValue({
                ...liveEdit.value,
                checked: event.currentTarget.checked,
              });
            }}
          />
          <Switch
            label="Processed"
            innerLabelChecked="On"
            innerLabel="Off"
            checked={liveEdit.value?.shouldProcessNext}
            onChange={(event) => {
              assertDefined(liveEdit.value);

              liveEdit.setValue({
                ...liveEdit.value,
                shouldProcessNext: event.currentTarget.checked,
              });
            }}
          />
        </>
      )}
      <Spacer />
      {children}
      <Button variant="minimal" intent="danger" onClick={onClose} size="small">
        Cancel
      </Button>
    </LiveEditBanner>
  );
}

const LiveEditBanner = styled.div`
  background-color: white;
  box-shadow: rgb(0 0 0 / 16%) 0 1px 4px;
  margin-left: -10px;
  margin-right: -10px;
  transform: translateY(-10px);
  padding: 5px;
  display: flex;
  align-items: center;
  gap: 5px;

  .${Classes.CONTROL} {
    margin-bottom: 0;
  }
`;
const Spacer = styled.span`
  flex: 1;
`;
