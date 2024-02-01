import { FifoLogger, LogEntry } from 'fifo-logger';
import { Formik } from 'formik';
import debounce from 'lodash/debounce';
import { resurrect } from 'nmr-processing';
import { useMemo, useRef, useState } from 'react';
import { Modal } from 'react-science/ui';
import * as yup from 'yup';

import { useDispatch } from '../context/DispatchContext';
import Button from '../elements/Button';
import { GroupPane } from '../elements/GroupPane';
import ReactTable, { Column } from '../elements/ReactTable/ReactTable';
import FormikTextarea from '../elements/formik/FormikTextarea';
import { useAlert } from '../elements/popup/Alert';

const validationSchema = yup.object({
  publicationText: yup.string().required(),
});

interface ImportPublicationStringModalProps {
  onClose: () => void;
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

function ImportPublicationStringModal(
  props: ImportPublicationStringModalProps,
) {
  const { onClose, isOpen } = props;

  const formRef = useRef<any>();
  const dispatch = useDispatch();
  const alert = useAlert();
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

  if (!isOpen) return;

  function publicationStringHandler({ publicationText }) {
    void (async () => {
      const hideLoading = await alert.showLoading(
        'Generate spectrum from publication string in progress',
      );
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
    <Modal hasCloseButton isOpen onRequestClose={onClose}>
      <Formik
        innerRef={formRef}
        initialValues={INITIAL_VALUES}
        validationSchema={validationSchema}
        onSubmit={publicationStringHandler}
      >
        {({ isValid }) => (
          <>
            {' '}
            <Modal.Header>
              Generate spectrum from publication string
            </Modal.Header>
            <Modal.Body>
              <div style={{ width: 800, height: 400, padding: '10px' }}>
                Paste a publication string in the text area below and click on
                the button <i>Generate spectrum</i>
                <FormikTextarea
                  style={{
                    width: '100%',
                    height: '200px',
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
                <GroupPane
                  text="Logs"
                  style={{ container: { height: '130px' } }}
                >
                  <ReactTable
                    columns={COLUMNS}
                    data={logs}
                    emptyDataRowText="No Logs"
                    rowStyle={handleRowStyle}
                  />
                </GroupPane>
              </div>
            </Modal.Body>
            <Modal.Footer>
              <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
                <Button.Done
                  onClick={() => formRef.current.submitForm()}
                  disabled={isNotValid || !isValid}
                >
                  Generate spectrum
                </Button.Done>
              </div>
            </Modal.Footer>
          </>
        )}
      </Formik>
    </Modal>
  );
}

export default ImportPublicationStringModal;
