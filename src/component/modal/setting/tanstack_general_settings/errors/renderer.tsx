import { Callout, Collapse } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { useStore } from '@tanstack/react-form';
import { Button, withForm } from 'react-science/ui';

import {
  defaultGeneralSettingsFormValues,
  workspaceValidation,
} from '../validation.ts';

import { useErrorsDispatch, useErrorsIsOpen } from './context.tsx';

export const GeneralSettingsErrorRenderer = withForm({
  defaultValues: defaultGeneralSettingsFormValues,
  validators: { onDynamic: workspaceValidation },
  render: function GeneralSettingsErrorRenderer({ form }) {
    const isOpen = useErrorsIsOpen();
    const dispatch = useErrorsDispatch();
    const errors = useStore(form.store, (state) => {
      return Object.values(state.errorMap.onDynamic ?? {}).flat();
    });

    return (
      <Collapse isOpen={isOpen} keepChildrenMounted>
        <Callout title="Errors in the form" intent="danger">
          <CloseButton
            icon="cross"
            variant="minimal"
            onClick={() => dispatch(false)}
          />

          <ul>
            {errors.map((error, index) => {
              const path = error.path
                ?.map((path) =>
                  typeof path === 'object' ? path.key : String(path),
                )
                .join('.');

              return (
                <li key={`${path}-${index}`}>
                  {path}: {error.message}
                </li>
              );
            })}
          </ul>
        </Callout>
      </Collapse>
    );
  },
});

const CloseButton = styled(Button)`
  position: absolute;
  right: 0;
  top: 0;
`;
