import type {
  ActiveSpectrum,
  JpathTableColumn,
  PredefinedSpectraColumn,
  PredefinedTableColumn,
  SpectraTableColumn,
  Spectrum,
  StateMolecule,
} from '@zakodium/nmrium-core';
import dlv from 'dlv';
import type { CSSProperties } from 'react';
import { useCallback, useMemo, useState } from 'react';
import { FaCopy, FaFileExport, FaRegTrashAlt } from 'react-icons/fa';
import { IoColorPaletteOutline } from 'react-icons/io5';
import type { CellProps } from 'react-table';

import { exportForCT } from '../../../data/SpectraManager.js';
import { isSpectrum1D } from '../../../data/data1d/Spectrum1D/index.js';
import { ClipboardFallbackModal } from '../../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../../utils/clipboard/clipboardHooks.js';
import { useChartData } from '../../context/ChartContext.js';
import { useDispatch } from '../../context/DispatchContext.js';
import { useSortSpectra } from '../../context/SortSpectraContext.js';
import { useToaster } from '../../context/ToasterContext.js';
import type { ContextMenuItem } from '../../elements/ContextMenuBluePrint.js';
import { ContextMenu } from '../../elements/ContextMenuBluePrint.js';
import type { Column } from '../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import { usePanelPreferences } from '../../hooks/usePanelPreferences.js';
import ExportAsJcampModal from '../../modal/ExportAsJcampModal.js';
import { saveAs } from '../../utility/save_as.js';

import { RenderAsHTML } from './base/RenderAsHTML.js';
import type { OnChangeVisibilityEvent } from './base/ShowHideSpectrumButton.js';
import ShowHideSpectrumButton from './base/ShowHideSpectrumButton.js';
import { SpectrumName } from './base/SpectrumName.js';
import { SpectrumSetting } from './base/setting/SpectrumSetting.js';

function getActiveSpectraSet(activeSpectra: ActiveSpectrum[] | null) {
  const result = new Set<string>();
  if (activeSpectra) {
    for (const activeSpectrum of activeSpectra) {
      if (activeSpectrum?.selected) {
        result.add(activeSpectrum.id);
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
  onChangeActiveSpectrum: (event: Event, data: Spectrum) => void;
  nucleus: string;
}

const options: ContextMenuItem[] = [
  {
    text: 'Recolor based on distinct value',
    icon: <IoColorPaletteOutline />,
  },
];

const SpectraContextMenuOptionsKeys = {
  CopyToClipboard: 'CopyToClipboard',
  Delete: 'Delete',
  ExportAsJcamp: 'ExportAsJcamp',
  ExportAsText: 'ExportAsText',
  CopyAsText: 'CopyAsText',
  ExportForCT: 'ExportForCT',
} as const;

const Spectra2DContextMenuOptions: ContextMenuItem[] = [
  {
    text: 'Copy to clipboard',
    icon: <FaCopy />,
    data: { id: SpectraContextMenuOptionsKeys.CopyToClipboard },
  },
  {
    text: 'Delete',
    icon: <FaRegTrashAlt />,
    data: { id: SpectraContextMenuOptionsKeys.Delete },
  },
];

interface Spectra1DContextMenuOptions {
  molecules?: StateMolecule[];
}

function getSpectra1DContextMenuOptions(
  options: Spectra1DContextMenuOptions,
): ContextMenuItem[] {
  const { molecules = [] } = options;

  return [
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
    {
      text: 'Export for CT',
      icon: <FaFileExport />,
      data: { id: SpectraContextMenuOptionsKeys.ExportForCT },
      tooltip: {
        content:
          'A chemical structure and a processed proton spectrum are required to use CT',
      },
      disabled: (spectrum: Spectrum) =>
        !isValidExportForCT(spectrum, molecules),
    },
  ];
}

function isValidExportForCT(spectrum: Spectrum, molecules: StateMolecule[]) {
  if (!isSpectrum1D(spectrum)) {
    return false;
  }
  if (!spectrum.info.isFt) {
    return false;
  }
  if (!(Array.isArray(molecules) && molecules.length > 0)) {
    return false;
  }

  return true;
}

export function SpectraTable(props: SpectraTableProps) {
  const {
    data,
    activeSpectra,
    onChangeVisibility,
    onChangeActiveSpectrum,
    nucleus,
  } = props;
  const toaster = useToaster();
  const dispatch = useDispatch();
  const spectraPreferences = usePanelPreferences('spectra', nucleus);
  const activeSpectraSet = getActiveSpectraSet(activeSpectra);
  const [exportedSpectrum, setExportedSpectrum] = useState<Spectrum | null>();
  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();
  const { molecules } = useChartData();
  const { sort, reset } = useSortSpectra();

  const COLUMNS: Partial<
    Record<(string & {}) | PredefinedSpectraColumn, Column<Spectrum>>
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
        Cell: ({ row }: CellProps<Spectrum>) => {
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
        Cell: ({ row }: CellProps<Spectrum>) => {
          const {
            display,
            info: { dimension, isFid },
          } = row.original;
          if (dimension === 2 && isFid) {
            return <div />;
          }

          return (
            <SpectrumSetting
              data={row.original}
              display={display}
              dimension={dimension}
            />
          );
        },
      },
    }),
    [onChangeVisibility],
  );

  const selectContextMenuHandler = useCallback(
    async (option: any, spectrum: any) => {
      const { id } = option;
      switch (id) {
        case SpectraContextMenuOptionsKeys.CopyToClipboard: {
          void (async () => {
            const { data, info } = spectrum;
            await rawWriteWithType(
              JSON.stringify(
                { data, info },
                (_, value: any) =>
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
            dispatch({
              type: 'DELETE_SPECTRA',
              payload: { ids: [spectrum.id] },
            });
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
          const name = spectrum?.info?.name || 'experiment';
          saveAs({ blob, name, extension: '.tsv' });
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
        case SpectraContextMenuOptionsKeys.ExportForCT: {
          try {
            await exportForCT({ spectrum, molecules });
          } catch (error: unknown) {
            const message = (error as Error)?.message;

            if (message) {
              toaster.show({ intent: 'danger', message });
            }
          }
          break;
        }

        default: {
          break;
        }
      }
    },

    [dispatch, molecules, rawWriteWithType, toaster],
  );

  function handleActiveRow(row: any) {
    return activeSpectraSet.has(row?.original.id) || false;
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
        const pathString = pathToString(path);
        let style: CSSProperties = columnStyle;
        let cellRender: Column<Spectrum>['Cell'] | null = null;
        if (pathString === 'info.name') {
          if (visibleColumns.length > 3) {
            style = { ...columnStyle, width: '50%' };
          }
          cellRender = ({ row }: CellProps<Spectrum>) => {
            return <SpectrumName data={row.original} />;
          };
        }

        if (pathString === 'info.solvent') {
          cellRender = ({ row }: CellProps<Spectrum>) => {
            return <RenderAsHTML data={row.original} jpath={pathString} />;
          };
        }

        const cell: Column<Spectrum> = {
          Header: () => <ColumnHeader label={col.label} col={col} />,
          accessor: (row) => getValue(row, path),
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

  function handleSortEnd(data: any, isTabledSorted: any) {
    if (isTabledSorted) {
      sort({ sortType: 'sortByReferenceIndexes', sortByReferences: data });
    } else {
      reset();
    }
  }

  function handleRowStyle(data: any) {
    return {
      base: activeSpectraSet.has(data?.original.id) ? { opacity: 0.2 } : {},
      activated: { opacity: 1 },
    };
  }

  const contextMenu =
    nucleus.split(',').length === 1
      ? getSpectra1DContextMenuOptions({
          molecules,
        })
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

function pathToString(path: string[]) {
  return Array.isArray(path) ? path.join('.') : '';
}

function getValue(row: any, path: any) {
  const value = dlv(row, path, '');
  const pathString = pathToString(path);

  if (
    Array.isArray(value) &&
    ['info.baseFrequency', 'info.originFrequency'].includes(pathString)
  ) {
    return value[0];
  }

  if (Array.isArray(value)) {
    return value.join(',');
  }

  return value;
}
