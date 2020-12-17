/** @jsxImportSource @emotion/react */
import { useFormikContext } from 'formik';
import { highlight, languages } from 'prismjs/components/prism-core';
// eslint-disable-next-line import/no-unassigned-import
import 'prismjs/components/prism-clike';
// eslint-disable-next-line import/no-unassigned-import
import 'prismjs/components/prism-javascript';
import { memo, useCallback, useEffect, useState } from 'react';
import Editor from 'react-simple-code-editor';

import prismStyles from '../../elements/styles/prism';
import Eval from '../../utility/Evaluate';

const initCode = `function run(data) {

  return JSON.stringify(data,undefined, 2);
  
}(args);
`;

const MulipleAnalysisCodeEditor = memo(({ data }) => {
  const { values, setFieldValue } = useFormikContext();
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

  const valueChangeHandler = useCallback((code) => {
    setCode(code);
  }, []);
  const highlightHandler = useCallback((code) => {
    try {
      return highlight(code, languages.js);
    } catch (e) {
      return null;
    }
  }, []);

  return (
    <div style={{ marginTop: '20px' }} css={prismStyles}>
      <Editor
        value={code}
        onValueChange={valueChangeHandler}
        highlight={highlightHandler}
        padding={10}
        style={{
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          backgroundColor: '#fcfcfc',
          marginBottom: '10px',
          minHeight: '100px',
          overflow: 'auto',
          maxHeight: '200px',
        }}
      />
      <p style={{ marginBottom: '5px' }}>Result:</p>

      <Editor
        value={result}
        onValueChange={(code) => code}
        highlight={highlightHandler}
        padding={10}
        style={{
          border: '0.55px solid #f3f3f3',
          fontFamily: '"Fira code", "Fira Mono", monospace',
          fontSize: 12,
          // backgroundColor: '#fcfcfc',
          marginBottom: '10px',
          minHeight: '100px',
          overflow: 'auto',
          maxHeight: '200px',
        }}
      />
    </div>
  );
});

export default MulipleAnalysisCodeEditor;
