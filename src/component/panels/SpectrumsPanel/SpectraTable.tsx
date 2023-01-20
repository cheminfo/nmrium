import { useMemo, CSSProperties } from 'react';
import { IoColorPaletteOutline } from 'react-icons/io5';
import { DropdownMenu, DropdownMenuProps } from 'react-science/ui';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { useDispatch } from '../../context/DispatchContext';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import { ActiveSpectrum } from '../../reducer/Reducer';
import {
  DELETE_SPECTRA,
  ORDER_SPECTRA,
  RECOLOR_SPECTRA_COLOR,
} from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/export';
import {
  JpathTableColumn,
  PredefinedSpectraColumn,
  PredefinedTableColumn,
  SpectraTableColumn,
} from '../../workspaces/Workspace';

import ColorIndicator from './base/ColorIndicator';
import ShowHideSpectrumButton, {
  OnChangeVisibilityEvent,
} from './base/ShowHideSpectrumButton';
import { SpectrumName } from './base/SpectrumName';

function formatValueAsHTML(value) {
  if (value) {
    value = value.replace(/(?<value>\d+)/g, '<sub>$<value></sub>');
  }
  return value;
}

export const SpectraTableButtonStyle: CSSProperties = {
  backgroundColor: 'transparent',
  border: 'none',
  width: '20px',
  height: '20px',
  margin: 'auto',
};

const jPathColumnStyle: CSSProperties = {
  width: '10%',
  maxWidth: 0,
  whiteSpace: 'nowrap',
  overflow: 'hidden',
  textOverflow: 'ellipsis',
};

interface SpectraTableProps extends OnChangeVisibilityEvent {
  data: any;
  activeSpectrum: ActiveSpectrum | null;
  onOpenSettingModal: (event: Event, data: Datum1D | Datum2D) => void;
  onChangeActiveSpectrum: (event: Event, data: Datum1D | Datum2D) => void;
  nucleus: string;
}

const columnStyle = {
  paddingTop: 0,
  paddingBottom: 0,
};

const options: DropdownMenuProps<string>['options'] = [
  {
    label: 'Recolor based on distinct value',
    type: 'option',
    icon: <IoColorPaletteOutline />,
  },
];

export function SpectraTable(props: SpectraTableProps) {
  const {
    data,
    activeSpectrum,
    onChangeVisibility,
    onOpenSettingModal,
    onChangeActiveSpectrum,
    nucleus,
  } = props;
  const alert = useAlert();
  const dispatch = useDispatch();
  const spectraPreferences = usePanelPreferences('spectra', nucleus);

  const COLUMNS: Record<
    // eslint-disable-next-line @typescript-eslint/ban-types
    (string & {}) | PredefinedSpectraColumn,
    Column<Datum1D | Datum2D>
  > = useMemo(
    () => ({
      visible: {
        id: 'hide-show-spectrum',
        Header: '',
        style: {
          width: '20px',
          ...columnStyle,
        },
        Cell: ({ row }) => {
          return (
            <ShowHideSpectrumButton
              data={row.original}
              onChangeVisibility={onChangeVisibility}
            />
          );
        },
      },
      name: {
        Header: '',
        style: { width: '50%', maxWidth: 0, ...columnStyle },
        accessor: (row) => row.display.name,
        Cell: ({ row }) => {
          return <SpectrumName data={row.original} />;
        },
      },
      solvent: {
        Header: '',
        style: columnStyle,
        accessor: (row) => row.info.solvent,
        Cell: ({ row }) => {
          const info: any = row.original.info;
          return (
            info?.solvent && (
              <div
                // style={styles.info}
                // eslint-disable-next-line react/no-danger
                dangerouslySetInnerHTML={{
                  __html: formatValueAsHTML(info.solvent),
                }}
              />
            )
          );
        },
      },
      color: {
        id: 'spectrum-actions',
        style: {
          width: '30px',
          ...columnStyle,
        },
        Cell: ({ row }) => {
          return (
            <ColorIndicator
              display={row.original.display}
              dimension={row.original.info.dimension}
              onClick={(event) => onOpenSettingModal(event, row.original)}
            />
          );
        },
      },
    }),
    [onChangeVisibility, onOpenSettingModal],
  );

  const contextMenu = useMemo(
    () => [
      {
        label: 'Copy to Clipboard',
        onClick: (spectrumData) => {
          void (async () => {
            const { data, info } = spectrumData;
            const success = await copyTextToClipboard(
              JSON.stringify(
                { data, info },
                (_, value) =>
                  ArrayBuffer.isView(value) ? Array.from(value as any) : value,
                2,
              ),
            );

            if (success) {
              alert.success('Data copied to clipboard');
            } else {
              alert.error('Copy to clipboard failed');
            }
          })();
        },
      },
      {
        label: 'Delete',
        onClick: (spectrumData) => {
          setTimeout(() => {
            dispatch({ type: DELETE_SPECTRA, id: spectrumData.id });
          }, 0);
        },
      },
    ],
    [alert, dispatch],
  );

  function handleActiveRow(row) {
    return row?.original.id === activeSpectrum?.id;
  }

  const tableColumns = useMemo(() => {
    let columns: Array<Column<Datum1D | Datum2D>> = [];
    let index = 0;
    for (const col of spectraPreferences.columns) {
      if (col.visible) {
        const name = (col as PredefinedTableColumn<any>)?.name;
        if (name && COLUMNS[name]) {
          columns.push({
            ...COLUMNS[name],
            Header: () => <ColumnHeader label={col.label} col={col} />,
            id: name,
          });
        } else {
          const path = (col as JpathTableColumn)?.jpath;
          columns.push({
            Header: () => <ColumnHeader label={col.label} col={col} />,
            accessor: path as any,
            id: `${index}${path}`,
            style: jPathColumnStyle,
          });
        }
      }
      index++;
    }
    return columns;
  }, [COLUMNS, spectraPreferences.columns]);

  function handleSortEnd(data) {
    dispatch({
      type: ORDER_SPECTRA,
      payload: {
        data,
      },
    });
  }

  return (
    <ReactTable
      rowStyle={{
        base: activeSpectrum?.id ? { opacity: 0.2 } : {},
        activated: { opacity: 1 },
      }}
      activeRow={handleActiveRow}
      data={data}
      columns={tableColumns}
      onClick={(e, data: any) =>
        onChangeActiveSpectrum(e, data.original as Datum1D | Datum2D)
      }
      enableVirtualScroll
      approxItemHeight={26}
      context={contextMenu}
      onSortEnd={handleSortEnd}
    />
  );
}

const ColumnHeader = ({
  label,
  col,
}: {
  label: string;
  col: SpectraTableColumn;
}) => {
  const dispatch = useDispatch();

  function selectHandler() {
    if (col?.jpath) {
      dispatch({ type: RECOLOR_SPECTRA_COLOR, payload: { jpath: col?.jpath } });
    }
  }

  return (
    <DropdownMenu
      trigger="contextMenu"
      options={options}
      onSelect={selectHandler}
    >
      <div>{label}</div>
    </DropdownMenu>
  );
};
