/** @jsx jsx */
import { jsx, css } from '@emotion/core';
import { useFormikContext } from 'formik';
import lodash from 'lodash';
import { Fragment, memo, useCallback, useMemo } from 'react';
import { FaPlus } from 'react-icons/fa';

import generateID from '../../../data/utilities/generateID';
import CloseButton from '../../elements/CloseButton';
import FormikInput from '../../elements/formik/FormikInput';

const styles = css`
  display: flex;
  flex-direction: column;

  .row {
    display: flex;
    flex-direction: row;
    align-items: center;
    margin-bottom: 5px;
  }

  .nucleus-label-col {
    min-width: 80px;
    display: flex;
    justify-content: center;
  }

  .nucleus-label-input {
    margin: 0px !important;
    width: 70px !important;
  }
  .add {
    background-color: transparent;
    border: 0;
    outline: none;
    color: green;
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
      value: '0.00',
    };
    const newNucleuses = [...nucleuses, newFormat];
    setFieldValue('formatting.nucleus', newNucleuses);
  }, [nucleuses, setFieldValue]);

  return (
    <Fragment>
      <p className="section-header">Formating according to Nucleus</p>
      <div css={styles}>
        {nucleuses &&
          nucleuses.map((nucleus, index) => {
            const num = index + 1;
            return (
              <div className="row" key={`${nucleus.key}`}>
                <span>{num} - </span>
                <div className="nucleus-label-col">
                  <FormikInput
                    name={`formatting.nucleus.${index}.name`}
                    className="nucleus-label-input"
                  />
                </div>
                <div>
                  <FormikInput
                    name={`formatting.nucleus.${index}.value`}
                    className="nucleus-format-input"
                  />
                </div>
                <div>
                  <CloseButton
                    onClick={() => deleteHandler(index)}
                    popupTitle={`remove ${nucleus.name}`}
                    popupPlacement="right"
                  />
                </div>
                {nucleuses.length === index + 1 && (
                  <button
                    className="add"
                    type="button"
                    onClick={addNewNucleusFormatHandler}
                  >
                    <FaPlus />
                  </button>
                )}
              </div>
            );
          })}
      </div>
    </Fragment>
  );
});

export default FormattingTabContent;
