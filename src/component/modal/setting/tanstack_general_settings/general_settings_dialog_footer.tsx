import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from './validation.ts';

const Footer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const GeneralSettingsDialogFooter = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form }) => {
    return (
      <form.AppForm>
        <DialogFooter>
          <Footer>
            <form.SubmitButton>Save</form.SubmitButton>
          </Footer>
        </DialogFooter>
      </form.AppForm>
    );
  },
});
