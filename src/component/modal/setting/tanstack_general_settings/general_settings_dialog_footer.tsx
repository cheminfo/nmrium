import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Button, withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from './validation.ts';

const Footer = styled.div`
  display: flex;
  justify-content: flex-start;
`;

export const GeneralSettingsDialogFooter = withForm({
  props: {
    onCancel: () => {
      /* empty */
    },
  },
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form, onCancel }) => {
    return (
      <form.AppForm>
        <DialogFooter>
          <Footer>
            <Button variant="outlined" intent="danger" onClick={onCancel}>
              Cancel
            </Button>
            <form.SubmitButton>Save</form.SubmitButton>
          </Footer>
        </DialogFooter>
      </form.AppForm>
    );
  },
});
