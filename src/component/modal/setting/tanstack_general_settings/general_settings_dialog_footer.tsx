import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import type { ComponentType, ReactNode } from 'react';

const Footer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

interface FormWithAppComponents {
  AppForm: ComponentType<{ children?: ReactNode }>;
  SubmitButton: ComponentType<{ children?: ReactNode }>;
}

interface GeneralSettingsDialogFooterProps<T extends FormWithAppComponents> {
  form: T;
}

export function GeneralSettingsDialogFooter<T extends FormWithAppComponents>(
  props: GeneralSettingsDialogFooterProps<T>,
) {
  const { form } = props;

  return (
    <DialogFooter>
      <form.AppForm>
        <Footer>
          <form.SubmitButton>Apply</form.SubmitButton>
        </Footer>
      </form.AppForm>
    </DialogFooter>
  );
}
