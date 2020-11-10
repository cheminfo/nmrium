/** @jsx jsx */
import { jsx, css } from '@emotion/core';
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

import { useDispatch } from '../../context/DispatchContext';
import FormikForm from '../../elements/formik/FormikForm';
import FormikInput from '../../elements/formik/FormikInput';
import { SET_ANALYZE_SPECTRA_COLUMNS } from '../../reducer/types/Types';

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
    border: 0.55px solid rgb(237 237 237) !important;
    height: 25px !important;
    width: 100% !important;
    margin: 0 !important;
    // text-transform: uppercase;
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

const MultipleSpectraAnalysisPreferences = forwardRef(({ columns }, ref) => {
  const dispatch = useDispatch();
  const refForm = useRef();
  const [data, setData] = useState(columns);

  useImperativeHandle(ref, () => ({
    saveSetting() {
      refForm.current.submitForm();
    },
  }));

  const format = useCallback(() => (val) => val.toUpperCase(), []);

  useEffect(() => {
    const result = Object.keys(columns).reduce((acc, key) => {
      acc[key] = { ...columns[key], tempKey: key };
      return acc;
    }, {});
    setData(result);
  }, [columns]);

  useEffect(() => {
    refForm.current.setValues(data);
  }, [data]);

  const dataKeys = useMemo(() => {
    return Object.keys(data);
  }, [data]);

  const submitHandler = useCallback(
    (values) => {
      const result = Object.entries(values).reduce((acc, [key, value]) => {
        acc[key] = { ...data[key], ...value };
        return acc;
      }, {});
      dispatch({
        type: SET_ANALYZE_SPECTRA_COLUMNS,
        payload: result,
      });
    },
    [data, dispatch],
  );

  const addNewColumn = useCallback((index) => {
    setData((prevData) => {
      return {
        ...prevData,
        [`temp${index}`]: {
          tempKey: '',
          type: 'FORMULA',
          valueKey: 'value',
          formula: ' ',
          index: index,
        },
      };
    });
  }, []);

  return (
    <FormikForm ref={refForm} initialValues={data} onSubmit={submitHandler}>
      <table css={styles}>
        <thead>
          <th className="counter">#</th>
          <th className="label">Label</th>
          <th>value</th>
          <th className="index">index</th>
        </thead>
        <tbody>
          {dataKeys.map((key, index) => {
            return (
              <tr key={key}>
                <td className="counter">{index + 1}</td>
                <td className="label">
                  <FormikInput
                    key={key}
                    name={`${key}.tempKey`}
                    value={data[key].tempKey}
                    format={format}
                  />
                </td>
                <td>
                  {data[key].formula ? (
                    <FormikInput
                      name={`${key}.formula`}
                      value={data[key].formula}
                    />
                  ) : (
                    <div className="input disbale" />
                  )}
                </td>
                <td className="index">
                  <FormikInput name={`${key}.index`} value={data[key].index} />
                </td>
                <td className="operation-col">
                  {dataKeys.length === index + 1 && (
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
    </FormikForm>
  );
});
export default MultipleSpectraAnalysisPreferences;
