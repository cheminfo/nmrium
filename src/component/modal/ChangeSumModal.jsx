import { jsx, css } from '@emotion/core';
import { useCallback, useState, useEffect, useMemo } from 'react';
/** @jsx jsx */
import Slider from 'react-animated-slider-2';
import MF from 'react-mf/lib/components/MF';
import { MolfileSvgRenderer } from 'react-ocl';

import NumberInputModal from './NumberInputModal';

const modalContainer = css`
  display: flex;
  flex-direction: column;
  padding: 5px;
`;

const selectMoleculeContainerStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
`;

const optionalTextStyle = css`
  display: flex;
  flex-direction: column;
  padding: 5px;

  .optional {
    margin-top: 5px;
    margin-bottom: 5px;
    padding: 0px 10px;

    text-align: center;
    font-size: 18px;
    font-weight: bold;
  }
  .optional2 {
    margin-top: 5px;
    margin-bottom: 25px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }
`;

const toolbarStyle = css`
  display: flex;
  flex-direction: row;
  border-top: 0.55px solid rgb(240, 240, 240);
  border-bottom: 0.55px solid rgb(240, 240, 240);
  padding: 0px 5px;

  p {
    margin: 0;
    text-align: right;
    width: 100%;
    line-height: 22px;
    padding: 0px 10px;
  }
`;

const moleculeContainerStyle = css`
  .slider {
    height: 180px;
    padding: 0px;
  }
  .slider p {
    width: 100%;
    margin: 0 auto;
    display: block;
    position: relative;
  }
  .slider svg polygon {
    fill: gray !important;
  }
  button {
    flex: 2;
    padding: 5px;
    border: 1px solid gray;
    border-radius: 5px;
    height: 36px;
    margin: 0 auto;
    margin-top: 15px;
    display: block;
    width: 20%;

    color: white;
    background-color: gray;
  }

  .newSumText {
    margin-top: 15px;
    // margin-bottom: 25px;
    padding: 0px 10px;
    width: 100%;

    text-align: center;
  }
`;

const ChangeSumModal = ({ onSave, onClose, header, molecules, element }) => {
  const [currentIndex, setCurrentIndex] = useState();

  const saveInputValueHandler = useCallback(
    (inputValue) => {
      onSave(inputValue);
    },
    [onSave],
  );

  const newSum = useMemo(() => {
    return element &&
      molecules &&
      molecules.length > 0 &&
      currentIndex !== undefined &&
      molecules[currentIndex].atoms[element]
      ? molecules[currentIndex].atoms[element]
      : 0;
  }, [currentIndex, element, molecules]);

  useEffect(() => {
    if (molecules && molecules.length > 0) {
      setCurrentIndex(0);
    }
  }, [molecules]);

  const saveSelectMoleculeHandler = useCallback(
    (e) => {
      e.preventDefault();
      onSave(newSum);
    },
    [newSum, onSave],
  );

  return (
    <div css={modalContainer}>
      <NumberInputModal
        onSave={saveInputValueHandler}
        onClose={onClose}
        header={header}
      />

      {element && molecules && molecules.length > 0 ? (
        <div css={selectMoleculeContainerStyle}>
          <div css={optionalTextStyle}>
            <p className="optional">OR</p>
            <p className="optional2">Select a molecule as reference!</p>
          </div>
          <div css={toolbarStyle}>
            <p>
              {molecules &&
                molecules.length > 0 &&
                `${+(currentIndex + 1)} / ${molecules.length}`}{' '}
            </p>
          </div>
          <div css={moleculeContainerStyle}>
            <Slider
              onSlideChange={(event) => setCurrentIndex(event.slideIndex)}
            >
              {molecules &&
                molecules.map((mol, index) => (
                  <div key={mol.key}>
                    <div>
                      <MolfileSvgRenderer
                        id={`molSVG${index}`}
                        width={120}
                        molfile={mol.molfile}
                      />
                    </div>
                    <p>
                      <MF mf={mol.mf} /> - {mol.mw.toFixed(2)}
                    </p>
                  </div>
                ))}
            </Slider>
            <button type="button" onClick={saveSelectMoleculeHandler}>
              Set
            </button>
            <p className="newSumText">
              New sum for {element} will be {newSum}!
            </p>
          </div>
        </div>
      ) : null}
    </div>
  );
};

ChangeSumModal.defaultProps = {
  onSave: () => {
    return null;
  },
  onClose: () => {
    return null;
  },
};
export default ChangeSumModal;
