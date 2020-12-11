/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import lodash from 'lodash';
import { Fragment, memo, useCallback, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';

import generateID from '../../../data/utilities/generateID';
import CloseButton from '../../elements/CloseButton';
import FormikInput from '../../elements/formik/FormikInput';

const styles = css`
  .counter-col {
    width: 30px;
  }
  .nucleus-label-col {
    display: flex;
    justify-content: center;
    width: 80px;
  }

  .width-100 {
    width: 100% !important;
    margin: 0px !important;
  }

  .nucleus-format-input-col {
    text-align: center;
    width: 100px;
  }

  th {
    font-size: 11px;
    font-weight: 600;
  }
  .operation-container {
    display: flex;
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
const FormattingTabContent = memo(() => {
  const { values, setFieldValue } = useFormikContext();
  const nucleuses = useMemo(
    () => lodash.cloneDeep(lodash.get(values, 'formatting.nucleus', [])),
    [values],
  );

  const deleteHandler = useCallback(
    (index) => {
      const nucleusesObject = nucleuses.splice(0, index);
      setFieldValue('formatting.nucleus', nucleusesObject);
    },
    [nucleuses, setFieldValue],
  );

  const addNewNucleusFormatHandler = useCallback(() => {
    const newFormat = {
      key: generateID(),
      name: '',
      ppm: '0.00',
      hz: '0.00',
    };
    const newNucleuses = [...nucleuses, newFormat];
    setFieldValue('formatting.nucleus', newNucleuses);
  }, [nucleuses, setFieldValue]);

  return (
    <Fragment>
      <p className="section-header">Formating according to Nucleus</p>
      <div css={styles}>
        <table>
          <thead>
            <tr>
              <th className="counter-col">#</th>
              <th className="nucleus-label-col">Nucleus </th>
              <th className="nucleus-format-input-col">δ (ppm)</th>
              <th className="nucleus-format-input-col">Coupling (Hz)</th>
              <th className="nucleus-format-input-col" />
            </tr>
          </thead>
          <tbody>
            {nucleuses &&
              nucleuses.map((nucleus, index) => {
                const num = index + 1;
                return (
                  <tr key={`${nucleus.key}`}>
                    <td className="counter-col">
                      <span>{num} - </span>{' '}
                    </td>
                    <td className="nucleus-label-col">
                      <FormikInput
                        name={`formatting.nucleus.${index}.name`}
                        className="width-100"
                      />
                    </td>
                    <td className="nucleus-format-input-col">
                      <FormikInput
                        name={`formatting.nucleus.${index}.ppm`}
                        className="width-100"
                      />
                    </td>
                    <td className="nucleus-format-input-col">
                      <FormikInput
                        name={`formatting.nucleus.${index}.hz`}
                        className="width-100"
                      />
                    </td>
                    <td className="operation-container">
                      <CloseButton
                        onClick={() => deleteHandler(index)}
                        popupTitle={`remove ${nucleus.name}`}
                        popupPlacement="right"
                      />
                      {nucleuses.length === index + 1 && (
                        <button
                          className="add"
                          type="button"
                          onClick={addNewNucleusFormatHandler}
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
      </div>
    </Fragment>
  );
});

export default FormattingTabContent;
