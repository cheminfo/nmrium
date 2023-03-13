import { LogEntry } from 'fifo-logger';
import { FaRegTrashAlt } from 'react-icons/fa';
import { IoBugOutline } from 'react-icons/io5';
import { ObjectInspector } from 'react-inspector';
import { useOnOff, Modal } from 'react-science/ui';

import { useLogger } from '../context/LoggerContext';
import Button from '../elements/Button';
import { ColumnWrapper } from '../elements/ColumnWrapper';
import ReactTable, { Column } from '../elements/ReactTable/ReactTable';

const COLUMNS: Column<LogEntry>[] = [
  {
    Header: '#',
    accessor: (_, index) => index + 1,
    style: { width: '1%', maxWidth: '40px' },
  },
  {
    Header: 'Time',
    accessor: (row) => new Date(row.time).toUTCString(),
    style: { width: '200px' },
  },
  {
    Header: 'Level',
    accessor: 'level',
    style: { width: '50px' },
  },
  {
    Header: 'Label',
    accessor: 'levelLabel',
    style: { width: '50px' },
  },
  {
    Header: 'Meta',
    style: { width: '10%' },
    Cell: ({ row }) => {
      const { meta } = row.original;
      return (
        <ColumnWrapper>
          <ObjectInspector data={meta || {}} />
        </ColumnWrapper>
      );
    },
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
];

function handleRowStyle(data) {
  const level = data?.original.level;
  switch (level) {
    case 60: {
      return { base: { backgroundColor: 'pink' } };
    }
    case 40: {
      return { base: { backgroundColor: 'lightyellow' } };
    }
    default:
      return { base: { backgroundColor: 'lightgreen' } };
  }
}

export function LogsHistory() {
  const { logsHistory, logger } = useLogger();
  const [isOpenDialog, openDialog, closeDialog] = useOnOff(false);

  return (
    <>
      <Button.BarButton
        onClick={() => {
          openDialog();
        }}
      >
        <div style={{ position: 'relative' }}>
          <IoBugOutline fontSize="1.4em" />
          <span
            style={{
              position: 'absolute',
              top: '-0.4em',
              left: '-0.4em',
              backgroundColor: '#ff0000c7',
              borderRadius: '50%',
              minWidth: '14px',
              fontSize: '0.75em',
              color: 'white',
            }}
          >
            {logsHistory.length}
          </span>
        </div>
      </Button.BarButton>

      <Modal hasCloseButton isOpen={isOpenDialog} onRequestClose={closeDialog}>
        <Modal.Header>Logs History </Modal.Header>
        <Modal.Body>
          <div style={{ width: '60vw', height: '50vh', padding: '0.5em' }}>
            <ReactTable
              columns={COLUMNS}
              data={logsHistory}
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
