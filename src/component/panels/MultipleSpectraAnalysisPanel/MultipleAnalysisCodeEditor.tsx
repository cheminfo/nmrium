/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import { memo, useEffect, useState } from 'react';

import Eval from '../../utility/Evaluate';

const initCode = `function run(data) {

  return JSON.stringify(data,undefined, 2);
  
}(args);
`;

interface MultipleAnalysisCodeEditorProps {
  data: any;
}

function MultipleAnalysisCodeEditor({ data }: MultipleAnalysisCodeEditorProps) {
  const { values, setFieldValue } = useFormikContext<any>();
  const [code, setCode] = useState(values.code ? values.code : initCode);
  const [result, setResult] = useState('');

  useEffect(() => {
    const evalResult = Eval(code, data);
    if (evalResult instanceof Error) {
      setResult(evalResult.message);
    } else {
      setFieldValue('code', code);
      setResult(evalResult);
    }
  }, [code, data, setFieldValue]);

  return (
    <div style={{ marginTop: '20px' }}>
      <textarea
        value={code}
        onChange={(event) => setCode(event.target.value)}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          padding: '1em',
          width: '90%',
          backgroundColor: '#fcfcfc',
          marginBottom: '10px',
          minHeight: '100px',
          overflow: 'auto',
          maxHeight: '200px',
        }}
      />
      <p style={{ marginBottom: '5px' }}>Result:</p>

      <textarea
        value={result}
        readOnly
        style={{
          border: '0.55px solid #f3f3f3',
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          padding: '1em',
          width: '90%',
          marginBottom: '10px',
          minHeight: '100px',
          overflow: 'auto',
          maxHeight: '200px',
        }}
      />
    </div>
  );
}

export default memo(MultipleAnalysisCodeEditor);
