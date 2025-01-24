import styled from '@emotion/styled';
import { Molecule } from 'openchemlib/full';
import { useCallback, useEffect, useState } from 'react';
import type { CSSProperties } from 'react';
import { MF } from 'react-mf';
import { StructureEditor } from 'react-ocl/full';

import type { NMRiumData } from '../../component/main/index.js';
import { NMRium } from '../../component/main/index.js';

const answers = JSON.parse(localStorage.getItem('nmrium-exercises') || '{}');

async function loadData(file) {
  const response = await fetch(file);
  checkStatus(response);
  const data = await response.json();
  return data;
}

function checkStatus(response) {
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} - ${response.statusText}`);
  }
  return response;
}

const Title = styled.p`
  text-transform: none;
  margin: 0;
  padding: 5px;
  background-color: white;
  font-size: 14px;
  color: #3e3e3e;

  p {
    font-size: 10px;
    margin: 0;
  }
`;

const MainContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
`;

const BottomContainer = styled.div`
  display: flex;
  height: 50%;
`;

const BottomRightContainer = styled.div`
  width: 50%;
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const MFContainer = styled.div`
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px dashed gray;
`;

const ResultContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80%;
  position: relative;
`;

const InnerResultContainer = styled.div<
  Pick<CSSProperties, 'backgroundColor' | 'color'>
>`
  flex-direction: column;
  padding: 10px;
  margin-left: 30px;
  background-color: ${({ backgroundColor }) => backgroundColor};
  color: ${({ color }) => color};
  width: 80%;
  height: 80%;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const StructureEditorContainer = styled.div`
  background-color: white;
  flex: 1;
  overflow: auto;
`;

const ToggleButton = styled.button`
  outline: none;
  border: none;
  border-top: 0.55px solid #c1c1c1;
  border-bottom: 0.55px solid #c1c1c1;
  color: #00b707;
  font-weight: bold;
  font-size: 12px;
  padding: 5px;

  &:hover {
    color: white !important;
    background-color: #00b707;
  }
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-left: 30px;
`;

export interface ExerciceData extends NMRiumData {
  answer: {
    idCode: string;
    currentAnswer: string;
    mf: string;
  };
}

export default function Exercise(props) {
  const [data, setData] = useState<ExerciceData | undefined>();
  const [resultFlag, setResultFlag] = useState<boolean | null>(null);
  const [answerAreaVisible, showAnswerArea] = useState(false);
  const { file, title, baseURL } = props;

  const checkAnswer = useCallback(
    (response) => {
      if (!data?.answer) return;

      const MolResponse = Molecule.fromMolfile(response);
      const idCodeResponse = MolResponse.getIDCode();
      answers[data.answer.idCode] = idCodeResponse;

      localStorage.setItem('nmrium-exercises', JSON.stringify(answers));
      setResultFlag(data.answer.idCode === idCodeResponse);
    },
    [data],
  );

  useEffect(() => {
    if (!file) return;

    let canceled = false;
    loadData(file)
      .then((d) => {
        if (canceled) return;

        const _d = JSON.parse(JSON.stringify(d).replaceAll(/\.\/+?/g, baseURL));

        if (_d?.molecules?.[0]?.molfile) {
          const molecule = Molecule.fromMolfile(_d.molecules[0].molfile);
          const idCode = molecule.getIDCode();
          let currentAnswer = answers[idCode];

          if (currentAnswer) {
            currentAnswer = Molecule.fromIDCode(currentAnswer).toMolfile();
          }
          _d.answer = {
            idCode,
            currentAnswer,
            mf: molecule.getMolecularFormula().formula,
          };
          setData(_d);
        }
      })
      // eslint-disable-next-line @typescript-eslint/use-unknown-in-catch-callback-variable
      .catch(reportError);

    return () => {
      canceled = true;
    };
  }, [baseURL, file, props]);

  const showAnswerAreaHandler = useCallback(() => {
    showAnswerArea((prev) => !prev);
  }, []);

  return (
    <Container>
      <Title>
        <strong>Exercises: </strong>Determine the unknown structure for the
        compound having the following NMR spectrum
        <p>{title}</p>
      </Title>
      <MainContainer>
        <div
          style={{ height: answerAreaVisible ? '50%' : 'calc(100% - 25px)' }}
        >
          <NMRium data={data} workspace="exercise" />
        </div>
        <ToggleButton type="button" onClick={showAnswerAreaHandler}>
          {!answerAreaVisible ? 'Show answer area' : 'Hide answer area '}
        </ToggleButton>

        <BottomContainer
          style={
            answerAreaVisible
              ? { height: '50%' }
              : { height: '0%', visibility: 'hidden' }
          }
        >
          <StructureEditorContainer>
            <StructureEditor
              svgMenu
              fragment={false}
              onChange={checkAnswer}
              initialMolfile={data?.answer?.currentAnswer}
            />
          </StructureEditorContainer>
          <BottomRightContainer>
            <MFContainer>
              {data?.answer?.mf && (
                <MF
                  style={{ color: 'navy', fontSize: 30 }}
                  mf={data.answer.mf}
                />
              )}
            </MFContainer>
            <ResultContainer>
              <InnerResultContainer
                backgroundColor={
                  resultFlag == null ? 'white' : resultFlag ? 'green' : 'red'
                }
                color={resultFlag == null ? 'black' : 'white'}
              >
                {resultFlag == null ? (
                  <p>Result</p>
                ) : resultFlag ? (
                  <p>Right Molecule</p>
                ) : (
                  <p>Wrong Molecule !!</p>
                )}
              </InnerResultContainer>
            </ResultContainer>
          </BottomRightContainer>
        </BottomContainer>
      </MainContainer>
    </Container>
  );
}
