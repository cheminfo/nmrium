import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Button, withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from './validation.js';

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
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
            <form.SubmitButton intent="success" data-action="save">
              Apply and Save
            </form.SubmitButton>
            <form.SubmitButton intent="primary" data-action="apply">
              Apply
            </form.SubmitButton>
          </Footer>
        </DialogFooter>
      </form.AppForm>
    );
  },
});
