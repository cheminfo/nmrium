/** @jsxImportSource @emotion/react */
import { css } from '@emotion/react';
import { Molecule } from 'openchemlib/full';
import { useState, useEffect, useCallback } from 'react';
import { FaRegCopy, FaCheck } from 'react-icons/fa';
import { MF } from 'react-mf';
import { StructureEditor } from 'react-ocl/full';

import NMRium from '../../component/NMRium';
import { copyTextToClipboard } from '../../component/utility/export';

let answers = JSON.parse(localStorage.getItem('nmrium-exams') || '{}');

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

const mainContainer = css`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
`;

const nmrContainer = css`
  height: 50%;
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

const copyButton = css`
  position: absolute;
  top: 10px;
  left: 10px;
  width: 50px;
  height: 40px;
  outline: none;
  border: none;
  background-color: white;
  border-radius: 10px;
  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: green;
    color: white;
  }
`;

const structureEditor = css`
  background-color: white;
  flex: 1;
  overflow: auto;
`;

const showButton = css`
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

const resultCss = css`
  width: 50%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
`;

const styles = css`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-left: 30px;
  }
`;

const CopyButton = ({ result }) => {
  const [isCopied, setCopyFlag] = useState(false);

  const saveToClipboardHandler = useCallback(() => {
    void (async () => {
      const success = await copyTextToClipboard(result);
      setCopyFlag(success);
      setTimeout(() => {
        setCopyFlag(false);
      }, 1000);
    })();
  }, [result]);

  return (
    <button type="button" css={copyButton} onClick={saveToClipboardHandler}>
      {isCopied ? <FaCheck /> : <FaRegCopy />}
    </button>
  );
};

export default function Exam(props) {
  const [data, setData] = useState<any>();
  const [result, setResult] = useState<string | null>(null);
  const [answerAreaVisible, showAnswerArea] = useState(false);

  const { file, title, baseURL } = props;

  const checkAnswer = useCallback(
    (response) => {
      if (data.answer) {
        const MolResponse = Molecule.fromMolfile(response);
        const idCodeResponse = MolResponse.getIDCode();
        answers[data.answer.idCode] = idCodeResponse;
        localStorage.setItem('nmrium-exams', JSON.stringify(answers));
        setResult(MolResponse.toSmiles());
      }
    },
    [data],
  );

  useEffect(() => {
    if (file) {
      void loadData(file).then((d) => {
        const _d = JSON.parse(JSON.stringify(d).replace(/\.\/+?/g, baseURL));

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
          css={nmrContainer}
          style={{ height: answerAreaVisible ? '50%' : 'calc(100% - 25px)' }}
        >
          <NMRium data={data} workspace="exercise" />
        </div>
        <button css={showButton} type="button" onClick={showAnswerAreaHander}>
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
          <div css={structureEditor}>
            <StructureEditor
              svgMenu
              fragment={false}
              onChange={checkAnswer}
              initialMolfile={data?.answer?.currentAnswer}
            />
          </div>
          <div css={bottomRightContainer}>
            <div css={mfCss}>
              <MF
                style={{ color: 'navy', fontSize: 30 }}
                mf={data?.answer?.mf}
              />
            </div>
            <div css={resultContainer}>
              <CopyButton result={result} />
              <div css={resultCss}>{result}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
