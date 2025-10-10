import { Button, Dialog, DialogFooter } from '@blueprintjs/core';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import * as Yup from 'yup';

import { useCore } from '../context/CoreContext.js';
import { useDispatch } from '../context/DispatchContext.js';
import { useToaster } from '../context/ToasterContext.js';
import { Input2Controller } from '../elements/Input2Controller.js';
import type { LabelStyle } from '../elements/Label.js';
import Label from '../elements/Label.js';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';

const allowedExtensions = new Set(['dx', 'jdx', 'jcamp']);

const loadFormValidation = Yup.object({
  url: Yup.string()
    .url()
    .required()
    .test(
      'file type',
      'Imported file must be one of those extensions [ .jdx, .dx, .jcamp ]',
      (url) => {
        try {
          const fileURL = new URL(url);
          const extension = fileURL.pathname.split('.')?.[1] || '';
          if (allowedExtensions.has(extension)) {
            return true;
          }
        } catch {
          return false;
        }
        return false;
      },
    ),
});

const labelStyle: LabelStyle = {
  wrapper: { display: 'flex', height: '100%', flex: 1 },
  container: { alignItems: 'flex-start' },
  label: { paddingTop: '5px' },
};

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
  const { handleSubmit, control } = useForm({
    defaultValues: { url: '' },
    resolver: yupResolver(loadFormValidation),
  });

  const core = useCore();
  async function loadJCAMPHandler({ url }: { url: string }) {
    const hidLoading = toaster.showLoading({
      message: 'Load JCAMP from external URL in progress ...',
    });
    const { pathname, origin } = new URL(url);
    try {
      const nmriumState = await core.readFromWebSource({
        entries: [{ relativePath: pathname, baseURL: origin }],
      });

      dispatch({
        type: 'LOAD_DROP_FILES',
        payload: { nmriumState, resetSourceObject: false },
      });
    } catch {
      toaster.show({ message: `Failed to load ${url}`, intent: 'danger' });
    } finally {
      hidLoading();
      onCloseDialog?.();
    }
  }

  return (
    <Dialog
      isOpen
      onClose={onCloseDialog}
      title="Load JCAMP"
      style={{ minWidth: 400 }}
    >
      <StyledDialogBody>
        <Label title="URL" style={labelStyle}>
          <Input2Controller
            name="url"
            control={control}
            fill
            placeholder="Enter URL to JCAMP-DX file"
            enableErrorMessage
          />
        </Label>
      </StyledDialogBody>
      <DialogFooter>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button
            intent="success"
            onClick={() => void handleSubmit(loadJCAMPHandler)()}
          >
            Load
          </Button>
        </div>
      </DialogFooter>
    </Dialog>
  );
}
