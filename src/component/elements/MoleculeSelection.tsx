import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { MF } from 'react-mf';
import { MolfileSvgRenderer } from 'react-ocl';

import type { StateMoleculeExtended } from '../../data/molecules/Molecule.js';

import { NextPrev } from './NextPrev.js';

const BarContainer = styled.div`
  border-bottom: 0.55px solid rgb(240 240 240);
  border-top: 0.55px solid rgb(240 240 240);
  display: flex;
  flex-direction: row;
  padding: 0 5px;

  p {
    line-height: 22px;
    margin: 0;
    padding: 0 10px;
    text-align: right;
    width: 100%;
  }
`;

const MoleculeContainer = styled.div`
  position: relative;
  width: 100%;

  button {
    background-color: gray;
    border: 1px solid gray;
    border-radius: 5px;
    color: white;
    display: block;
    flex: 2;
    height: 36px;
    margin: 0 auto;
    margin-top: 15px;
    padding: 5px;
    width: 20%;
  }
`;

const SliderContent = styled.div`
  align-items: center;
  display: flex;
  flex-direction: column;
  height: 180px;
  justify-content: center;
  padding: 0;
  width: 100%;

  p {
    position: relative;
    display: block;
    margin: 0 auto;
    text-align: center;
    width: 100%;
  }

  svg polygon {
    fill: gray !important;
  }
`;

interface MoleculeSelectionProps {
  molecules: StateMoleculeExtended[];
  onChange: (element: number) => void;
  index?: number;
}

export default function MoleculeSelection(props: MoleculeSelectionProps) {
  const { molecules, onChange = () => null, index } = props;
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  useEffect(() => {
    const _index = index && index < molecules.length ? index : 0;
    if (molecules && molecules.length > 0) {
      setCurrentIndex(_index);
    }
  }, [index, molecules]);

  const onChangeHandler = useCallback(
    (slideIndex) => {
      setCurrentIndex(slideIndex);
      onChange(slideIndex);
    },
    [onChange],
  );

  return (
    <div>
      <BarContainer>
        <p>
          {molecules &&
            molecules.length > 0 &&
            `${currentIndex + 1} / ${molecules.length}`}{' '}
        </p>
      </BarContainer>
      <MoleculeContainer>
        <NextPrev index={currentIndex} onChange={onChangeHandler}>
          {molecules?.map((mol, index) => (
            <SliderContent key={mol.id}>
              <div>
                {mol.molfile && (
                  <MolfileSvgRenderer
                    id={`molSVG${index}`}
                    width={120}
                    molfile={mol.molfile}
                  />
                )}
              </div>
              <p>
                <MF mf={mol.mf} /> - {mol.mw?.toFixed(2)}
              </p>
            </SliderContent>
          ))}
        </NextPrev>
      </MoleculeContainer>
    </div>
  );
}
