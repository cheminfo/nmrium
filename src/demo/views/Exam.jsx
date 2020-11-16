/** @jsx jsx */
import { jsx, css } from '@emotion/react';
import { Molecule } from 'openchemlib/full';
import { useState, useEffect, useCallback } from 'react';
import { FaRegCopy, FaCheck } from 'react-icons/fa';
import { MF } from 'react-mf';
import { StructureEditor } from 'react-ocl/full';

import NMRDisplayer from '../../component/NMRDisplayer.jsx';
import { copyTextToClipboard } from '../../component/utility/Export.js';

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

const styles = css`
   {
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    margin-left: 30px;

    .mainContainer {
      display: flex;
      flex-direction: column;
      max-height: 100%;
      overflow: hidden;
    }
    .nmrContainer {
      height: 50%;
    }

    .bottomContainer {
      display: flex;
      height: 50%;
    }

    .bottomRightContainer {
      width: 50%;
      display: flex;
      height: 100%;
      flex-direction: column;
    }
    .mf {
      height: 20%;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: white;
      border: 1px dashed gray;
    }

    .result-container {
      display: flex;
      align-items: center;
      justify-content: center;
      height: 80%;
      position: relative;
    }

    .result {
      width: 50%;
      height: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 16px;
      font-weight: bold;
    }

    .copy-button {
      position: absolute;
      top: 10px;
      left: 10px;
      width: 50px;
      height: 40px;
      outline: none;
      border: none;
      background-color: white;
      border-radius: 10px;
    }
    .copy-button:hover {
      background-color: green;
      color: white;
    }
    .structure-editor {
      background-color: white;
      flex: 1;
    }
  }
`;

const CopyButton = ({ result }) => {
  const [isCopied, setCopyFlag] = useState(false);

  const saveToClipboardHandler = useCallback(() => {
    const success = copyTextToClipboard(result);
    setCopyFlag(success);
    setTimeout(() => {
      setCopyFlag(false);
    }, 1000);
  }, [result]);

  return (
    <button
      type="button"
      className="copy-button"
      onClick={saveToClipboardHandler}
    >
      {isCopied ? <FaCheck /> : <FaRegCopy />}
    </button>
  );
};

export default function Exam(props) {
  const [data, setData] = useState();
  const [result, setResult] = useState(null);
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

  return (
    <div css={styles}>
      <h5 className="title">
        Exam: Determine the unknown structure for the compound having the
        following NMR spectrum
      </h5>
      <p className="category">{title}</p>
      <div className="mainContainer">
        <div className="nmrContainer">
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
              },
            }}
          />
        </div>
        <div className="bottomContainer">
          <div className="structure-editor">
            <StructureEditor
              svgMenu={true}
              fragment={false}
              onChange={checkAnswer}
              initialMolfile={data && data.answer && data.answer.currentAnswer}
            />
          </div>
          <div className="bottomRightContainer">
            <div className="mf">
              <MF
                style={{ color: 'navy', fontSize: 30 }}
                mf={data && data.answer && data.answer.mf}
              />
            </div>
            <div className="result-container">
              <CopyButton result={result} />
              <div className="result">{result}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
