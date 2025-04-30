import styled from '@emotion/styled';
import { useCallback, useEffect, useState } from 'react';
import { MF } from 'react-mf';
import { MolfileSvgRenderer } from 'react-ocl';

import type { StateMoleculeExtended } from '../../data/molecules/Molecule.js';

import { NextPrev } from './NextPrev.js';

const BarContainer = styled.div`
  display: flex;
  flex-direction: row;
  border-top: 0.55px solid rgb(240 240 240);
  border-bottom: 0.55px solid rgb(240 240 240);
  padding: 0 5px;

  p {
    margin: 0;
    text-align: right;
    width: 100%;
    line-height: 22px;
    padding: 0 10px;
  }
`;

const MoleculeContainer = styled.div`
  width: 100%;
  position: relative;

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
`;

const SliderContent = styled.div`
  height: 180px;
  width: 100%;
  padding: 0;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;

  p {
    width: 100%;
    margin: 0 auto;
    display: block;
    position: relative;
    text-align: center;
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
            `${+(currentIndex + 1)} / ${molecules.length}`}{' '}
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
