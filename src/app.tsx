import { Button, CssBaseline, Stack } from '@mui/material';
import React, { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import { Interpreter, toInstructions } from '@card-engine-liesp/engine';
import { observer } from 'mobx-react-lite';
import JsonView from '@uiw/react-json-view';
import { monokaiTheme } from '@uiw/react-json-view/monokai';
import { reverse } from 'lodash/fp';

export const App = observer(() => {
  const [code, setCode] = useState(
    '(f => f(f))(f => n => n <= 1 ? 1 : n * f(f)(n - 1))(5)'
  );

  const instructions = useMemo(() => {
    try {
      return toInstructions(code);
    } catch (error: any) {
      return [error.message];
    }
  }, [code]);

  const interpreter = useMemo(
    () => new Interpreter(instructions, { a: 1, b: 2, c: 3 }),
    [instructions]
  );

  return (
    <React.Fragment>
      <CssBaseline />
      <Editor
        height="100px"
        language="typescript"
        value={code}
        onChange={(v) => (v ? setCode(v) : undefined)}
      />
      Program: <pre>{JSON.stringify(instructions)}</pre>
      <Button
        onClick={() => {
          interpreter.step();
        }}
      >
        step
      </Button>
      <Button
        onClick={() => {
          const ref = setInterval(() => {
            if (!interpreter.step()) {
              clearInterval(ref);
            }
          }, 100);
        }}
      >
        run
      </Button>
      <br />
      <Stack direction="row" style={{ height: 300 }}>
        <div style={{ width: '50vw', flexShrink: 0, overflow: 'auto' }}>
          Instructions:
          {interpreter.instructions.map((i) => (
            <pre>{JSON.stringify(i)}</pre>
          ))}
        </div>
        <div style={{ width: '50vw', flexShrink: 0, overflow: 'auto' }}>
          Stack:{' '}
          {reverse(interpreter.stack).map((i) => (
            <pre>{JSON.stringify(i)}</pre>
          ))}
        </div>
      </Stack>
      Env:{' '}
      <JsonView
        value={interpreter.globals}
        style={monokaiTheme}
        enableClipboard={false}
      />
    </React.Fragment>
  );
});
