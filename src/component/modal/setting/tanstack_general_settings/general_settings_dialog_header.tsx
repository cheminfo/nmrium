import { Classes } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import { Button, withForm } from 'react-science/ui';

import { useErrors } from './errors/context.tsx';
import { defaultGeneralSettingsFormValues } from './validation.ts';
import { WorkspaceActions } from './workspaces/actions.tsx';
import { WorkspacePicker } from './workspaces/picker.tsx';

export const GeneralSettingsDialogHeader = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  render: function GeneralSettingsDialogHeader({ form }) {
    const { reset, store } = form;
    const formValues = useStore(store, (state) => state.values);

    return (
      <DialogHeader className={Classes.DIALOG_HEADER}>
        <WorkspacePicker formValues={formValues} reset={reset} />
        <WorkspaceActions formValues={formValues} reset={reset} />

        <FlexSeparator />

        <ErrorsIndicator />
      </DialogHeader>
    );
  },
});

function ErrorsIndicator() {
  const { setIsOpen, count } = useErrors();

  if (count === 0) return null;

  return (
    <ErrorButton
      variant="outlined"
      intent="danger"
      size="small"
      tooltipProps={{
        content: `There is ${count} errors in the form. Click to show them.`,
      }}
      onClick={() => setIsOpen(true)}
    >
      {count}
    </ErrorButton>
  );
}

const DialogHeader = styled.div`
  cursor: default;
  box-shadow: none;
  background-color: #f8f8f8;
  gap: 0.25rem;
`;

const FlexSeparator = styled.div`
  flex: 1;
`;

const ErrorButton = styled(Button)`
  border-radius: 100%;
  font-size: 0.75em;
`;
