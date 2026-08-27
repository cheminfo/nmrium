import { DialogFooter } from '@blueprintjs/core';
import { revalidateLogic } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';
import type { ChangeEvent, LogEntry } from 'fifo-logger';
import { FifoLogger } from 'fifo-logger';
import debounce from 'lodash/debounce.js';
import { resurrect } from 'nmr-processing';
import { useEffect, useMemo, useRef } from 'react';
import { AppForm, useForm } from 'react-science/ui';
import { z } from 'zod';

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

  return {
    base: {
      backgroundColor:
        level > 40 ? 'pink' : level === 40 ? 'lightyellow' : 'lightgreen',
    },
  };
}

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

const validation = z.object({
  publicationText: z.string(),
  logs: z.array(
    z.object({
      id: z.number(),
      time: z.number(),
      level: z.union([
        z.literal(0),
        z.literal(10),
        z.literal(20),
        z.literal(30),
        z.literal(40),
        z.literal(50),
        z.literal(60),
      ]),
      levelLabel: z.enum([
        'fatal',
        'error',
        'warn',
        'info',
        'debug',
        'trace',
        'silent',
      ]),
      uuids: z.array(z.string()),
      message: z.string(),
      meta: z.any().optional(),
      error: z
        .object({
          name: z.string(),
          message: z.string(),
          stack: z.string().optional(),
        })
        .optional(),
    }),
  ),
});

const INITIAL_VALUES: z.input<typeof validation> = {
  logs: [],
  publicationText:
    '1H NMR (CDCl3, 400MHz) δ 1 (s, 1H), 2 (d, 1H, J=7), 3 (t, 1H, J=7), 4 (q, 1H, J=7), 5 (quint, 1H, J=7), 6 (hex, 1H, J=7), 7 (hept, 1H, J=7), 8 (dd, 1H, J=7, J=4)',
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

  const dispatch = useDispatch();
  const toaster = useToaster();
  const loggerRef = useRef<FifoLogger>(new FifoLogger());

  const form = useForm({
    defaultValues: INITIAL_VALUES,
    validationLogic: revalidateLogic({ mode: 'change' }),
    validators: {
      onDynamic: validation,
    },
    onSubmit: ({ value }) => {
      const { publicationText } = validation.parse(value);

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
    },
  });

  const isValid = useSelector(form.store, (store) => store.isValid);

  useEffect(() => {
    function handleLogs({ detail: { logs } }: ChangeEvent) {
      form.setFieldValue('logs', logs.slice());
    }

    const loggerInstance = loggerRef.current;
    loggerInstance.addEventListener('change', handleLogs);

    return () => {
      loggerInstance.removeEventListener('change', handleLogs);
    };
  }, [form]);

  const debounceChanges = useMemo(
    () =>
      debounce((value: any) => {
        resurrect(value, { logger: loggerRef.current });
      }, 250),
    [],
  );

  const logs = useSelector(form.store, (store) => store.values.logs);
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
      <AppForm form={form}>
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
                Paste a publication string in the text area below and click on
                the button <i>Generate spectrum</i>
              </p>

              <form.AppField
                name="publicationText"
                listeners={{
                  onChange: ({ value }) => {
                    debounceChanges(value);
                  },
                }}
              >
                {(field) => (
                  <field.TextArea
                    label="Publication text"
                    placeholder="Enter publication string"
                    fill
                  />
                )}
              </form.AppField>
            </div>

            <form.AppField name="logs">
              {(field) => (
                <GroupPane text="Logs">
                  <ReactTable
                    columns={COLUMNS}
                    data={field.state.value}
                    emptyDataRowText="No Logs"
                    rowStyle={handleRowStyle}
                    style={{ height: '120px' }}
                  />
                </GroupPane>
              )}
            </form.AppField>
          </div>
        </StyledDialogBody>
        <DialogFooter
          actions={
            <form.SubmitButton
              intent="success"
              disabled={isNotValid || !isValid}
            >
              Generate spectrum
            </form.SubmitButton>
          }
        />
      </AppForm>
    </StandardDialog>
  );
}
