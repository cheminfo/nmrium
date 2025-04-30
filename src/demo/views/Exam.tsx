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

const InnerCopyButton = styled.button`
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

const Result = styled.div`
  width: 50%;
  height: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  font-weight: bold;
`;

const Container = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 10px;
  margin-left: 30px;
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
        setResult(MolResponse.toSmiles());
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
