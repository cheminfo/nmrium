/** @jsxImportSource @emotion/react */
import { Classes, Dialog, DialogBody, DialogFooter } from '@blueprintjs/core';
import { css } from '@emotion/react';
import { Formik, FormikProps } from 'formik';
import { useCallback, useMemo, useRef } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';
import { Button } from 'react-science/ui';
import { Column } from 'react-table';
import { array, object, string } from 'yup';

import { useDispatch } from '../../context/DispatchContext';
import ReactTable from '../../elements/ReactTable/ReactTable';
import { tableInputStyle } from '../../elements/ReactTable/Style';
import FormikInput from '../../elements/formik/FormikInput';
import useSpectrum from '../../hooks/useSpectrum';
import { checkUniqueByKey } from '../../utility/checkUniqueByKey';
import { tablePanelStyle } from '../extra/BasicPanelStyle';

const metaInfoValidationSchema = array()
  .of(
    object().shape({
      key: string().required().trim(),
      value: string().required().trim(),
    }),
  )
  .test('Unique', 'Key need te be unique', function check(metaInfo) {
    // eslint-disable-next-line no-invalid-this
    return checkUniqueByKey(metaInfo, 'key', this);
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
  const formRef = useRef<FormikProps<MetaInfoItem[]>>(null);

  const addHandler = useCallback((data, index = 0) => {
    const meta = { key: '', value: '' };
    void formRef.current?.setValues([
      ...data.slice(0, index),
      meta,
      ...data.slice(index),
    ]);
  }, []);

  const deleteHandler = useCallback((data, index: number) => {
    const meta = data.filter((_, columnIndex) => columnIndex !== index);
    void formRef.current?.setValues(meta);
  }, []);

  function saveHandler(metaArray: MetaInfoItem[]) {
    const meta = {};

    for (const { key, value } of metaArray) {
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
            <FormikInput name={`${row.index}.key`} style={tableInputStyle} />
          );
        },
      },
      {
        Header: 'Value',
        style: { padding: 0 },
        Cell: ({ row }) => {
          return (
            <FormikInput name={`${row.index}.value`} style={tableInputStyle} />
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
    [addHandler, deleteHandler],
  );

  return (
    <Formik
      innerRef={formRef}
      initialValues={metaInfo}
      validationSchema={metaInfoValidationSchema}
      onSubmit={saveHandler}
    >
      {({ values, submitForm, isValid }) => (
        <>
          <DialogBody
            css={css`
              background-color: white;
            `}
          >
            <div css={tablePanelStyle} style={{ height: 'calc(100% - 30px)' }}>
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

              <ReactTable
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
            </div>
          </DialogBody>
          <DialogFooter>
            <Button
              intent="success"
              onClick={submitForm}
              tooltipProps={{ content: '', disabled: true }}
              disabled={!isValid}
            >
              Save meta
            </Button>
          </DialogFooter>
        </>
      )}
    </Formik>
  );
}
