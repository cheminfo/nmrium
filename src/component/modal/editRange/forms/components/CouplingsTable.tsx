/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { useFormikContext } from 'formik';
import lodashGet from 'lodash/get';
import { translateMultiplet } from 'nmr-processing';
import { memo, useCallback } from 'react';
import { FaPlus, FaRegTrashAlt } from 'react-icons/fa';

import { Multiplets } from '../../../../../data/constants/Multiplets';
import Button from '../../../../elements/Button';
import FormikInput from '../../../../elements/formik/FormikInput';
import FormikSelect from '../../../../elements/formik/FormikSelect';
import { hasCouplingConstant } from '../../../../panels/extra/utilities/MultiplicityUtilities';

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
    padding: 0.3rem;
    border-bottom: 1px solid #f5f5f5;

    .select-box {
      background-color: transparent;
      border: 0.5px solid #dedede;
      height: 100%;
      width: 100% !important;
      text-align: center;
      margin: 0;
    }
  }
`;

interface CouplingsTableProps {
  push: (element: { multiplicity?: string; coupling: string }) => void;
  remove: (element: number) => void;
  onFocus: (element: any) => void;
  onBlur?: () => void;
}

function CouplingsTable({
  push,
  remove,
  onFocus,
  onBlur,
}: CouplingsTableProps) {
  const { values, setFieldValue } = useFormikContext<any>();

  const multiplicityChangeHandler = useCallback(
    (value, name) => {
      if (!hasCouplingConstant(value)) {
        void setFieldValue(name, '');
      }
    },
    [setFieldValue],
  );

  const couplingsList = lodashGet(
    values,
    `signals[${values.activeTab}].js`,
    [],
  );

  return (
    <div>
      <Button.Done
        fill="outline"
        style={{ overflow: 'auto' }}
        onClick={() =>
          push({
            multiplicity: translateMultiplet('m'),
            coupling: '',
          })
        }
      >
        <FaPlus title="Add new coupling" style={{ display: 'inline-block' }} />
        <span style={{ display: 'inline-block', paddingLeft: '5px' }}>
          Add New Coupling
        </span>
      </Button.Done>
      <div style={{ maxHeight: '300px', overflow: 'auto' }}>
        <table css={CouplingsTableStyle}>
          <thead>
            <tr>
              <th>#</th>
              <th>Multiplicity</th>
              <th>J (Hz)</th>
              <th>{''}</th>
            </tr>
          </thead>

          <tbody style={{ overflow: 'auto' }}>
            {couplingsList.map((_coupling, i) => (
              <tr
                // eslint-disable-next-line react/no-array-index-key
                key={`editCouplings${values.activeTab}${i}`}
              >
                <td>{i + 1}</td>
                <td>
                  <FormikSelect
                    className="select-box"
                    name={`signals.${values.activeTab}.js.${i}.multiplicity`}
                    items={Multiplets}
                    itemValueField="label"
                    onChange={(value) => {
                      multiplicityChangeHandler(
                        value,
                        `signals.${values.activeTab}.js.${i}.coupling`,
                      );
                    }}
                    style={{
                      height: '26px',
                    }}
                  />
                </td>
                <td>
                  <FormikInput
                    name={`signals.${values.activeTab}.js.${i}.coupling`}
                    type="number"
                    placeholder={'J (Hz)'}
                    disabled={!hasCouplingConstant(_coupling.multiplicity)}
                    onFocus={onFocus}
                    onBlur={onBlur}
                    style={{
                      input: {
                        width: '100%',
                        height: '26px',
                        padding: '0.25rem 0.5rem',
                      },
                    }}
                    checkErrorAfterInputTouched={false}
                  />
                </td>
                <td>
                  <div style={{ display: 'flex' }}>
                    <Button.Danger
                      fill="clear"
                      onClick={() => {
                        remove(i);
                      }}
                    >
                      <FaRegTrashAlt title="Delete coupling" />
                    </Button.Danger>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default memo(CouplingsTable);
