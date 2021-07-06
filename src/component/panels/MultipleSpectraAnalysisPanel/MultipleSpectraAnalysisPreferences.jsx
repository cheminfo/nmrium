/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FaPlus } from 'react-icons/fa';
import * as Yup from 'yup';

import { COLUMNS_TYPES } from '../../../data/data1d/MulitpleAnalysis';
import { useDispatch } from '../../context/DispatchContext';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { SET_ANALYZE_SPECTRA_COLUMNS } from '../../reducer/types/Types';

import MulipleAnalysisCodeEditor from './MulipleAnalysisCodeEditor';

const styles = css`
  width: 100%;
  thead {
    border-bottom: 1px solid lightgray;
    background-color: #fafafa;
    font-size: 12px;
  }

  td,
  th {
    padding: 3px 5px;
    text-align: center;
  }

  .operation-col {
    width: 30px;
  }

  .input {
    height: 25px !important;
    width: 100% !important;
    margin: 0 !important;
  }

  .input.disbale {
    background-color: #e8e8e8;
    border-radius: 5px;
  }

  .label,
  .index {
    width: 100px;
  }

  .counter {
    width: 50px;
  }

  .add {
    background-color: transparent;
    border: 0;
    outline: none;
    svg {
      font-szie: 14px;
      fill: green;
    }
  }
`;

function MultipleSpectraAnalysisPreferences({ data, onAfterSave }, ref) {
  const dispatch = useDispatch();
  const refForm = useRef();
  const [columns, setColumns] = useState({});

  useImperativeHandle(ref, () => ({
    saveSetting() {
      refForm.current.submitForm();
    },
  }));

  useEffect(() => {
    const result = Object.keys(data.columns).reduce((acc, key) => {
      acc[key] = { ...data.columns[key], tempKey: key };
      return acc;
    }, {});
    setColumns(result);
    refForm.current.setValues({ columns: result, code: data.code });
  }, [data]);

  const columnsKeys = useMemo(() => {
    return Object.keys(columns);
  }, [columns]);

  const preferncesSchema = useMemo(() => {
    function columnSchema() {
      return columnsKeys.reduce((acc, key) => {
        acc[key] = Yup.object().shape({
          tempKey: Yup.string()
            .required()
            .test('unique', 'must be unique column name', (colmnName) => {
              const formData = refForm.current.values.columns;
              return (
                Object.keys(formData).reduce((acc, colKey) => {
                  if (formData[colKey].tempKey === colmnName) {
                    acc.push(colmnName);
                  }
                  return acc;
                }, []).length === 1
              );
            }),
          ...(columns[key].type === COLUMNS_TYPES.FORMULA
            ? { formula: Yup.string().required() }
            : {}),
          index: Yup.string().required(),
        });
        return acc;
      }, {});
    }

    return Yup.object().shape({
      columns: Yup.object().shape(columnSchema()),
    });
  }, [columns, columnsKeys, refForm]);

  const submitHandler = useCallback(
    (values) => {
      onAfterSave?.(true);
      const result = Object.entries(values.columns).reduce(
        (acc, [key, value]) => {
          acc[key] = { ...columns[key], ...value };
          return acc;
        },
        {},
      );
      dispatch({
        type: SET_ANALYZE_SPECTRA_COLUMNS,
        payload: { code: values.code, columns: result },
      });
    },
    [columns, dispatch, onAfterSave],
  );

  const addNewColumn = useCallback((index) => {
    setColumns((prevData) => {
      return {
        ...prevData,
        [`temp${index}`]: {
          tempKey: '',
          type: 'FORMULA',
          valueKey: 'value',
          formula: '',
          index: index,
        },
      };
    });
  }, []);

  return (
    <FormikForm
      ref={refForm}
      initialValues={{ columns, code: null }}
      validationSchema={preferncesSchema}
      onSubmit={submitHandler}
    >
      {columnsKeys && (
        <table css={styles}>
          <thead>
            <tr>
              <th className="counter">#</th>
              <th className="label">Label</th>
              <th>value</th>
              <th className="index">index</th>
            </tr>
          </thead>
          <tbody>
            {columnsKeys.map((key, index) => {
              return (
                <tr key={key}>
                  <td className="counter">{index + 1}</td>
                  <td className="label">
                    <FormikInput
                      key={key}
                      name={`columns.${key}.tempKey`}
                      value={columns[key].tempKey}
                    />
                  </td>
                  <td>
                    {columns[key].type === COLUMNS_TYPES.FORMULA ? (
                      <FormikInput
                        name={`columns.${key}.formula`}
                        value={columns[key].formula}
                      />
                    ) : (
                      <div className="input disbale" />
                    )}
                  </td>
                  <td className="index">
                    <FormikInput
                      name={`columns.${key}.index`}
                      value={columns[key].index}
                    />
                  </td>
                  <td className="operation-col">
                    {columnsKeys.length === index + 1 && (
                      <button
                        className="add"
                        type="button"
                        onClick={() => addNewColumn(index + 1)}
                      >
                        <FaPlus />
                      </button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      )}
      <MulipleAnalysisCodeEditor data={data} />
    </FormikForm>
  );
}

export default forwardRef(MultipleSpectraAnalysisPreferences);
