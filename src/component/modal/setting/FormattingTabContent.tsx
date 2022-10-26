/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { v4 } from '@lukeed/uuid';
import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { FaPlus, FaTimes } from 'react-icons/fa';

import Button from '../../elements/Button';
import { GroupPane } from '../../elements/GroupPane';
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

  .input {
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

function FormattingTabContent() {
  const { values, setFieldValue } = useFormikContext();

  const nuclei = lodashGet(values, 'formatting.nuclei', {});

  function deleteHandler(key: string) {
    let _nuclei = {};
    for (const nucleus in nuclei) {
      if (nucleus !== key) {
        _nuclei[nucleus] = nuclei[nucleus];
      }
    }
    setFieldValue('formatting.nuclei', _nuclei);
  }

  function addHandler() {
    const newFormat = {
      name: '',
      ppm: '0.00',
      hz: '0.00',
    };
    const key = v4();
    const newNuclei = { ...nuclei, [key]: newFormat };
    setFieldValue('formatting.nuclei', newNuclei);
  }

  const nucleiList = Object.keys(nuclei);

  return (
    <GroupPane text="Number formatting for crosshair and info line">
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
            {nucleiList?.map((key, index) => {
              const num = index + 1;
              return (
                <tr key={`${key}`}>
                  <td className="counter-col">
                    <span>{num} - </span>{' '}
                  </td>
                  <td className="nucleus-label-col">
                    <FormikInput
                      name={`formatting.nuclei.${key}.name`}
                      className="input"
                      checkErrorAfterInputTouched={false}
                    />
                  </td>
                  <td className="nucleus-format-input-col">
                    <FormikInput
                      name={`formatting.nuclei.${key}.ppm`}
                      className="input"
                    />
                  </td>
                  <td className="nucleus-format-input-col">
                    <FormikInput
                      name={`formatting.nuclei.${key}.hz`}
                      className="input"
                    />
                  </td>
                  <td className="operation-container">
                    <Button.Danger
                      style={{ fontSize: '14px' }}
                      fill="clear"
                      onClick={() => deleteHandler(key)}
                    >
                      <FaTimes />
                    </Button.Danger>
                    {nucleiList.length === index + 1 && (
                      <Button.Done
                        fill="clear"
                        style={{ fontSize: '14px' }}
                        onClick={addHandler}
                      >
                        <FaPlus />
                      </Button.Done>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </GroupPane>
  );
}

export default FormattingTabContent;
