import styled from '@emotion/styled';
import { Molecule } from 'openchemlib';
import { useCallback, useEffect, useState } from 'react';
import { FaCheck, FaRegCopy } from 'react-icons/fa';
import { MF } from 'react-mf';
import { CanvasMoleculeEditor } from 'react-ocl';

import { NMRium } from '../../component/main/index.js';
import { ClipboardFallbackModal } from '../../utils/clipboard/clipboardComponents.js';
import { useClipboard } from '../../utils/clipboard/clipboardHooks.js';

const answers = JSON.parse(localStorage.getItem('nmrium-exams') || '{}');

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

const BodyContainer = styled.div`
  display: flex;
  flex-direction: column;
  max-height: 100%;
  overflow: hidden;
`;

const NMRContainer = styled.div<{ isVisible: boolean }>`
  height: ${({ isVisible }) => (isVisible ? '50%' : 'calc(100% - 25px)')};
`;

const BottomContainer = styled.div<{ isVisible: boolean }>`
  display: flex;
  height: ${({ isVisible }) => (isVisible ? '50%' : '0%')};
  visibility: ${({ isVisible }) => (isVisible ? 'visible' : 'hidden')};
`;

const BottomRightContainer = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  width: 50%;
`;

const MFContainer = styled.div`
  align-items: center;
  background-color: white;
  border: 1px dashed gray;
  display: flex;
  height: 20%;
  justify-content: center;
`;

const ResultContainer = styled.div`
  position: relative;
  align-items: center;
  display: flex;
  height: 80%;
  justify-content: center;
`;

const InnerCopyButton = styled.button`
  position: absolute;
  top: 10px;
  left: 10px;
  align-items: center;
  background-color: white;
  border: none;
  border-radius: 10px;
  display: flex;
  height: 40px;
  justify-content: center;
  outline: none;
  width: 50px;

  :hover {
    background-color: green;
    color: white;
  }
`;

const StructureEditorContainer = styled.div`
  background-color: white;
  flex: 1;
  overflow: auto;
`;

const ToggleButton = styled.button`
  border: none;
  border-bottom: 0.55px solid #c1c1c1;
  border-top: 0.55px solid #c1c1c1;
  color: #00b707;
  font-size: 12px;
  font-weight: bold;
  outline: none;
  padding: 5px;

  :hover {
    background-color: #00b707;
    color: white !important;
  }
`;

const Title = styled.p`
  background-color: white;
  color: #3e3e3e;
  font-size: 14px;
  margin: 0;
  padding: 5px;
  text-transform: none;

  p {
    font-size: 10px;
    margin: 0;
  }
`;

const Result = styled.div`
  align-items: center;
  display: flex;
  font-size: 16px;
  font-weight: bold;
  height: 50%;
  justify-content: center;
  width: 50%;
`;

const Container = styled.div`
  display: flex;
  flex-direction: column;
  height: 100%;
  margin-left: 30px;
  padding: 10px;
`;

const CopyButton = ({ result }) => {
  const [isCopied, setCopyFlag] = useState(false);
  const { rawWriteWithType, shouldFallback, cleanShouldFallback, text } =
    useClipboard();

  const saveToClipboardHandler = useCallback(() => {
    void (async () => {
      await rawWriteWithType(result);
      setCopyFlag(true);
    })();
  }, [rawWriteWithType, result]);

  useEffect(() => {
    if (isCopied) return;

    const timeoutId = setTimeout(() => {
      setCopyFlag(false);
    }, 1000);

    return () => clearTimeout(timeoutId);
  }, [isCopied]);

  return (
    <>
      <InnerCopyButton type="button" onClick={saveToClipboardHandler}>
        {isCopied ? <FaCheck /> : <FaRegCopy />}
      </InnerCopyButton>
      <ClipboardFallbackModal
        mode={shouldFallback}
        onDismiss={cleanShouldFallback}
        text={text}
        label="SMILES"
      />
    </>
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
        const MolResponse = Molecule.fromMolfile(response.getMolfileV3());
        const idCodeResponse = MolResponse.getIDCode();
        answers[data.answer.idCode] = idCodeResponse;
        localStorage.setItem('nmrium-exams', JSON.stringify(answers));
        setResult(MolResponse.toIsomericSmiles());
      }
    },
    [data],
  );

  useEffect(() => {
    if (file) {
      void loadData(file).then((d) => {
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
      });
    } else {
      setData({});
    }
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
      <BodyContainer>
        <NMRContainer isVisible={answerAreaVisible}>
          <NMRium data={data} workspace="exercise" />
        </NMRContainer>
        <ToggleButton type="button" onClick={showAnswerAreaHandler}>
          {!answerAreaVisible ? 'Show answer area' : 'Hide answer area '}
        </ToggleButton>
        <BottomContainer isVisible={answerAreaVisible}>
          <StructureEditorContainer>
            <CanvasMoleculeEditor
              inputFormat="molfile"
              fragment={false}
              onChange={checkAnswer}
              inputValue={data?.answer?.currentAnswer}
              width={675}
              height={450}
            />
          </StructureEditorContainer>
          <BottomRightContainer>
            <MFContainer>
              <MF
                style={{ color: 'navy', fontSize: 30 }}
                mf={data?.answer?.mf}
              />
            </MFContainer>
            <ResultContainer>
              <CopyButton result={result} />
              <Result>{result}</Result>
            </ResultContainer>
          </BottomRightContainer>
        </BottomContainer>
      </BodyContainer>
    </Container>
  );
}
