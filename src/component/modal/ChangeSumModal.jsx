import { jsx, css } from '@emotion/core';
import { useRef, useCallback, useState, useEffect, useMemo } from 'react';
/** @jsx jsx */
import Slider from 'react-animated-slider-2';
import { FaTimes } from 'react-icons/fa';
import MF from 'react-mf/lib/components/MF';
import { MolfileSvgRenderer } from 'react-ocl';

const styles = css`
  display: flex;
  flex-direction: column;
  width: 450px;
  padding: 5px;
  button:focus {
    outline: none;
  }
  .header {
    height: 24px;
    border-bottom: 1px solid #f0f0f0;
    display: flex;
    span {
      color: #464646;
      font-size: 15px;
      flex: 1;
    }

    button {
      background-color: transparent;
      border: none;
      svg {
        height: 16px;
      }
    }
  }
  .container {
    display: flex;
    margin: 30px 5px;
    input,
    button {
      padding: 5px;
      border: 1px solid gray;
      border-radius: 5px;
      height: 36px;
      margin: 2px;
    }
    input {
      flex: 10;
    }
    button {
      flex: 2;
      color: white;
      background-color: gray;
    }
  }

  .or {
    margin-top: 5px;
    margin-bottom: 5px;
    text-align: center;
    width: 100%;
    // padding: 0px 10px;
  }
  .or2 {
    margin-top: 5px;
    margin-bottom: 25px;
    text-align: center;
    width: 100%;
    // padding: 0px 10px;
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
    color: white;
    background-color: gray;
    margin: auto;
    width: 50%;
    padding: 5px;
    border: 1px solid gray;
    border-radius: 5px;
    height: 36px;
    margin: 0 auto;
    display: block;
  }
`;

const panelContainerStyle = css`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
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

const ChangeSumModal = ({
  onSave,
  onClose,
  currentSum,
  molecules,
  element,
}) => {
  const valueRef = useRef();

  const [currentIndex, setCurrentIndex] = useState();

  const saveInputValueHandler = useCallback(
    (e) => {
      e.preventDefault();
      onSave(valueRef.current.value);
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
    <div css={styles}>
      <div className="header">
        <span>{`Set new range sum (current: ${currentSum})`}</span>
        <button onClick={onClose} type="button">
          <FaTimes />
        </button>
      </div>
      <div className="container">
        <input ref={valueRef} type="number" placeholder="Enter the new value" />
        <button type="button" onClick={saveInputValueHandler}>
          Set
        </button>
      </div>
      <p className="or">OR</p>
      <p className="or2">Select a molecule as reference:</p>

      {element && molecules && molecules.length > 0 ? (
        <div css={panelContainerStyle}>
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
              Select as Reference ({element}: {newSum})
            </button>
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
