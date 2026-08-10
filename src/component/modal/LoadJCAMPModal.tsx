import { DialogFooter } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import { AppForm, useForm } from 'react-science/ui';
import { z } from 'zod';

import { useCore } from '../context/CoreContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useToaster } from '../context/ToasterContext.js';
import { StandardDialog } from '../elements/StandardDialog.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';

const allowedExtensions = new Set(['dx', 'jdx', 'jcamp']);
const loadFormValidationZod = z.object({
  url: z.string().refine(
    (url) => {
      try {
        const fileURL = new URL(url);
        const extension = fileURL.pathname.split('.', 2)[1] || '';

        if (allowedExtensions.has(extension)) {
          return true;
        }
      } catch {
        return false;
      }
      return false;
    },
    {
      error:
        'Imported file must be one of those extensions [ .jdx, .dx, .jcamp ]',
    },
  ),
});

interface InnerLoadJCAMPModalProps {
  onCloseDialog: () => void;
}

interface LoadJCAMPModalProps extends InnerLoadJCAMPModalProps {
  isOpen: boolean;
}

export function LoadJCAMPModal({ onCloseDialog, isOpen }: LoadJCAMPModalProps) {
  if (!isOpen) return;
  return <InnerLoadJCAMPModal onCloseDialog={onCloseDialog} />;
}

function InnerLoadJCAMPModal({ onCloseDialog }: InnerLoadJCAMPModalProps) {
  const dispatch = useDispatch();
  const toaster = useToaster();

  const core = useCore();
  async function loadJCAMPHandler({
    url,
  }: z.output<typeof loadFormValidationZod>) {
    const hidLoading = toaster.showLoading({
      message: 'Load JCAMP from external URL in progress ...',
    });

    const { pathname, origin } = new URL(url);

    try {
      const { state, aggregator, containsNmrium } =
        await core.readFromWebSource({
          entries: [{ relativePath: pathname, baseURL: origin }],
        });

      dispatch({
        type: 'LOAD_DROP_FILES',
        payload: {
          nmriumState: state,
          containsNmrium,
          aggregator,
          resetSourceObject: false,
        },
      });
    } catch {
      toaster.show({ message: `Failed to load ${url}`, intent: 'danger' });
    } finally {
      hidLoading();
      onCloseDialog?.();
    }
  }

  const form = useForm({
    validators: {
      onDynamic: loadFormValidationZod,
    },
    validationLogic: revalidateLogic({ mode: 'change' }),
    defaultValues: {
      url: '',
    },
    onSubmit: async ({ value }) => {
      await loadJCAMPHandler(value);
    },
  });

  return (
    <StandardDialog
      isOpen
      onClose={onCloseDialog}
      title="Load JCAMP"
      style={{ minWidth: 400 }}
    >
      <AppForm form={form} layout="inline">
        <StyledDialogBody>
          <form.AppField name="url">
            {(field) => (
              <field.Input
                label="URL"
                placeholder="Enter URL"
                helpText="URL should be a JCAMP-DX file"
              />
            )}
          </form.AppField>
        </StyledDialogBody>
        <DialogFooter
          actions={<form.SubmitButton intent="success">Load</form.SubmitButton>}
        />
      </AppForm>
    </StandardDialog>
  );
}
