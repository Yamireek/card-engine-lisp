import {
  Box,
  Button,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
} from '@mui/material';
import React, { useMemo, useState } from 'react';
import Editor from '@monaco-editor/react';
import {
  Game,
  InterpretedAgent,
  Interpreter,
  toCode,
  toInstructions,
} from '@card-engine-liesp/engine';
import { observer } from 'mobx-react-lite';
import { reverse } from 'lodash/fp';
import { ValueView } from './ValueView';
import { InfoPanel } from './InfoPanel';
import { InstructionView } from './InstructionView';
import { InterpreterDialogs } from './InterpreterDialogs';

const codeheight = 300;

export const InterpreterView = observer(() => {
  const [code, setCode] = useState(
    //'(f => f(f))(f => n => n <= 1 ? 1 : n * f(f)(n - 1))(5)'
    //`game.cards.filter((c) => c.props.type === 'enemy').forEach((c) => c.dealDamage(1));`
    //`game.cards.filter((c) => c.props.type === 'enemy')`
    //`game.cards.forEach((c) => c.dealDamage(1))`
    //`game.agent.chooseNumber(1,5) * game.agent.chooseNumber(1,5)`
    'game.run()'
  );

  const instructions = useMemo(() => {
    try {
      return toInstructions(code);
    } catch (error) {
      return [error.message];
    }
  }, [code]);

  const interpreter = useMemo(() => {
    const game = new Game(new InterpretedAgent());
    //game.addCard({ name: 'HERO', type: 'hero', att: 2, def: 2 });
    //game.addCard({ name: 'ALLY', type: 'ally', att: 1, def: 1 });
    game.addCard({ name: 'ENEMY', type: 'enemy', att: 3, def: 3 });
    return new Interpreter(instructions, game, true);
  }, [instructions]);

  return (
    <React.Fragment>
      <InterpreterDialogs interpreter={interpreter} />
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
                interpreter.run();
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
                {Object.keys(interpreter.vars).map((key) => (
                  <TableRow>
                    <TableCell>{key}</TableCell>
                    <TableCell>
                      <ValueView v={interpreter.vars[key]} />
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
