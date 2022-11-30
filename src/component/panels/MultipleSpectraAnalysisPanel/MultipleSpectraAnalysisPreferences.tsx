import { Formik } from 'formik';
import {
  forwardRef,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { FaPlus, FaTimes } from 'react-icons/fa';
import * as Yup from 'yup';

import { COLUMNS_TYPES } from '../../../data/data1d/MultipleAnalysis';
import { useDispatch } from '../../context/DispatchContext';
import { usePreferences } from '../../context/PreferencesContext';
import Button from '../../elements/Button';
import { GroupPane } from '../../elements/GroupPane';
import Label from '../../elements/Label';
import ReactTable, { Column } from '../../elements/ReactTable/ReactTable';
import FormikCheckBox from '../../elements/formik/FormikCheckBox';
import FormikInput from '../../elements/formik/FormikInput';
import { usePanelPreferences } from '../../hooks/usePanelPreferences';
import {
  DELETE_ANALYZE_SPECTRA_RANGE,
  SET_ANALYZE_SPECTRA_COLUMNS,
} from '../../reducer/types/Types';
import { PreferencesContainer } from '../extra/preferences/PreferencesContainer';

import MultipleAnalysisCodeEditor from './MultipleAnalysisCodeEditor';

const inputStyle = { input: { width: '100%', fontSize: '1.15em' } };

// TODO: remove this hacky use of ref.
function MultipleSpectraAnalysisPreferences({ data, onAfterSave }, ref: any) {
  const dispatch = useDispatch();
  const refForm = useRef<any>();
  const [columns, setColumns] = useState({});
  const panelPreferences = usePanelPreferences('multipleSpectraAnalysis');
  const preferences = usePreferences();
  useImperativeHandle(ref, () => ({
    saveSetting() {
      refForm.current.submitForm();
    },
  }));

  useEffect(() => {
    const result = Object.fromEntries(
      Object.keys(data.columns).map((key) => [
        key,
        { ...data.columns[key], tempKey: key },
      ]),
    );
    setColumns(result);
    refForm.current.setValues({ columns: result, code: data.code });
  }, [data]);

  const columnsKeys = Object.keys(columns);

  const preferencesSchema = Yup.object().shape({
    columns: Yup.lazy((data) => {
      return Yup.object().shape(columnSchema(columnsKeys, data));
    }),
  });

  function submitHandler(values) {
    onAfterSave?.(true);
    const result: any = {};
    for (const [key, value] of Object.entries(values.columns)) {
      result[key] = { ...columns[key], ...(value as any) };
    }

    preferences.dispatch({
      type: 'SET_PANELS_PREFERENCES',
      payload: { key: 'multipleSpectraAnalysis', value: values.preferences },
    });
    dispatch({
      type: SET_ANALYZE_SPECTRA_COLUMNS,
      payload: { code: values.code, columns: result },
    });
  }

  function addNewColumn(index) {
    setColumns({
      ...columns,
      [`temp${index}`]: {
        tempKey: '',
        type: 'FORMULA',
        valueKey: 'value',
        formula: '',
        index,
      },
    });
  }

  function handleDelete(colKey) {
    dispatch({
      type: DELETE_ANALYZE_SPECTRA_RANGE,
      colKey,
    });
  }

  const COLUMNS: Column<any>[] = [
    {
      Header: '#',
      accessor: (_, index) => index + 1,
    },
    {
      Header: 'Label',
      Cell: ({ row }) => (
        <FormikInput
          name={`columns.${row.original}.tempKey`}
          style={inputStyle}
        />
      ),
    },
    {
      Header: 'Value',
      Cell: ({ row }) => {
        const isFormulaColumn =
          columns[row.original].type === COLUMNS_TYPES.FORMULA;
        return (
          <FormikInput
            disabled={!isFormulaColumn}
            name={`columns.${row.original}.formula`}
            style={inputStyle}
          />
        );
      },
    },
    {
      Header: '',
      style: { width: '50px' },
      id: 'add-button',
      Cell: ({ data, row }) => {
        const columnKey = row.original;
        return (
          <div style={{ display: 'flex' }}>
            <Button.Danger
              fill="outline"
              onClick={() => handleDelete(columnKey)}
            >
              <FaTimes />
            </Button.Danger>
            {data.length === row.index + 1 && (
              <Button.Done
                fill="outline"
                onClick={() => addNewColumn(row.index + 1)}
              >
                <FaPlus />
              </Button.Done>
            )}
          </div>
        );
      },
    },
  ];

  return (
    <PreferencesContainer style={{ backgroundColor: 'white' }}>
      <Formik
        innerRef={refForm}
        key={JSON.stringify(columns)}
        initialValues={{ columns, code: null, preferences: panelPreferences }}
        validationSchema={preferencesSchema}
        onSubmit={submitHandler}
      >
        <>
          <GroupPane
            text="General"
            style={{ header: { color: 'black' }, container: { padding: '5px' } }}
          >
            <Label
              title="Enable resort spectra"
              htmlFor="preferences.resortSpectra"
            >
              <FormikCheckBox name="preferences.resortSpectra" />
            </Label>
          </GroupPane>
          <GroupPane
            text="Columns Settings "
            style={{ header: { color: 'black' }, container: { padding: '5px' } }}
          >
            <ReactTable columns={COLUMNS} data={columnsKeys} />
          </GroupPane>
          <GroupPane
            text="Execute code "
            style={{ header: { color: 'black' }, container: { padding: '5px' } }}
          >
            <MultipleAnalysisCodeEditor data={data} />
          </GroupPane>
        </>
      </Formik>
    </PreferencesContainer>
  );
}

function columnSchema(columnsKeys, data) {
  return Object.fromEntries(
    columnsKeys.map((key) => [
      key,
      Yup.object().shape({
        tempKey: Yup.string()
          .required()
          .test('unique', 'must be unique column name', (columnName) => {
            const cols: Array<string | undefined> = [];
            for (const colKey of Object.keys(data)) {
              if (data[colKey].tempKey === columnName) {
                cols.push(columnName);
              }
            }
            return cols.length === 1;
          }),
        ...(data[key]?.type === COLUMNS_TYPES.FORMULA
          ? { formula: Yup.string().required() }
          : {}),
        index: Yup.string().required(),
      }),
    ]),
  );
}

export default forwardRef(MultipleSpectraAnalysisPreferences);
