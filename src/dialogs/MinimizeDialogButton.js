import { jsx as _jsx } from "react/jsx-runtime";
import { Icon, IconButton } from '@mui/material';
export const MinimizeDialogButton = (props) => {
    if (!props.onMinimize) {
        return null;
    }
    return (_jsx(IconButton, { onClick: props.onMinimize, sx: {
            position: 'absolute',
            right: 8,
            top: 8,
            color: (theme) => theme.palette.grey[500],
        }, children: _jsx(Icon, { children: "minimize" }) }));
};
//# sourceMappingURL=MinimizeDialogButton.js.map