import { Classes, Dialog, DialogFooter } from '@blueprintjs/core';
import styled from '@emotion/styled';
import { yupResolver } from '@hookform/resolvers/yup';
import { useCallback, useMemo } from 'react';
import { useForm } from 'react-hook-form';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import { array, object, string } from 'yup';

import { useDispatch } from '../../context/DispatchContext.js';
import { Input2Controller } from '../../elements/Input2Controller.js';
import type { Column } from '../../elements/ReactTable/ReactTable.js';
import ReactTable from '../../elements/ReactTable/ReactTable.js';
import { StyledDialogBody } from '../../elements/StyledDialogBody.js';
import useSpectrum from '../../hooks/useSpectrum.js';
import { checkUniqueByKey } from '../../utility/checkUniqueByKey.js';

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: calc(100% - 30px);
  width: 100%;
`;

const metaInfoArraySchema = array()
  .of(
    object({
      key: string().required().trim(),
      value: string().required().trim(),
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

interface MetaInfoItem {
  key: string;
  value: string;
}
interface InformationEditionModalProps {
  onCloseDialog: () => void;
  isOpen: boolean;
}

interface InnerInformationPanelProps
  extends Omit<InformationEditionModalProps, 'isOpen'> {
  metaInfo: MetaInfoItem[];
}

export function InformationEditionModal(props: InformationEditionModalProps) {
  const { isOpen, onCloseDialog } = props;
  const spectrum = useSpectrum();

  if (!isOpen || !spectrum) return null;

  const metaInfo = Object.keys(spectrum.customInfo).map((key) => ({
    key,
    value: spectrum.customInfo[key],
  }));

  return (
    <Dialog
      isOpen
      title="Edit spectrum meta information"
      onClose={onCloseDialog}
      style={{ width: 700, height: 500 }}
    >
      <InnerInformationPanel
        metaInfo={metaInfo}
        onCloseDialog={onCloseDialog}
      />
    </Dialog>
  );
}

function InnerInformationPanel(props: InnerInformationPanelProps) {
  const { metaInfo = [], onCloseDialog } = props;
  const dispatch = useDispatch();
  const { handleSubmit, reset, control, watch } = useForm<{
    metaInfo: MetaInfoItem[];
  }>({
    defaultValues: { metaInfo },
    resolver: yupResolver(metaInfoValidationSchema),
  });

  const addHandler = useCallback(
    (data, index = 0) => {
      const meta = { key: '', value: '' };
      reset({
        metaInfo: [...data.slice(0, index), meta, ...data.slice(index)],
      });
    },
    [reset],
  );

  const deleteHandler = useCallback(
    (data, index: number) => {
      const meta = data.filter((_, columnIndex) => columnIndex !== index);
      reset({ metaInfo: meta });
    },
    [reset],
  );

  function saveHandler(values) {
    const { metaInfo } = values;
    const meta = {};

    for (const { key, value } of metaInfo) {
      meta[key] = value;
    }

    dispatch({ type: 'UPDATE_SPECTRUM_META', payload: { meta } });
    onCloseDialog();
  }

  const COLUMNS: Array<Column<MetaInfoItem>> = useMemo(
    () => [
      {
        Header: '#',
        style: { width: '25px', textAlign: 'center' },
        accessor: (_, index) => index + 1,
      },
      {
        Header: 'Key',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <Input2Controller
              control={control}
              name={`metaInfo.${row.index}.key`}
              noShadowBox
            />
          );
        },
      },
      {
        Header: 'Value',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <Input2Controller
              control={control}
              name={`metaInfo.${row.index}.value`}
              noShadowBox
            />
          );
        },
      },
      {
        Header: '',
        style: { width: '60px' },
        id: 'action-button',
        Cell: ({ data, row }) => {
          return (
            <div style={{ display: 'flex', justifyContent: 'space-evenly' }}>
              <Button
                small
                outlined
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
                small
                outlined
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
    [addHandler, control, deleteHandler],
  );

  const values = watch('metaInfo');
  return (
    <>
      <StyledDialogBody>
        <Container>
          <div style={{ padding: '5px 0', display: 'flex' }}>
            <Button
              intent="success"
              small
              outlined
              onClick={() => addHandler(values)}
              tooltipProps={{ content: '', disabled: true }}
            >
              Add a new meta
            </Button>
          </div>

          <ReactTable<MetaInfoItem>
            data={values}
            columns={COLUMNS}
            emptyDataRowText="No meta"
            style={{
              'thead tr th': { zIndex: 1 },
              td: { padding: 0 },
            }}
            rowStyle={{
              hover: { backgroundColor: '#f7f7f7' },
              active: { backgroundColor: '#f5f5f5' },
            }}
          />
        </Container>
      </StyledDialogBody>
      <DialogFooter>
        <Button
          intent="success"
          onClick={() => handleSubmit(saveHandler)()}
          tooltipProps={{ content: '', disabled: true }}
        >
          Save meta
        </Button>
      </DialogFooter>
    </>
  );
}
