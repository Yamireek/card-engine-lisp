// File: App.js
import React, { useState } from 'react';
import {
  Container,
  Typography,
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  List,
  ListItem,
} from '@mui/material';

const ProgramCode = () => (
  <Box border={1} borderRadius={2} p={2} mb={3}>
    <Typography variant="h6">Program Code</Typography>
    <Typography>
      {'(f => f(f))(f => n => n <= 1 ? 1 : n * f(f)(n - 1))(5)'}
    </Typography>
  </Box>
);

const ExecutionSteps = ({ steps }) => (
  <Box border={1} borderRadius={2} p={2} mb={3}>
    <Typography variant="h6">Execution Steps</Typography>
    <List>
      {steps.map((step, index) => (
        <ListItem key={index}>{step}</ListItem>
      ))}
    </List>
  </Box>
);

const VariablesTable = ({ variables }) => (
  <TableContainer component={Paper} sx={{ mb: 3 }}>
    <Typography variant="h6" sx={{ p: 2 }}>
      Variables Table
    </Typography>
    <Table>
      <TableHead>
        <TableRow>
          <TableCell>
            <strong>Key</strong>
          </TableCell>
          <TableCell>
            <strong>Type</strong>
          </TableCell>
          <TableCell>
            <strong>Value</strong>
          </TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {variables.map((variable, index) => (
          <TableRow key={index}>
            <TableCell>{variable.key}</TableCell>
            <TableCell>{variable.type}</TableCell>
            <TableCell>{variable.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </TableContainer>
);

const StackVisualization = ({ stack }) => (
  <Box border={1} borderRadius={2} p={2} mb={3}>
    <Typography variant="h6">Stack Visualization</Typography>
    <List>
      {stack.map((item, index) => (
        <ListItem key={index}>
          {index === 0 ? `Top of Stack: [${item}]` : `[${item}]`}
        </ListItem>
      ))}
    </List>
  </Box>
);

const DebugOutput = ({ message }) => (
  <Box border={1} borderRadius={2} p={2}>
    <Typography variant="h6">Errors / Debug Output</Typography>
    <Typography color="error">{message}</Typography>
  </Box>
);

const App = () => {
  const [executionSteps, setExecutionSteps] = useState([
    'Step 1: Push 5',
    'Step 2: Call function f',
    'Step 3: Check n <= 1',
  ]);
  const [variables, setVariables] = useState([
    { key: 'a', type: 'Int', value: 1 },
    { key: 'b', type: 'Int', value: 2 },
  ]);
  const [stack, setStack] = useState([5, 1]);
  const [errorMessage, setErrorMessage] = useState("Unknown Instruction: '?'");

  return (
    <Container maxWidth="md">
      <Typography variant="h4" align="center" gutterBottom>
        Stack-Based VM
      </Typography>
      <ProgramCode />
      <ExecutionSteps steps={executionSteps} />
      <VariablesTable variables={variables} />
      <StackVisualization stack={stack} />
      <DebugOutput message={errorMessage} />
      <Box mt={3} display="flex" justifyContent="space-between">
        <Button
          variant="contained"
          color="primary"
          onClick={() => setExecutionSteps([...executionSteps, 'Next Step'])}
        >
          Step
        </Button>
        <Button
          variant="contained"
          color="secondary"
          onClick={() => setErrorMessage("Unknown Error: '!''")}
        >
          Trigger Error
        </Button>
      </Box>
    </Container>
  );
};

export default App;
