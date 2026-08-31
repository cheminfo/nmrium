import { DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { revalidateLogic } from '@tanstack/react-form';
import type { ChangeEvent, LogEntry } from 'fifo-logger';
import { FifoLogger } from 'fifo-logger';
import debounce from 'lodash/debounce.js';
import { resurrect } from 'nmr-processing';
import { useEffect, useMemo, useRef } from 'react';
import { AppForm, createTableColumnHelper, useForm } from 'react-science/ui';
import { z } from 'zod';

import { useDispatch } from '../context/DispatchContext.js';
import { useToaster } from '../context/ToasterContext.js';
import { StandardDialog } from '../elements/StandardDialog.tsx';
import { StyledDialogBody } from '../elements/StyledDialogBody.js';

import { TableSettings } from './setting/tanstack_general_settings/ui/table.tsx';
import { TableSection } from './setting/tanstack_general_settings/ui/table_section.tsx';

interface InnerImportPublicationStringModalProps {
  onClose: () => void;
}

interface ImportPublicationStringModalProps extends InnerImportPublicationStringModalProps {
  isOpen: boolean;
}

const Dialog = styled(StandardDialog)`
  width: 800px;
`;

const Tr = styled.tr<{ level: number }>`
  background-color: ${({ level }) => (level > 40 ? 'pink' : level === 40 ? 'lightyellow' : 'lightgreen')};

  &:hover {
    background-color: #ff6f0091 !important;
  }
`;

const TableWrapper = styled.div`
  max-height: 120px;
  overflow-y: auto;
`;

const logSchema = z.custom<LogEntry>();

const formSchema = z.object({
  publicationText: z.string().trim().min(1),
  logs: z.array(logSchema),
});

const INITIAL_VALUES: z.input<typeof formSchema> = {
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
      onDynamic: formSchema,
    },
    onSubmit: ({ value }) => {
      const { publicationText } = formSchema.parse(value);

      const hideLoading = toaster.showLoading({
        message: 'Generate spectrum from publication string in progress',
      });

      const {
        ranges,
        info: { nucleus, solvent = '', frequency },
        parts,
      } = resurrect(publicationText, { logger: loggerRef.current });

      dispatch({
        type: 'GENERATE_SPECTRUM_FROM_PUBLICATION_STRING',
        payload: {
          ranges,
          info: { nucleus, solvent, frequency, name: parts[0] },
        },
      });

      hideLoading();
      onClose();
    },
  });

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
      debounce((value: string) => {
        resurrect(value, { logger: loggerRef.current });
      }, 250),
    [],
  );

  const columns = useMemo(() => {
    const helper = createTableColumnHelper();

    return [
      helper.accessor('id', {
        header: '#',
        meta: {
          thStyle: {
            width: '40px',
          },
        },
      }),
      helper.accessor('levelLabel', {
        header: 'Label',
        meta: {
          tdStyle: {
            width: '60px',
          },
        },
      }),
      helper.accessor('message', {
        header: 'Message',
      }),
    ];
  }, []);

  return (
    <Dialog
      title="Generate spectrum from publication string"
      isOpen
      onClose={onClose}
    >
      <AppForm form={form}>
        <StyledDialogBody>
          <p>
            Paste a publication string in the text area below and click on the
            button <i>Generate spectrum</i>
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

          <form.AppField name="logs">
            {(field) => (
              <TableSection title="Logs">
                <TableWrapper>
                  <TableSettings
                    data={field.state.value}
                    columns={columns}
                    getRowId={(data) => {
                      return getRowId(data as LogEntry);
                    }}
                    emptyContent="No Logs"
                    tdStyle={{
                      padding: '0.15rem 0.4rem',
                    }}
                    renderRowTr={(data) => {
                      const level = field.state.value.find((value) => {
                        return String(value.id) === data['data-row-id'];
                      })?.level as number | undefined;

                      if (!level) {
                        return null;
                      }

                      return <Tr level={level} {...data} />;
                    }}
                  />
                </TableWrapper>
              </TableSection>
            )}
          </form.AppField>
        </StyledDialogBody>
        <DialogFooter
          actions={
            <form.Subscribe
              selector={(store) => {
                const { logs } = store.values;

                const isNotValid = logs.some((log) =>
                  ['error', 'fatal'].includes(log.levelLabel),
                );

                return isNotValid || !store.isValid;
              }}
            >
              {(disabled) => (
                <form.SubmitButton intent="success" disabled={disabled}>
                  Generate spectrum
                </form.SubmitButton>
              )}
            </form.Subscribe>
          }
        />
      </AppForm>
    </Dialog>
  );
}

function getRowId(row: LogEntry) {
  return String(row.id);
}
