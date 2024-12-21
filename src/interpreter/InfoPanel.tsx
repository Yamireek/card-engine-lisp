import { SxProps, Card, CardContent, Typography } from '@mui/material';

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
