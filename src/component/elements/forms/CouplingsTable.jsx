/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useFormikContext } from 'formik';
import { memo } from 'react';
import { FaMinus, FaCheck, FaPlus } from 'react-icons/fa';

import Button from './elements/Button';
import Input from './elements/Input';
import SelectBox from './elements/SelectBox';

const CouplingsTableStyle = css`
  border-spacing: 0;
  border: 1px solid #dedede;
  width: 100%;
  font-size: 12px;
  height: 100%;

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
      border-top: 3px solid #dedede;
    }
  }
`;

const multiplets = [
  'm',
  's',
  'd',
  't',
  'q',
  //   'quint',
  //   'hex',
  //   'hept',
  //   'oct',
  //   'non',
];

const CouplingsTable = memo(
  ({ push, remove, onAddCoupling, onDeleteCoupling, onEditCoupling }) => {
    const { values, setFieldValue } = useFormikContext();

    return (
      <table css={CouplingsTableStyle}>
        <tbody>
          <tr>
            <th>#</th>
            <th>Multiplicity</th>
            <th>J (Hz)</th>
            <th>{''}</th>
            <th>{''}</th>
          </tr>
          {values.selectedSignalCouplings &&
          values.selectedSignalCouplings.length > 0
            ? values.selectedSignalCouplings.map((_coupling, i) => (
                // eslint-disable-next-line react/no-array-index-key
                <tr key={`editCouplings${i}`}>
                  <td>{i + 1}</td>
                  <td>
                    <SelectBox
                      className="selectBox"
                      name={`selectedSignalCouplings.${i}.multiplicity`}
                      values={multiplets}
                    />
                  </td>
                  <td>
                    {!values.selectedSignalCouplings[i].multiplicity ||
                    values.selectedSignalCouplings[i].multiplicity.length ===
                      0 ||
                    values.selectedSignalCouplings[i].multiplicity === 'm' ||
                    values.selectedSignalCouplings[i].multiplicity ===
                      's' ? null : (
                      <Input
                        name={`selectedSignalCouplings.${i}.coupling`}
                        type="number"
                      />
                    )}
                  </td>
                  <td>
                    <Button
                      onClick={() =>
                        onEditCoupling(i, {
                          multiplicity:
                            values.selectedSignalCouplings[i].multiplicity,
                          coupling: values.selectedSignalCouplings[i].coupling,
                        })
                      }
                    >
                      <FaCheck title="Confirm Coupling Edition" />
                    </Button>
                  </td>
                  <td>
                    <Button
                      onClick={() => {
                        remove(i);
                        onDeleteCoupling(i, {
                          multiplicity:
                            values.selectedSignalCouplings[i].multiplicity,
                          coupling: values.selectedSignalCouplings[i].coupling,
                        });
                      }}
                    >
                      <FaMinus title="Delete Coupling" />
                    </Button>
                  </td>
                </tr>
              ))
            : null}
          <tr>
            <td colSpan={5}>
              {!values.selectedSignalCouplings ||
              values.selectedSignalCouplings.length === 0 ? (
                <p style={{ color: 'red' }}>
                  There must be at least one coupling!
                </p>
              ) : null}
            </td>
          </tr>
          <tr>
            <td>{''}</td>
            <td>
              <SelectBox
                className="selectBox"
                name="newCouplingMultiplicity"
                values={multiplets}
              />
            </td>
            <td>
              {!values.newCouplingMultiplicity ||
              values.newCouplingMultiplicity.length === 0 ||
              values.newCouplingMultiplicity === 'm' ||
              values.newCouplingMultiplicity === 's' ? null : (
                <Input
                  name="newCouplingCoupling"
                  type="number"
                  placeholder="J (Hz)"
                />
              )}
            </td>
            <td colSpan={2}>
              <Button
                onClick={() => {
                  const newCoupling = {
                    multiplicity: values.newCouplingMultiplicity,
                    coupling: values.newCouplingCoupling,
                  };
                  push(newCoupling);
                  onAddCoupling(newCoupling);
                  setFieldValue('newCouplingCoupling', '');
                }}
              >
                <FaPlus title="Add New Coupling" />
              </Button>
            </td>
          </tr>
        </tbody>
      </table>
    );
  },
);

export default CouplingsTable;
