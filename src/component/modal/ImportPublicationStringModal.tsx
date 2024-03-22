import { Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { FifoLogger, LogEntry } from 'fifo-logger';
import { Formik } from 'formik';
import debounce from 'lodash/debounce';
import { resurrect } from 'nmr-processing';
import { useMemo, useRef, useState } from 'react';
import * as yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import { useToaster } from '../context/ToasterContext';
import Button from '../elements/Button';
import { GroupPane } from '../elements/GroupPane';
import ReactTable, { Column } from '../elements/ReactTable/ReactTable';
import FormikTextarea from '../elements/formik/FormikTextarea';

const validationSchema = yup.object({
  publicationText: yup.string().required(),
});

interface InnerImportPublicationStringModalProps {
  onClose: () => void;
}

interface ImportPublicationStringModalProps
  extends InnerImportPublicationStringModalProps {
  isOpen: boolean;
}

function handleRowStyle(data) {
  const level = (data?.original as LogEntry).level;
  let backgroundColor = 'lightgreen';
  if (level > 40) {
    backgroundColor = 'pink';
  } else if (level === 40) {
    backgroundColor = 'lightyellow';
  }

  return { base: { backgroundColor } };
}

const INITIAL_VALUES = {
  publicationText:
    '1H NMR (CDCl3, 400MHz) δ 10.58 (b, 1H), 7.40 (d, 1H, J = 8.0 Hz), 6.19 (d, 1H, J = 7.6 Hz), 4.88 (s, 1H), 2.17 (s, 3H), 1.02 (s, 9H), 1.01 (s, 9H), 0.89 (s, 9H)',
};

export function ImportPublicationStringModal(
  props: ImportPublicationStringModalProps,
) {
  const { onClose, isOpen } = props;
  if (!isOpen) return;

  return <InnerImportPublicationStringModal onClose={onClose} />;
}

function InnerImportPublicationStringModal(
  props: InnerImportPublicationStringModalProps,
) {
  const { onClose } = props;

  const formRef = useRef<any>();
  const dispatch = useDispatch();
  const toaster = useToaster();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const loggerRef = useRef<FifoLogger>(
    new FifoLogger({
      onChange: (log, logs) => {
        setLogs(logs.slice());
      },
    }),
  );

  const COLUMNS: Array<Column<LogEntry>> = useMemo(
    () => [
      {
        Header: '#',
        accessor: (_, index) => index + 1,
        style: { width: '40px' },
      },
      {
        Header: 'Label',
        accessor: 'levelLabel',
        style: { width: '60px' },
      },
      {
        Header: 'Message',
        accessor: 'message',
      },
    ],
    [],
  );

  const debounceChanges = useMemo(
    () =>
      debounce((value) => {
        resurrect(value, { logger: loggerRef.current });
      }, 250),
    [],
  );

  function publicationStringHandler({ publicationText }) {
    void (async () => {
      const hideLoading = toaster.showLoading({
        message: 'Generate spectrum from publication string in progress',
      });
      const {
        ranges,
        info: { nucleus, solvent = '', frequency },
        parts,
      } = resurrect(publicationText, { logger: loggerRef.current });
      setTimeout(() => {
        dispatch({
          type: 'GENERATE_SPECTRUM_FROM_PUBLICATION_STRING',
          payload: {
            ranges,
            info: { nucleus, solvent, frequency, name: parts[0] },
          },
        });
        hideLoading();
      });
      onClose();
    })();
  }

  function handleOnChange(event) {
    loggerRef.current.clear();
    const value = event.target.value;
    if (value) {
      debounceChanges(value);
    }
  }

  const isNotValid = logs.some((log) =>
    ['error', 'fatal'].includes(log.levelLabel),
  );

  return (
    <Dialog
      title="Generate spectrum from publication string"
      isOpen
      onClose={onClose}
      style={{ width: 800, height: 500 }}
    >
      <Formik
        innerRef={formRef}
        initialValues={INITIAL_VALUES}
        validationSchema={validationSchema}
        onSubmit={publicationStringHandler}
      >
        {({ isValid }) => (
          <>
            <DialogBody>
              <div
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  height: '100%',
                }}
              >
                <div
                  style={{ display: 'flex', flexDirection: 'column', flex: 1 }}
                >
                  <p>
                    Paste a publication string in the text area below and click
                    on the button <i>Generate spectrum</i>
                  </p>
                  <FormikTextarea
                    style={{
                      width: '100%',
                      flex: 1,
                      outline: 'none',
                      borderWidth: '1px',
                      borderColor: '#dedede',
                      borderRadius: '5px',
                      resize: 'none',
                      padding: '15px',
                    }}
                    name="publicationText"
                    className="text-area"
                    placeholder="Enter publication string"
                    onChange={handleOnChange}
                  />
                </div>
                <GroupPane text="Logs">
                  <ReactTable
                    columns={COLUMNS}
                    data={logs}
                    emptyDataRowText="No Logs"
                    rowStyle={handleRowStyle}
                    style={{ height: '120px' }}
                  />
                </GroupPane>
              </div>
            </DialogBody>
            <DialogFooter>
              <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                <Button.Done
                  onClick={() => formRef.current.submitForm()}
                  disabled={isNotValid || !isValid}
                >
                  Generate spectrum
                </Button.Done>
              </div>
            </DialogFooter>
          </>
        )}
      </Formik>
    </Dialog>
  );
}
