import { useFormikContext } from 'formik';
import lodash from 'lodash';
// eslint-disable-next-line import/order
import { highlight, languages } from 'prismjs/components/prism-core';
// eslint-disable-next-line import/no-unassigned-import
import 'prismjs/components/prism-clike';
// eslint-disable-next-line import/no-unassigned-import
import 'prismjs/components/prism-javascript';

import React, { memo, useCallback, useEffect, useMemo, useState } from 'react';
import Editor from 'react-simple-code-editor';

import MultiAnalysisWrapper from '../../hoc/MultiAnalysisWrapper';
import Eval from '../../utility/Evaluate';

const initCode = `function run(data) {

  return JSON.stringify(data,undefined, 2);
  
}(args);
`;

const MultipletAnalysisTabContent = memo(({ spectraAanalysis, activeTab }) => {
  const { values, setFieldValue } = useFormikContext();
  const codeText = lodash.get(values, 'multipletAnalysis.code', initCode);
  const [code, setCode] = useState(codeText);
  const [result, setResult] = useState('');

  const data = useMemo(() => {
    const {
      values,
      options: { columns },
    } = spectraAanalysis[activeTab] || {
      values: {},
      options: { columns: {} },
    };
    return { values: Object.values(values), columns };
  }, [activeTab, spectraAanalysis]);

  useEffect(() => {
    const evalResult = Eval(code, data);
    if (evalResult instanceof Error) {
      setResult(evalResult.message);
    } else {
      setFieldValue('multipletAnalysis.code', code);
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
    <div>
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

      {/* <div
        style={{
          border: '0.55px solid #f3f3f3',
          width: '100%',
          minHeight: '100px',
          padding: '10px',
        }}
        // eslint-disable-next-line react/no-danger
        dangerouslySetInnerHTML={{ __html: result }}
      /> */}
    </div>
  );
});

export default MultiAnalysisWrapper(MultipletAnalysisTabContent);
