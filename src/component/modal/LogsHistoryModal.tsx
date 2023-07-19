import { LogEntry } from 'fifo-logger';
import { useMemo } from 'react';
import { FaRegTrashAlt } from 'react-icons/fa';
import { IoBugOutline } from 'react-icons/io5';
import { ObjectInspector } from 'react-inspector';
import { useOnOff, Modal } from 'react-science/ui';

import { useLogger } from '../context/LoggerContext';
import Button from '../elements/Button';
import { ColumnWrapper } from '../elements/ColumnWrapper';
import ReactTable, { Column } from '../elements/ReactTable/ReactTable';

const logsDataFormat = new Intl.DateTimeFormat('default', {
  hour: 'numeric',
  minute: 'numeric',
  second: 'numeric',
});

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

function getMaxLevelLogs(logs: LogEntry[], lastReadLogId: number) {
  const logsCounts: Record<string, number> = {};
  for (const log of logs) {
    if (log.id > lastReadLogId) {
      logsCounts[log.level] = ++logsCounts[log.level] || 1;
    }
  }

  let maxLevel = 0;

  for (const levelKey in logsCounts) {
    const level = Number(levelKey);

    if (level > maxLevel) {
      maxLevel = level;
    }
  }

  let backgroundColor = '#2dd36f';

  if (maxLevel > 40) {
    backgroundColor = '#ff0000';
  } else if (maxLevel === 40) {
    backgroundColor = '#ffc409';
  }

  return { backgroundColor, count: logsCounts[maxLevel] };
}

interface LogsHistoryModalProps {
  autoOpen?: boolean;
  onClose?: () => void;
}

export function LogsHistoryModal(props: LogsHistoryModalProps) {
  const { autoOpen = false, onClose } = props;
  const { logsHistory, logger, markAsRead, lastReadLogId } = useLogger();
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(autoOpen);

  const { count, backgroundColor } = getMaxLevelLogs(
    logsHistory,
    lastReadLogId,
  );

  const COLUMNS: Array<Column<LogEntry>> = useMemo(
    () => [
      {
        Header: '#',
        accessor: (_, index) => index + 1,
        Cell: ({ row }) => (
          <span>
            {row.original.id > lastReadLogId && (
              <div
                style={{
                  width: '5px',
                  height: '5px',
                  borderRadius: '50%',
                  backgroundColor: '#ffc409',
                  display: 'inline-block',
                  margin: '0 3px',
                }}
              />
            )}
            {row.index + 1}
          </span>
        ),
        style: { width: '40px' },
      },
      {
        Header: 'Time',
        accessor: (row) => logsDataFormat.format(row.time),
        style: { width: '100px' },
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

      {
        Header: 'Error',
        Cell: ({ row }) => {
          const { error } = row.original;
          return (
            <ColumnWrapper>
              <ObjectInspector data={error || {}} />
            </ColumnWrapper>
          );
        },
      },
    ],
    [lastReadLogId],
  );

  const sortedLogs = logsHistory.slice().sort((a, b) => b.time - a.time);
  return (
    <>
      {!autoOpen && (
        <Button.BarButton
          onClick={() => {
            openDialog();
          }}
        >
          <div style={{ position: 'relative' }}>
            <IoBugOutline fontSize="1.4em" />
            {count && (
              <span
                style={{
                  position: 'absolute',
                  top: '-0.4em',
                  left: '-0.4em',
                  backgroundColor,
                  borderRadius: '50%',
                  minWidth: '14px',
                  fontSize: '0.75em',
                  color: 'white',
                }}
              >
                {count}
              </span>
            )}
          </div>
        </Button.BarButton>
      )}

      <Modal
        hasCloseButton
        isOpen={isOpenDialog}
        onRequestClose={() => {
          markAsRead();
          closeDialog();
          onClose?.();
        }}
      >
        <Modal.Header>Logs History </Modal.Header>
        <Modal.Body>
          <div style={{ width: '50vw', height: '50vh', padding: '0.5em' }}>
            <ReactTable
              columns={COLUMNS}
              data={sortedLogs}
              emptyDataRowText="No Logs"
              rowStyle={handleRowStyle}
            />
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button.Danger onClick={() => logger.clear()} fill="outline">
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <FaRegTrashAlt />
              <span style={{ paddingLeft: '5px' }}>Clear Logs</span>
            </div>
          </Button.Danger>
        </Modal.Footer>
      </Modal>
    </>
  );
}
