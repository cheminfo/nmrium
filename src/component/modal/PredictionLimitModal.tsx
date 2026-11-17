import { AnchorButton, DialogBody, DialogFooter } from '@blueprintjs/core';
import { isPredictionRateLimitError } from 'nmr-processing';
import { useCallback } from 'react';
import { Button, useOnOff } from 'react-science/ui';

import { useToaster } from '../context/ToasterContext.js';
import { StandardDialog } from '../elements/StandardDialog.tsx';

const LICENSE_URL = 'https://www.nmrium.com/pricing/academic';

/**
 * Report a failed prediction: a dialog inviting to get a license when the
 * free quota of the prediction service is exhausted, a toast otherwise.
 * @returns the error handler and the dialog element to render.
 */
export function usePredictionErrorHandler() {
  const toaster = useToaster();
  const [isOpen, open, close] = useOnOff(false);

  const handlePredictionError = useCallback(
    (error: unknown) => {
      if (isPredictionRateLimitError(error)) {
        open();
        return;
      }
      toaster.show({ message: (error as Error)?.message, intent: 'danger' });
    },
    [open, toaster],
  );

  const predictionLimitModal = (
    <PredictionLimitModal isOpen={isOpen} onClose={close} />
  );

  return { handlePredictionError, predictionLimitModal };
}

interface PredictionLimitModalProps {
  isOpen: boolean;
  onClose: () => void;
}

function PredictionLimitModal(props: PredictionLimitModalProps) {
  const { isOpen, onClose } = props;
  return (
    <StandardDialog
      isOpen={isOpen}
      onClose={onClose}
      canOutsideClickClose
      title="Free prediction limit reached"
      style={{ width: 500 }}
    >
      <DialogBody>
        <p>
          Spectra are predicted by a web service that we offer for free, with a
          limited number of predictions per day from each network. This limit
          has been reached, so no new prediction is possible for now.
        </p>
        <p>
          With an{' '}
          <a href={LICENSE_URL} target="_blank" rel="noreferrer">
            NMRium license
          </a>
          , your organization predicts spectra without this limit, and you
          support the development of NMRium.
        </p>
      </DialogBody>
      <DialogFooter
        actions={
          <>
            <Button variant="outlined" onClick={onClose}>
              Close
            </Button>
            <AnchorButton
              intent="primary"
              href={LICENSE_URL}
              target="_blank"
              rel="noreferrer"
              onClick={onClose}
            >
              Get a license
            </AnchorButton>
          </>
        }
      />
    </StandardDialog>
  );
}
