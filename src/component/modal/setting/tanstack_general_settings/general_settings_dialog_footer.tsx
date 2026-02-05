import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ReactNode } from 'react';

const Footer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

interface GeneralSettingsDialogFooterProps {
  submitButton: () => ReactNode;
}

export function GeneralSettingsDialogFooter(
  props: GeneralSettingsDialogFooterProps,
) {
  const { submitButton } = props;

  return (
    <DialogFooter>
      <Footer>{submitButton()}</Footer>
    </DialogFooter>
  );
}
