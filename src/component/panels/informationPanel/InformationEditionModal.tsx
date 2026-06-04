import { Classes, DialogFooter, Icon } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import type { Spectrum } from '@zakodium/nmrium-core';
import { useCallback, useMemo } from 'react';
import { Controller, useForm, useWatch } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import type { CellProps } from 'react-table';
import { array, mixed, object, string } from 'yup';

import { useDispatch } from '../../context/DispatchContext.js';
import { Input2Controller } from '../../elements/Input2Controller.js';
import type { Column } from '../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import { Select2Controller } from '../../elements/Select2Controller.tsx';
import { StandardDialog } from '../../elements/StandardDialog.tsx';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import { useSelectedSpectra } from '../../hooks/useSelectedSpectra.ts';
import { checkUniqueByKey } from '../../utility/checkUniqueByKey.js';

import { SpectraPicker } from './SpectraPicker.tsx';

type Scope = 'all' | 'override' | 'missing';

interface ScopeItem {
  value: Scope;
  label: string;
}

const SCOPES: ScopeItem[] = [
  { value: 'all', label: 'All spectra' },
  { value: 'override', label: 'Override existing' },
  { value: 'missing', label: 'Fill missing only' },
];

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 40px);
  width: 100%;
`;

const Footer = styled(DialogFooter)`
  div {
    padding: 10px;
    background: #f8fafc;
    display: flex;
    align-items: center;
    justify-content: space-between;
  }
`;

const CardHeader = styled.div`
  padding: 18px 22px 16px;
  display: flex;
  align-items: flex-start;
  gap: 14px;
`;

const CardHeaderText = styled.div`
  flex: 1;
`;

const CardTitle = styled.h2`
  font-size: 15px;
  font-weight: 600;
  color: #1c2127;
  margin: 0 0 3px;
`;

const CardSubtitle = styled.p`
  font-size: 12px;
  color: #8f99a8;
  margin: 0;
  line-height: 1.5;
`;

const FooterHint = styled.div`
  font-size: 12px;
  color: #8f99a8;
  display: flex;
  align-items: center;
  gap: 6px;
`;

const Toolbar = styled.div`
  padding: 12px 0;
  border-bottom: 1px solid #edf0f3;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const RowCount = styled.span`
  margin-left: auto;
  font-size: 12px;
  color: #8f99a8;
`;

const metaInfoArraySchema = array()
  .of(
    object({
      key: string().required().trim(),
      value: string().trim(),
      scope: mixed<Scope>().oneOf(['all', 'missing', 'override']).required(),
      spectra: array().of(string().required()).required(),
    }),
  )
  .required();

const metaInfoValidationSchema = object()
  .shape({
    metaInfo: metaInfoArraySchema,
  })
  .test('Unique', 'Key need te be unique', function check(values) {
    // eslint-disable-next-line no-invalid-this
    return checkUniqueByKey(values.metaInfo, 'key', this, 'metaInfo');
  });

interface InformationEditionModalProps {
  onCloseDialog: () => void;
  isOpen: boolean;
}

interface InnerInformationPanelProps extends Omit<
  InformationEditionModalProps,
  'isOpen'
> {
  metaInfo: MetaInfoItem[];
}

interface MetaInfoItem {
  key: string;
  value?: string;
  values?: Record<string, string>;
  scope: Scope;
  spectra: string[];
}

function generateMetaInfo(selectedSpectra: Spectrum[]): MetaInfoItem[] {
  if (selectedSpectra.length === 0) return [];

  const keyData = new Map<
    string,
    {
      spectra: string[];
      valueMap: Map<string, string | undefined>;
    }
  >();

  for (const spectrum of selectedSpectra) {
    if (!spectrum.customInfo) continue;

    for (const [key, value] of Object.entries(spectrum.customInfo)) {
      let data = keyData.get(key);
      if (!data) {
        data = { spectra: [], valueMap: new Map() };
        keyData.set(key, data);
      }
      data.spectra.push(spectrum.id);
      data.valueMap.set(spectrum.id, value as string | undefined);
    }
  }

  const result: MetaInfoItem[] = [];
  for (const [key, data] of keyData) {
    const values = Array.from(data.valueMap.values());
    const uniqueValues = new Set(values);
    const valuesObj: Record<string, string> = {};
    for (const [id, val] of data.valueMap) {
      if (val !== undefined) {
        valuesObj[id] = val;
      }
    }
    if (uniqueValues.size === 1) {
      const singleValue = values[0];

      // Skip if all values are undefined
      if (singleValue === undefined) continue;

      result.push({
        key,
        value: singleValue,
        scope: 'all',
        values: valuesObj,
        spectra: data.spectra,
      });
    } else {
      result.push({
        key,
        value: '',
        values: valuesObj,
        scope: 'missing',
        spectra: data.spectra,
      });
    }
  }

  return result;
}

function metaToSpectraMap(
  metaInfo: MetaInfoItem[],
  allSpectraIds: string[],
): Record<string, Record<string, string>> {
  const result: Record<string, Record<string, string>> = {};

  for (const id of allSpectraIds) {
    result[id] = {};
  }

  for (const meta of metaInfo) {
    const { scope, spectra, key, value, values } = meta;
    for (const spectrumId of spectra) {
      if (!(spectrumId in result)) continue;

      const hasExistingKey = values && spectrumId in values;
      const hasValue = typeof value === 'string';

      if (scope === 'all' && hasValue) {
        result[spectrumId][key] = value;
      }

      if (scope === 'missing') {
        if (hasExistingKey) {
          result[spectrumId][key] = values?.[spectrumId] || '';
        } else if (hasValue) {
          result[spectrumId][key] = value;
        }
      }

      if (
        scope === 'override' && // Only update spectra that have this key in meta.values
        hasExistingKey &&
        hasValue
      ) {
        // Overwrite with the new value meta.value
        result[spectrumId][key] = value;
      }
    }
  }

  return result;
}

export function InformationEditionModal(props: InformationEditionModalProps) {
  const { isOpen, onCloseDialog } = props;
  const spectra = useSelectedSpectra();

  if (!isOpen || !spectra) return null;

  const metaInfo: MetaInfoItem[] = generateMetaInfo(spectra);

  return (
    <StandardDialog
      isOpen
      title={
        <CardHeader>
          <CardHeaderText>
            <CardTitle>Meta information</CardTitle>
            <CardSubtitle>
              Define keys and values to apply across spectra. Control scope and
              target spectra per row.
            </CardSubtitle>
          </CardHeaderText>
        </CardHeader>
      }
      canOutsideClickClose
      onClose={onCloseDialog}
      style={{ width: 700, height: 500 }}
    >
      <InnerInformationPanel
        metaInfo={metaInfo}
        onCloseDialog={onCloseDialog}
      />
    </StandardDialog>
  );
}

function InnerInformationPanel(props: InnerInformationPanelProps) {
  const { metaInfo = [], onCloseDialog } = props;
  const dispatch = useDispatch();
  const spectra = useSelectedSpectra();
  const disabled = (spectra?.length ?? 0) < 2;
  const { handleSubmit, reset, control } = useForm<{
    metaInfo: MetaInfoItem[];
  }>({
    defaultValues: { metaInfo },
    resolver: yupResolver(metaInfoValidationSchema),
  });

  const addHandler = useCallback(
    (data: any, index = 0) => {
      const meta = {
        key: '',
        value: '',
        scope: 'all',
        spectra: spectra?.map(({ id }) => id),
      };
      reset({
        metaInfo: [...data.slice(0, index), meta, ...data.slice(index)],
      });
    },
    [reset, spectra],
  );

  const deleteHandler = useCallback(
    (data: any, index: number) => {
      const meta = data.filter(
        (_: any, columnIndex: any) => columnIndex !== index,
      );
      reset({ metaInfo: meta });
    },
    [reset],
  );

  function saveHandler(values: any) {
    const { metaInfo } = values;
    const meta = metaToSpectraMap(metaInfo, spectra?.map(({ id }) => id) || []);
    dispatch({ type: 'UPDATE_SPECTRUM_META', payload: { meta } });
    onCloseDialog();
  }

  const COLUMNS = useMemo<Array<Column<MetaInfoItem>>>(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Key',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<MetaInfoItem>) => {
          return (
            <Input2Controller
              control={control}
              name={`metaInfo.${row.index}.key`}
              placeholder="e.g. solvent"
              noShadowBox
            />
          );
        },
      },
      {
        Header: 'Value',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<MetaInfoItem>) => {
          return (
            <Input2Controller
              control={control}
              name={`metaInfo.${row.index}.value`}
              placeholder="Value"
              mapValue={String}
              noShadowBox
            />
          );
        },
      },
      {
        Header: 'Scope',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<MetaInfoItem>) => {
          return (
            <Select2Controller
              disabled={disabled}
              name={`metaInfo.${row.index}.scope`}
              control={control}
              items={SCOPES}
              getSelectedText={(item) =>
                item.value.charAt(0).toUpperCase() + item.value.slice(1)
              }
              selectedButtonProps={{
                variant: 'minimal',
                size: 'small',
                disabled,
              }}
            />
          );
        },
      },
      {
        Header: 'Spectra',
        style: { padding: 0 },
        Cell: ({ row }: CellProps<MetaInfoItem>) => {
          return (
            <Controller
              name={`metaInfo.${row.index}.spectra`}
              control={control}
              render={({ field }) => {
                const { value, onChange } = field;
                return (
                  <SpectraPicker
                    disabled={disabled}
                    selected={value}
                    onChange={(ids) => onChange(ids)}
                  />
                );
              }}
            />
          );
        },
      },
      {
        Header: '',
        style: { width: '60px' },
        id: 'action-button',
        Cell: ({ data, row }: CellProps<MetaInfoItem>) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                size="small"
                variant="minimal"
                intent="success"
                tooltipProps={{ content: '', disabled: true }}
                onClick={(e) => {
                  e.stopPropagation();
                  addHandler(data, row.index + 1);
                }}
              >
                <FaPlus className={Classes.ICON} />
              </Button>
              <Button
                size="small"
                variant="minimal"
                intent="danger"
                tooltipProps={{ content: '', disabled: true }}
                onClick={(e) => {
                  e.stopPropagation();
                  deleteHandler(data, row.index);
                }}
              >
                <FaRegTrashAlt className={Classes.ICON} />
              </Button>
            </div>
          );
        },
      },
    ],
    [addHandler, control, deleteHandler, disabled],
  );

  const values = useWatch({ name: 'metaInfo', control });

  return (
    <>
      <StyledDialogBody>
        <Container>
          <Toolbar>
            <Button
              intent="success"
              size="medium"
              variant="outlined"
              icon="plus"
              onClick={() => addHandler(values)}
              tooltipProps={{ content: '', disabled: true }}
            >
              Add a new meta
            </Button>
            <RowCount>{spectra?.length} spectra selected</RowCount>
          </Toolbar>

          <ReactTable<MetaInfoItem>
            data={values}
            columns={COLUMNS}
            emptyDataRowText="No meta"
            style={{
              'thead th': {
                textAlign: 'center',
                padding: '5px 0px',
                fontWeight: '600',
                fontSize: '11px',
                letterSpacing: '0.5px',
                color: '#6b7280',
                border: 'none',
                borderBottom: '2px solid #e5e7eb',
                background: '#f9fafb',
                zIndex: 1,
              },
              'tr td': {
                borderRight: 'none',
              },
            }}
            rowStyle={{
              hover: { backgroundColor: '#f7f7f7' },
              active: { backgroundColor: '#f5f5f5' },
            }}
          />
        </Container>
      </StyledDialogBody>
      <Footer style={{ padding: 0 }}>
        <FooterHint>
          <Icon icon="info-sign" size={13} color="#8F99A8" />
          Click the spectra badge to choose which spectra each row targets
        </FooterHint>
        <Button
          intent="success"
          onClick={() => handleSubmit(saveHandler)()}
          tooltipProps={{ content: '', disabled: true }}
        >
          Save meta
        </Button>
      </Footer>
    </>
  );
}
