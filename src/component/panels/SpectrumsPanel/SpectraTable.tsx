import { useMemo, CSSProperties } from 'react';

import { Datum1D } from '../../../data/types/data1d';
import { Datum2D } from '../../../data/types/data2d';
import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { CustomColumn } from '../../elements/ReactTable/utility/addCustomColumn';
import { useAlert } from '../../elements/popup/Alert';
import { ActiveSpectrum } from '../../reducer/Reducer';
import { DELETE_SPECTRA } from '../../reducer/types/Types';
import { copyTextToClipboard } from '../../utility/export';

import ColorIndicator from './base/ColorIndicator';
import ShowHideMarkersButton, {
  Markers,
  OnChangeMarkersVisibilityEvent,
} from './base/ShowHideMarkersButton';
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
};

interface SpectraTableProps
  extends OnChangeVisibilityEvent,
    OnChangeMarkersVisibilityEvent {
  data: any;
  markersVisible: Markers;
  activeSpectrum: ActiveSpectrum | null;
  onOpenSettingModal: (event: Event, data: Datum1D | Datum2D) => void;
  onChangeActiveSpectrum: (event: Event, data: Datum1D | Datum2D) => void;
}

const columnStyle = {
  paddingTop: 0,
  paddingBottom: 0,
};

export function SpectraTable(props: SpectraTableProps) {
  const {
    data,
    markersVisible,
    activeSpectrum,
    onChangeVisibility,
    onChangeMarkersVisibility,
    onOpenSettingModal,
    onChangeActiveSpectrum,
  } = props;
  const alert = useAlert();
  const dispatch = useDispatch();

  const basicColumns: CustomColumn<Datum1D | Datum2D>[] = [
    {
      index: 1,
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
    {
      index: 2,
      Header: 'Name',
      style: { width: '50%', ...columnStyle },
      accessor: (row) => row.display.name,
      Cell: ({ row }) => {
        return <SpectrumName data={row.original} />;
      },
      sortType: 'basic',
    },
    {
      index: 3,
      Header: 'Solvent',
      style: columnStyle,
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
    {
      index: 4,
      Header: 'Pulse',
      style: columnStyle,
      accessor: (row) => (row.info as any)?.pulse,
    },
    {
      index: 5,
      Header: 'Experiment',
      style: columnStyle,
      accessor: (row) => (row.info as any)?.experiment,
    },
    {
      index: 6,
      id: 'spectrum-actions',
      Header: '',
      style: {
        width: '30px',
        ...columnStyle,
      },
      Cell: ({ row }) => {
        return (
          <div style={{ display: 'flex', flexDirection: 'row' }}>
            <ShowHideMarkersButton
              data={row.original as Datum1D}
              onChangeMarkersVisibility={onChangeMarkersVisibility}
              markersVisible={markersVisible}
            />
            <ColorIndicator
              display={row.original.display}
              dimension={row.original.info.dimension}
              onClick={(event) => onOpenSettingModal(event, row.original)}
            />
          </div>
        );
      },
    },
  ];

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

  return (
    <ReactTable
      rowStyle={{
        base: activeSpectrum?.id ? { opacity: 0.2 } : {},
        activated: { opacity: 1 },
      }}
      activeRow={handleActiveRow}
      data={data}
      columns={basicColumns}
      onClick={(e, data: any) =>
        onChangeActiveSpectrum(e, data.original as Datum1D | Datum2D)
      }
      context={contextMenu}
    />
  );
}
