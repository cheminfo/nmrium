import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Button, withForm } from 'react-science/ui';

import { GeneralSettingsErrorRenderer } from './errors/renderer.tsx';
import {
  defaultGeneralSettingsFormValues,
  workspaceValidation,
} from './validation.js';

export const GeneralSettingsDialogFooter = withForm({
  props: {
    onCancel: () => {
      /* empty */
    },
  },
  validators: { onDynamic: workspaceValidation },
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form, onCancel }) => {
    return (
      <form.AppForm>
        <DialogFooterStyled
          actions={
            <>
              <Button variant="outlined" intent="danger" onClick={onCancel}>
                Cancel
              </Button>
              <form.SubmitButton intent="success" data-action="save">
                Apply and Save
              </form.SubmitButton>
              <form.SubmitButton intent="primary" data-action="apply">
                Apply
              </form.SubmitButton>
            </>
          }
        >
          <GeneralSettingsErrorRenderer form={form} />
        </DialogFooterStyled>
      </form.AppForm>
    );
  },
});

const DialogFooterStyled = styled(DialogFooter)`
  flex-direction: column;
  align-items: stretch;
  gap: 0.5rem;
`;
