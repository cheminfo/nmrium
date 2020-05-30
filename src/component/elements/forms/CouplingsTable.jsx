/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useFormikContext } from 'formik';
import { memo, useCallback } from 'react';
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

const CouplingsTable = memo(
  ({
    push,
    remove,
    onAddCoupling,
    onDeleteCoupling,
    onEditCoupling,
    multiplets,
    checkMultiplicity,
  }) => {
    const {
      values,
      setFieldValue,
      getFieldMeta,
      setFieldTouched,
    } = useFormikContext();

    const metaDataNewCouplingCoupling = getFieldMeta('newCouplingCoupling');

    const checkDisableCouplingConfirmationButton = useCallback(
      (i) => {
        const metaDataSelectedSignalCouplingMultiplicity = getFieldMeta(
          `selectedSignalCouplings.${i}.multiplicity`,
        );
        console.log(metaDataSelectedSignalCouplingMultiplicity);
        const metaDataSelectedSignalCouplingCoupling = getFieldMeta(
          `selectedSignalCouplings.${i}.coupling`,
        );
        console.log(metaDataSelectedSignalCouplingCoupling);

        // true if input field was not touched, an error occurred, or current field state is same as initial state
        // return (
        //   (metaDataSelectedSignalCouplings !== undefined &&
        //     metaDataSelectedSignalCouplings.touched !== undefined &&
        //     metaDataSelectedSignalCouplings.touched[i] !== undefined &&
        //     metaDataSelectedSignalCouplings.touched[i] === false) ||
        //   (metaDataSelectedSignalCouplings !== undefined &&
        //     metaDataSelectedSignalCouplings.error !== undefined &&
        //     metaDataSelectedSignalCouplings.error[i] !== undefined &&
        //     metaDataSelectedSignalCouplings.error[i].coupling !== undefined) ||
        //   (metaDataSelectedSignalCouplings !== undefined &&
        //     metaDataSelectedSignalCouplings.initialValue !== undefined &&
        //     metaDataSelectedSignalCouplings.initialValue[i] !== undefined &&
        //     metaDataSelectedSignalCouplings.initialValue[i].coupling !==
        //       undefined &&
        //     values.selectedSignalCouplings !== undefined &&
        //     values.selectedSignalCouplings[i] !== undefined &&
        //     values.selectedSignalCouplings[i].coupling !== undefined &&
        //     values.selectedSignalCouplings[i].coupling ===
        //       metaDataSelectedSignalCouplings.initialValue[i].coupling)
        // );
        return false;
      },
      [getFieldMeta],
    );

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
                <tr
                  // eslint-disable-next-line react/no-array-index-key
                  key={`editCouplings${i}`}
                >
                  <td>{i + 1}</td>
                  <td>
                    <SelectBox
                      className="selectBox"
                      name={`selectedSignalCouplings.${i}.multiplicity`}
                      values={multiplets}
                    />
                  </td>
                  <td>
                    {checkMultiplicity(
                      values.selectedSignalCouplings[i].multiplicity,
                    ) ? (
                      <Input
                        name={`selectedSignalCouplings.${i}.coupling`}
                        type="number"
                      />
                    ) : null}
                  </td>
                  <td>
                    <Button
                      onClick={() => {
                        onEditCoupling(i, {
                          multiplicity:
                            values.selectedSignalCouplings[i].multiplicity,
                          coupling: values.selectedSignalCouplings[i].coupling,
                        });
                        setFieldTouched(
                          `selectedSignalCouplings.{i}.multiplicity`,
                          false,
                        );
                        j;
                      }}
                      disabled={checkDisableCouplingConfirmationButton(i)}
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
              {checkMultiplicity(values.newCouplingMultiplicity) ? (
                <Input
                  name="newCouplingCoupling"
                  type="number"
                  placeholder="J (Hz)"
                />
              ) : null}
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
                disabled={
                  metaDataNewCouplingCoupling &&
                  metaDataNewCouplingCoupling.error
                    ? true
                    : false
                }
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
