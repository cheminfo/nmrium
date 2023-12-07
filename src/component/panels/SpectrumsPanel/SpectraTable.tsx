import lodashGet from 'lodash/get';
import {
  ActiveSpectrum,
  JpathTableColumn,
  PredefinedSpectraColumn,
  PredefinedTableColumn,
  SpectraTableColumn,
  Spectrum,
} from 'nmr-load-save';
import { useMemo, CSSProperties, useCallback, useState } from 'react';
import { FaCopy, FaRegTrashAlt, FaFileExport } from 'react-icons/fa';
import { IoColorPaletteOutline } from 'react-icons/io5';

import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useDispatch } from '../../context/DispatchContext';
import {
  ContextMenu,
  ContextMenuItem,
} from '../../elements/ContextMenuBluePrint';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import { useAlert } from '../../elements/popup/Alert';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import ExportAsJcampModal from '../../modal/ExportAsJcampModal';

import ColorIndicator from './base/ColorIndicator';
import ShowHideSpectrumButton, {
  OnChangeVisibilityEvent,
} from './base/ShowHideSpectrumButton';
import { SpectrumName } from './base/SpectrumName';

function formatValueAsHTML(value) {
  if (value) {
    value = value.replaceAll(/(?<value>\d+)/g, '<sub>$<value></sub>');
  }
  return value;
}

function getActiveSpectraAsObject(activeSpectra: ActiveSpectrum[] | null) {
  const result = {};
  if (activeSpectra) {
    for (const activeSpectrum of activeSpectra) {
      if (activeSpectrum?.selected) {
        result[activeSpectrum.id] = true;
      }
    }
  }
  return result;
}

const columnStyle: CSSProperties = {
  maxWidth: 0,
  overflow: 'hidden',
};

interface SpectraTableProps extends OnChangeVisibilityEvent {
  data: any;
  activeSpectra: ActiveSpectrum[] | null;
  onOpenSettingModal: (event: Event, data: Spectrum) => void;
  onChangeActiveSpectrum: (event: Event, data: Spectrum) => void;
  nucleus: string;
}

const options: ContextMenuItem[] = [
  {
    text: 'Recolor based on distinct value',
    icon: <IoColorPaletteOutline />,
  },
];

enum SpectraContextMenuOptionsKeys {
  CopyToClipboard = 'CopyToClipboard',
  Delete = 'Delete',
  ExportAsJcamp = 'ExportAsJcamp',
}

const Spectra2DContextMenuOptions: ContextMenuItem[] = [
  {
    text: 'Copy to Clipboard',
    icon: <FaCopy />,
    data: { id: SpectraContextMenuOptionsKeys.CopyToClipboard },
  },
  {
    text: 'Delete',
    icon: <FaRegTrashAlt />,
    data: { id: SpectraContextMenuOptionsKeys.Delete },
  },
  {
    text: 'Export as jcamp',
    icon: <FaFileExport />,
    data: { id: SpectraContextMenuOptionsKeys.ExportAsJcamp },
  },
];

const Spectra1DContextMenuOptions: ContextMenuItem[] = [
  ...Spectra2DContextMenuOptions,
  {
    text: 'Export as jcamp',
    icon: <FaFileExport />,
    data: { id: SpectraContextMenuOptionsKeys.ExportAsJcamp },
  },
];

export function SpectraTable(props: SpectraTableProps) {
  const {
    data,
    activeSpectra,
    onChangeVisibility,
    onOpenSettingModal,
    onChangeActiveSpectrum,
    nucleus,
  } = props;
  const alert = useAlert();
  const dispatch = useDispatch();
  const spectraPreferences = usePanelPreferences('spectra', nucleus);
  const activeSpectraObj = getActiveSpectraAsObject(activeSpectra);
  const [exportedSpectrum, setExportedSpectrum] = useState<Spectrum | null>();

  const COLUMNS: Record<
    // eslint-disable-next-line @typescript-eslint/ban-types
    (string & {}) | PredefinedSpectraColumn,
    Column<Spectrum>
  > = useMemo(
    () => ({
      visible: {
        id: 'hide-show-spectrum',
        Header: '',
        style: {
          width: '35px',
          maxWidth: '55px',
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
        style: columnStyle,
        accessor: (row) => row.info.name,
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
          maxWidth: '30px',
        },
        Cell: ({ row }) => {
          const {
            display,
            info: { dimension, isFid },
          } = row.original;
          if (dimension === 2 && isFid) {
            return <div />;
          }

          return (
            <ColorIndicator
              display={display}
              dimension={dimension}
              onClick={(event) => onOpenSettingModal(event, row.original)}
            />
          );
        },
      },
    }),
    [onChangeVisibility, onOpenSettingModal],
  );

  const { rawWriteWithType, cleanShouldFallback, shouldFallback, text } =
    useClipboard();

  const selectContextMenuHandler = useCallback(
    (option, spectrum) => {
      const { id } = option;
      switch (id) {
        case SpectraContextMenuOptionsKeys.CopyToClipboard: {
          void (async () => {
            const { data, info } = spectrum;
            await rawWriteWithType(
              JSON.stringify(
                { data, info },
                (_, value) =>
                  ArrayBuffer.isView(value) ? Array.from(value as any) : value,
                2,
              ),
            );
            alert.success('Data copied to clipboard');
          })();
          break;
        }
        case SpectraContextMenuOptionsKeys.Delete: {
          setTimeout(() => {
            dispatch({ type: 'DELETE_SPECTRA', payload: { id: spectrum.id } });
          }, 0);
          break;
        }
        case SpectraContextMenuOptionsKeys.ExportAsJcamp: {
          setExportedSpectrum(spectrum);
          break;
        }

        default: {
          break;
        }
      }
    },

    [alert, dispatch, rawWriteWithType],
  );

  function handleActiveRow(row) {
    return activeSpectraObj?.[row?.original.id] || false;
  }

  const tableColumns = useMemo(() => {
    const columns: Array<Column<Spectrum>> = [];
    let index = 0;
    const visibleColumns = spectraPreferences.columns.filter(
      (col) => col.visible,
    );
    for (const col of visibleColumns) {
      const name = (col as PredefinedTableColumn<any>)?.name;
      const path = (col as JpathTableColumn)?.jpath;

      if (name && COLUMNS[name]) {
        columns.push({
          ...COLUMNS[name],
          Header: () => <ColumnHeader label={col.label} col={col} />,
          id: name,
          style:
            name === 'name' && visibleColumns.length > 3
              ? {
                  ...COLUMNS[name].style,
                  width: '50%',
                }
              : COLUMNS[name].style,
        });
      } else {
        columns.push({
          Header: () => <ColumnHeader label={col.label} col={col} />,
          accessor: (row) => lodashGet(row, path, ''),
          id: `${index}`,
          style: columnStyle,
        });
      }
      index++;
    }
    return columns;
  }, [COLUMNS, spectraPreferences.columns]);

  function handleSortEnd(data) {
    dispatch({
      type: 'ORDER_SPECTRA',
      payload: {
        data,
      },
    });
  }

  function handleRowStyle(data) {
    return {
      base: activeSpectraObj?.[data?.original.id] ? { opacity: 0.2 } : {},
      activated: { opacity: 1 },
    };
  }

  return (
    <>
      <ReactTable
        rowStyle={handleRowStyle}
        activeRow={handleActiveRow}
        data={data}
        columns={tableColumns}
        onClick={(e, data: any) => onChangeActiveSpectrum(e, data.original)}
        enableVirtualScroll
        approxItemHeight={26}
        contextMenu={
          data.info && data.info.dimension === 1
            ? Spectra1DContextMenuOptions
            : Spectra2DContextMenuOptions
        }
        onContextMenuSelect={selectContextMenuHandler}
        onSortEnd={handleSortEnd}
        style={{ 'table td': { paddingTop: 0, paddingBottom: 0 } }}
      />
      {exportedSpectrum && (
        <ExportAsJcampModal
          spectrum={exportedSpectrum}
          closeDialog={() => {
            setExportedSpectrum(null);
          }}
        />
      )}
      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="Spectra"
      />
    </>
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
      dispatch({
        type: 'RECOLOR_SPECTRA_COLOR',
        payload: { jpath: col?.jpath },
      });
    }
  }

  return (
    <ContextMenu
      options={options}
      onSelect={selectHandler}
      style={{
        whiteSpace: 'nowrap',
        overflow: 'hidden',
        textOverflow: 'ellipsis',
      }}
    >
      {label}
    </ContextMenu>
  );
};
