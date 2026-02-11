import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { Button, withForm } from 'react-science/ui';

import type { GeneralSettingsFormType } from './general_settings.tsx';
import { defaultGeneralSettingsFormValues } from './validation.ts';

const Footer = styled.div`
  display: flex;
  justify-content: flex-end;
  gap: 10px;
`;

export const GeneralSettingsDialogFooter = withForm({
  props: {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    onApply: (values: GeneralSettingsFormType) => {
      /* empty */
    },
    onCancel: () => {
      /* empty */
    },
  },
  defaultValues: defaultGeneralSettingsFormValues,
  render: ({ form, onCancel, onApply }) => {
    return (
      <form.AppForm>
        <DialogFooter>
          <Footer>
            <Button variant="outlined" intent="danger" onClick={onCancel}>
              Cancel
            </Button>
            <form.SubmitButton intent="success">
              Apply and Save
            </form.SubmitButton>
            <form.Subscribe selector={(state) => state.values}>
              {(values) => (
                <Button intent="primary" onClick={() => onApply(values)}>
                  Apply
                </Button>
              )}
            </form.Subscribe>
          </Footer>
        </DialogFooter>
      </form.AppForm>
    );
  },
});
