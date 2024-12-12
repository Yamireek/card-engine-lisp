import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CssBaseline,
  Stack,
  SxProps,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Instruction,
  Interpreter,
  toCode,
  toInstructions,
  Value,
  valueToString,
} from '@card-engine-liesp/engine';
import { observer } from 'mobx-react-lite';
import JsonView from '@uiw/react-json-view';
import { monokaiTheme } from '@uiw/react-json-view/monokai';
import { reverse } from 'lodash/fp';
import { Inspector } from 'react-inspector';

const codeheight = 300;

export const ValueView = (props: { v: Value }) => {
  if (typeof props.v === 'object') {
    if ('type' in props.v) {
      return (
        <Chip
          avatar={<Avatar>{props.v.type.slice(0, 1)}</Avatar>}
          label={valueToString(props.v)}
        />
      );
    } else {
      return (
        <JsonView
          value={props.v}
          style={monokaiTheme}
          enableClipboard={false}
        />
      );
    }
  } else {
    const type =
      typeof props.v === 'number'
        ? 'N'
        : typeof props.v === 'boolean'
        ? 'B'
        : 'S';
    return (
      <Chip avatar={<Avatar>{type}</Avatar>} label={valueToString(props.v)} />
    );
  }
};

export const InstructionView = (props: { i: Instruction }) => {
  if (typeof props.i === 'string') {
    return <Chip label={props.i} />;
  }

  return (
    <Chip
      avatar={<Avatar>{props.i[0].slice(0, 1)}</Avatar>}
      label={valueToString(props.i[1])}
    />
  );
};

export const InfoPanel = (
  props: React.PropsWithChildren<{ label: string; sx?: SxProps }>
) => {
  return (
    <Card sx={props.sx}>
      <CardContent>
        <Typography variant="h6">{props.label}</Typography>
        {props.children}
      </CardContent>
    </Card>
  );
};

export const InterpreterApp = observer(() => {
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
    () =>
      new Interpreter(instructions, {
        obj: {
          a: 1,
          b(v: number) {
            this.a = v;
          },
        },
      }),
    [instructions]
  );

  return (
    <React.Fragment>
      <CssBaseline />
      <Box>
        <Box sx={{ height: codeheight, display: 'flex', flexDirection: 'row' }}>
          <InfoPanel label="Program" sx={{ flexGrow: 1, margin: '4px' }}>
            <Editor
              height="100px"
              language="typescript"
              value={code}
              onChange={(v) => (v ? setCode(v) : undefined)}
            />
          </InfoPanel>
          <InfoPanel label="Controls" sx={{ margin: '4px', width: 200 }}>
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
          </InfoPanel>
        </Box>
        <Box
          sx={{
            height: `calc(100vh - ${codeheight}px)`,
            overflow: 'hidden',
            flexDirection: 'row',
            display: 'flex',
          }}
        >
          <InfoPanel label="Stack" sx={{ margin: '4px', width: 300 }}>
            <Stack alignItems="flex-start" spacing={1}>
              {reverse(interpreter.stack).map((i) => (
                <ValueView v={i} />
              ))}
            </Stack>
          </InfoPanel>
          <InfoPanel
            label="Instructions"
            sx={{ margin: '4px', flex: '1 1 auto' }}
          >
            {toCode(interpreter.instructions, interpreter.stack)}
            <Stack alignItems="flex-start" spacing={1}>
              {interpreter.instructions.map((i) => (
                <InstructionView i={i} />
              ))}
            </Stack>
          </InfoPanel>
          <InfoPanel label="Variables" sx={{ margin: '4px', width: 400 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Value</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {Object.keys(interpreter.globals).map((key) => (
                  <TableRow>
                    <TableCell>{key}</TableCell>
                    <TableCell>
                      <ValueView v={interpreter.globals[key]} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </InfoPanel>
        </Box>
      </Box>
    </React.Fragment>
  );
});
