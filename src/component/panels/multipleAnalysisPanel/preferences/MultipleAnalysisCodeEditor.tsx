import { memo, useEffect, useState } from 'react';
import { useFormContext, useWatch } from 'react-hook-form';

import evaluate from '../../../utility/Evaluate.js';

const initCode = `function run(data) {

  return JSON.stringify(data,undefined, 2);
  
}(args);
`;

interface MultipleAnalysisCodeEditorProps {
  data: any;
}

function MultipleAnalysisCodeEditor({ data }: MultipleAnalysisCodeEditorProps) {
  const { setValue } = useFormContext();
  const previousCode = useWatch({ name: 'code' });
  const [code, setCode] = useState(previousCode || initCode);
  const [result, setResult] = useState('');

  useEffect(() => {
    const evalResult = evaluate(code, data);
    if (evalResult instanceof Error) {
      // TODO: change this to not use an effect.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResult(evalResult.message);
    } else {
      setValue('code', code);
      setResult(evalResult);
    }
  }, [code, data, setValue]);

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
