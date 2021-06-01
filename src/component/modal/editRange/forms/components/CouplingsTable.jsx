/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { memo, useEffect, useCallback } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

import { Multiplets } from '../../../../../data/constants/Multiplets';
import Button from '../../../../elements/Button';
import Input from '../../../../elements/formik/Input';
import SelectBox from '../../../../elements/formik/SelectBox';
import {
  hasCouplingConstant,
  translateMultiplet,
} from '../../../../panels/extra/utilities/MultiplicityUtilities';

const CouplingsTableStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  height: 100%;
  font-size: 12px;

  th,
  td {
    text-align: center;
    margin: 0;
    padding: 0.4rem;
    border-bottom: 1px solid #dedede;
    border-right: 1px solid #dedede;

    button {
      background-color: transparent;
      border: none;
    }

    .add-button {
      color: blue;
      width: 100%;
      height: 100%;
      display: flex;
      align-items: center;
      justify-content: center;
    }

    .delete-button {
      border-radius: 25%;
      padding: 0;
      padding-left: 0.3rem;
      padding-right: 0.3rem;
    }
    .delete-button:hover {
      .icon {
        color: red;
      }
    }

    input {
      background-color: transparent;
      border: 0.5px solid #dedede;
      height: 100%;
      width: 100%;
      text-align: center;
    }
    .selectBox {
      background-color: transparent;
      border: 0.5px solid #dedede;
      height: 100%;
      width: 100%;
      text-align: center;
    }
  }

  tr {
    :last-child {
      background-color: #fcfcfc;
    }
  }
`;

const errorStyle = {
  border: '1px solid red',
};

function CouplingsTable({ push, remove, onFocus, onBlur }) {
  const { values, setFieldValue, errors } = useFormikContext();

  useEffect(() => {
    if (values.signals[values.activeTab]) {
      values.signals[values.activeTab].j.forEach((_coupling, i) => {
        if (!hasCouplingConstant(_coupling.multiplicity)) {
          setFieldValue(`signals.${values.activeTab}.j.${i}.coupling`, '');
        }
      });
    }
  }, [setFieldValue, values.activeTab, values.signals]);

  const hasMissingCouplingValue = useCallback(
    (i) =>
      lodashGet(
        errors,
        `signals[${values.activeTab}].missingCouplings`,
        [],
      ).some((_error) => _error.index === i),
    [errors, values.activeTab],
  );

  return (
    <table css={CouplingsTableStyle}>
      <tbody>
        <tr>
          <th>#</th>
          <th>Multiplicity</th>
          <th>J (Hz)</th>
          <th>{''}</th>
        </tr>
        {lodashGet(values, `signals[${values.activeTab}].j`, []).map(
          (_coupling, i) => (
            <tr
              // eslint-disable-next-line react/no-array-index-key
              key={`editCouplings${values.activeTab}${i}`}
            >
              <td>{i + 1}</td>
              <td>
                <SelectBox
                  className="selectBox"
                  name={`signals.${values.activeTab}.j.${i}.multiplicity`}
                  values={Multiplets.map((_multiplet) => _multiplet.label)}
                />
              </td>
              <td>
                <Input
                  name={`signals.${values.activeTab}.j.${i}.coupling`}
                  type="number"
                  placeholder={'J (Hz)'}
                  disabled={!hasCouplingConstant(_coupling.multiplicity)}
                  onFocus={onFocus}
                  onBlur={onBlur}
                  style={hasMissingCouplingValue(i) ? errorStyle : null}
                />
              </td>
              <td>
                <Button
                  className="delete-button"
                  onClick={() => {
                    remove(i);
                  }}
                >
                  <FaRegTrashAlt className="icon" title="Delete coupling" />
                </Button>
              </td>
            </tr>
          ),
        )}
        <tr />
        <tr>
          <td colSpan={4}>
            <Button
              className="add-button"
              onClick={() =>
                push({
                  multiplicity: translateMultiplet('m'),
                  coupling: '',
                })
              }
            >
              <FaPlus title="Add new coupling" />
            </Button>
          </td>
        </tr>
      </tbody>
    </table>
  );
}

export default memo(CouplingsTable);
