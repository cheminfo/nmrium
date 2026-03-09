import { DialogFooter } from '@blueprintjs/core';
import { Button, withForm } from 'react-science/ui';

import { defaultGeneralSettingsFormValues } from './validation.js';

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
        <DialogFooter
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
        />
      </form.AppForm>
    );
  },
});
