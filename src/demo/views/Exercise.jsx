/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Molecule } from 'openchemlib/full';
import { useState, useEffect, useCallback } from 'react';
import { MF } from 'react-mf';
import { StructureEditor } from 'react-ocl/full';

import NMRDisplayer from '../../component/NMRDisplayer';

let answers = JSON.parse(localStorage.getItem('nmrium-exercises') || '{}');

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

const titleCss = css`
  text-transform: none;
  margin: 0;
  padding: 5px;
  background-color: white;
  font-size: 14px;
  color: #3e3e3e;

  p {
    font-size: 10px;
    margin: 0px;
  }
`;

const mainContainer = css`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
`;

const bottomContainer = css`
  display: flex;
  height: 50%;
`;

const bottomRightContainer = css`
  width: 50%;
  display: flex;
  height: 100%;
  flex-direction: column;
`;

const mfCss = css`
  height: 20%;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: white;
  border: 1px dashed gray;
`;

const resultContainer = css`
  display: flex;
  align-items: center;
  justify-content: center;
  height: 80%;
  position: relative;
`;

const structureEditorCss = css`
  background-color: white;
  flex: 1;
  overflow: auto;
`;

const showButtonCss = css`
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

const styles = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-left: 30px;
`;

export default function Exercise(props) {
  const [data, setData] = useState();
  const [resultFlag, setResultFlag] = useState(null);
  const [answerAreaVisible, showAnswerArea] = useState(false);
  const { file, title, baseURL } = props;

  const checkAnswer = useCallback(
    (response) => {
      if (data.answer) {
        const MolResponse = Molecule.fromMolfile(response);
        const idCodeResponse = MolResponse.getIDCode();
        answers[data.answer.idCode] = idCodeResponse;
        localStorage.setItem('nmrium-exercises', JSON.stringify(answers));
        if (data.answer.idCode === idCodeResponse) {
          // correct answer
          setResultFlag(true);
        } else {
          setResultFlag(false);
          // wrong answer
        }
      }
    },
    [data],
  );

  useEffect(() => {
    if (file) {
      loadData(file).then((d) => {
        const _d = JSON.parse(JSON.stringify(d).replace(/\.\/+?/g, baseURL));

        if (_d && _d.molecules && _d.molecules[0] && _d.molecules[0].molfile) {
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
      });
    } else {
      setData({});
    }
  }, [baseURL, file, props]);

  const showAnswerAreaHander = useCallback(() => {
    showAnswerArea((prev) => !prev);
  }, []);

  return (
    <div css={styles}>
      <p css={titleCss}>
        <strong>Exercises: </strong>Determine the unknown structure for the
        compound having the following NMR spectrum
        <p>{title}</p>
      </p>
      <div css={mainContainer}>
        <div
          style={{ height: answerAreaVisible ? '50%' : 'calc(100% - 25px)' }}
        >
          <NMRDisplayer
            data={data}
            preferences={{
              general: {
                disableMultipletAnalysis: true,
                hideSetSumFromMolecule: true,
              },
              panels: {
                hidePeaksPanel: true,
                hideInformationPanel: true,
                hideRangesPanel: true,
                hideStructuresPanel: true,
                hideFiltersPanel: true,
                hideZonesPanel: true,
                hideSummaryPanel: true,
                hideMultipleSpectraAnalysisPanel: true,
              },
            }}
          />
        </div>
        <button
          css={showButtonCss}
          type="button"
          onClick={showAnswerAreaHander}
        >
          {!answerAreaVisible ? 'Show answer area' : 'Hide answer area '}
        </button>

        <div
          css={bottomContainer}
          style={
            answerAreaVisible
              ? { height: '50%' }
              : { height: '0%', visibility: 'hidden' }
          }
        >
          <div css={structureEditorCss}>
            <StructureEditor
              svgMenu
              fragment={false}
              onChange={checkAnswer}
              initialMolfile={data && data.answer && data.answer.currentAnswer}
            />
          </div>
          <div css={bottomRightContainer}>
            <div css={mfCss}>
              <MF
                style={{ color: 'navy', fontSize: 30 }}
                mf={data && data.answer && data.answer.mf}
              />
            </div>
            <div css={resultContainer}>
              <div
                style={{
                  ...styles.result,
                  backgroundColor:
                    resultFlag == null ? 'white' : resultFlag ? 'green' : 'red',
                  color: resultFlag == null ? 'black' : 'white',
                  width: '80%',
                  height: '80%',
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                {resultFlag == null ? (
                  <p>Result</p>
                ) : resultFlag === true ? (
                  <p>Right Molecule</p>
                ) : (
                  <p>Wrong Molecule !!</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
