import { saveAs } from 'file-saver';
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

import { isSpectrum1D } from '../../../data/data1d/Spectrum1D';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks';
import { useDispatch } from '../../context/DispatchContext';
import { useToaster } from '../../context/ToasterContext';
import {
  ContextMenu,
  ContextMenuItem,
} from '../../elements/ContextMenuBluePrint';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import ExportAsJcampModal from '../../modal/ExportAsJcampModal';

import ColorIndicator from './base/ColorIndicator';
import { RenderAsHTML } from './base/RenderAsHTML';
import ShowHideSpectrumButton, {
  OnChangeVisibilityEvent,
} from './base/ShowHideSpectrumButton';
import { SpectrumName } from './base/SpectrumName';

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
  height: '24px',
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
  ExportAsText = 'ExportAsText',
  CopyAsText = 'CopyAsText',
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
];

const Spectra1DContextMenuOptions: ContextMenuItem[] = [
  ...Spectra2DContextMenuOptions,
  {
    text: 'Export as JCAMP-DX',
    icon: <FaFileExport />,
    data: { id: SpectraContextMenuOptionsKeys.ExportAsJcamp },
  },
  {
    text: 'Export as text',
    icon: <FaFileExport />,
    data: { id: SpectraContextMenuOptionsKeys.ExportAsText },
  },
  {
    text: 'Copy as text',
    icon: <FaCopy />,
    data: { id: SpectraContextMenuOptionsKeys.CopyAsText },
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
  const toaster = useToaster();
  const dispatch = useDispatch();
  const spectraPreferences = usePanelPreferences('spectra', nucleus);
  const activeSpectraObj = getActiveSpectraAsObject(activeSpectra);
  const [exportedSpectrum, setExportedSpectrum] = useState<Spectrum | null>();
  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();

  const COLUMNS: Partial<
    Record<
      // eslint-disable-next-line @typescript-eslint/ban-types
      (string & {}) | PredefinedSpectraColumn,
      Column<Spectrum>
    >
  > = useMemo(
    () => ({
      visible: {
        id: 'hide-show-spectrum',
        Header: '',
        style: {
          width: '35px',
          maxWidth: '55px',
          height: '24px',
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
      color: {
        id: 'spectrum-actions',
        style: {
          width: '30px',
          maxWidth: '30px',
          height: '24px',
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
            toaster.show({
              message: 'Data copied to clipboard',
              intent: 'success',
            });
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
        case SpectraContextMenuOptionsKeys.ExportAsText: {
          const data = convertSpectrumToText(spectrum);
          const blob = new Blob([data], { type: 'text/plain' });
          saveAs(blob, `${spectrum.info.name}.tsv`);
          break;
        }
        case SpectraContextMenuOptionsKeys.CopyAsText: {
          const data = convertSpectrumToText(spectrum);
          void rawWriteWithType(data, 'text/plain').then(() =>
            toaster.show({
              message: 'Spectrum copied to clipboard',
              intent: 'success',
            }),
          );
          break;
        }

        default: {
          break;
        }
      }
    },

    [dispatch, rawWriteWithType, toaster],
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
        });
      } else {
        const pathString = Array.isArray(path) ? path.join('.') : '';
        let style: CSSProperties = columnStyle;
        let cellRender: Column<Spectrum>['Cell'] | null = null;
        if (pathString === 'info.name') {
          if (visibleColumns.length > 3) {
            style = { ...columnStyle, width: '50%' };
          }
          cellRender = ({ row }) => {
            return <SpectrumName data={row.original} />;
          };
        }

        if (pathString === 'info.solvent') {
          cellRender = ({ row }) => {
            return <RenderAsHTML data={row.original} jpath={pathString} />;
          };
        }

        const cell: Column<Spectrum> = {
          Header: () => <ColumnHeader label={col.label} col={col} />,
          accessor: (row) => lodashGet(row, path, ''),
          ...(cellRender && { Cell: cellRender }),
          id: `${index}`,
          style,
        };

        columns.push(cell);
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

  const contextMenu =
    nucleus.split(',').length === 1
      ? Spectra1DContextMenuOptions
      : Spectra2DContextMenuOptions;
  return (
    <>
      <ReactTable
        rowStyle={handleRowStyle}
        activeRow={handleActiveRow}
        data={data}
        columns={tableColumns}
        onClick={(e, data: any) => onChangeActiveSpectrum(e, data.original)}
        enableVirtualScroll
        approxItemHeight={24}
        contextMenu={contextMenu}
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

function convertSpectrumToText(spectrum: Spectrum) {
  if (!isSpectrum1D(spectrum)) return '';

  const {
    data: { x, re },
  } = spectrum;
  const lines = ['x\ty'];
  for (let i = 0; i < x.length; i++) {
    lines.push(`${x[i]}\t${re[i]}`);
  }
  return lines.join('\n');
}
