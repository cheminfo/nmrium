import { Button, DialogFooter, TextArea } from '@blueprintjs/core';
import type { ChangeEvent, LogEntry } from 'fifo-logger';
import { FifoLogger } from 'fifo-logger';
import debounce from 'lodash/debounce.js';
import { resurrect } from 'nmr-processing';
import { useEffect, useMemo, useRef, useState } from 'react';
import { Controller, useForm } from 'react-hook-form';

import { useDispatch } from '../context/DispatchContext.js';
import { useToaster } from '../context/ToasterContext.js';
import { GroupPane } from '../elements/GroupPane.js';
import type { Column } from '../elements/ReactTable/ReactTable.js';
import ReactTable from '../elements/ReactTable/ReactTable.js';
import { StandardDialog } from '../elements/StandardDialog.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';

interface InnerImportPublicationStringModalProps {
  onClose: () => void;
}

interface ImportPublicationStringModalProps extends InnerImportPublicationStringModalProps {
  isOpen: boolean;
}

function handleRowStyle(data: any) {
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
    '1H NMR (CDCl3, 400MHz) δ 1 (s, 1H), 2 (d, 1H, J=7), 3 (t, 1H, J=7), 4 (q, 1H, J=7), 5 (quint, 1H, J=7), 6 (hex, 1H, J=7), 7 (hept, 1H, J=7), 8 (dd, 1H, J=7, J=4)',
};

const COLUMNS: Array<Column<LogEntry>> = [
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
];

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

  const dispatch = useDispatch();
  const toaster = useToaster();
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const loggerRef = useRef<FifoLogger>(new FifoLogger());
  const {
    handleSubmit,
    control,
    formState: { isValid },
  } = useForm({ defaultValues: INITIAL_VALUES, mode: 'onChange' });

  useEffect(() => {
    function handleLogs({ detail: { logs } }: ChangeEvent) {
      setLogs(logs.slice());
    }
    const loggerInstance = loggerRef.current;
    loggerInstance.addEventListener('change', handleLogs);

    return () => {
      loggerInstance.removeEventListener('change', handleLogs);
    };
  }, []);

  const debounceChanges = useMemo(
    () =>
      debounce((value: any) => {
        resurrect(value, { logger: loggerRef.current });
      }, 250),
    [],
  );

  function publicationStringHandler({
    publicationText,
  }: {
    publicationText: string;
  }) {
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

  function handleOnChange(value: any) {
    loggerRef.current.clear();

    if (!value) {
      return;
    }
    debounceChanges(value);
  }

  const isNotValid = logs.some((log) =>
    ['error', 'fatal'].includes(log.levelLabel),
  );

  return (
    <StandardDialog
      title="Generate spectrum from publication string"
      isOpen
      onClose={onClose}
      style={{ width: 800, height: 500 }}
    >
      <StyledDialogBody>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            height: '100%',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
            <p>
              Paste a publication string in the text area below and click on the
              button <i>Generate spectrum</i>
            </p>
            <Controller
              control={control}
              name="publicationText"
              rules={{ required: true }}
              render={({ field, fieldState: { invalid } }) => {
                const { onChange, ...otherFieldProps } = field;
                return (
                  <TextArea
                    {...otherFieldProps}
                    placeholder="Enter publication string"
                    onChange={(event) => {
                      onChange(event);
                      handleOnChange(event.target.value);
                    }}
                    intent={invalid ? 'danger' : 'none'}
                    style={{ flex: 1, width: '100%', resize: 'none' }}
                  />
                );
              }}
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
      </StyledDialogBody>
      <DialogFooter>
        <div style={{ display: 'flex', flexDirection: 'row-reverse' }}>
          <Button
            onClick={() => handleSubmit(publicationStringHandler)()}
            disabled={isNotValid || !isValid}
            intent="success"
          >
            Generate spectrum
          </Button>
        </div>
      </DialogFooter>
    </StandardDialog>
  );
}
