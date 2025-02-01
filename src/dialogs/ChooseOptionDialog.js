import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, Grid2, ListItemButton, Typography, } from '@mui/material';
import { useState } from 'react';
import { MinimizeDialogButton } from './MinimizeDialogButton';
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const ChooseOptionDialog = (props) => {
    const [selected, setSelected] = useState([]);
    const single = props.max === 1;
    return (_jsxs(Dialog, { open: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: props.title }), _jsx(MinimizeDialogButton, { onMinimize: props.onMinimize }), _jsx(DialogContent, { children: _jsx(Grid2, { container: true, spacing: 1, justifyContent: "space-evenly", children: props.choices.map((o, i) => {
                        var _a, _b, _c, _d;
                        return (_jsx(Grid2, { size: { xs: !o.image ? 12 : 'auto' }, children: _jsx(ListItemButton, { style: { flex: '0 0 auto' }, disabled: !selected.includes(o.id) &&
                                    props.max !== undefined &&
                                    selected.length >= props.max, onClick: (e) => {
                                    if (single) {
                                        props.onSubmit([o.id]);
                                    }
                                    else {
                                        e.stopPropagation();
                                        const filtered = selected.includes(o.id)
                                            ? selected.filter((s) => s !== o.id)
                                            : [...selected, o.id];
                                        setSelected(filtered);
                                    }
                                }, children: ((_a = o.image) === null || _a === void 0 ? void 0 : _a.src) ? (_jsx("img", { alt: "", src: (_b = o.image) === null || _b === void 0 ? void 0 : _b.src, style: {
                                        width: (_c = o.image) === null || _c === void 0 ? void 0 : _c.width,
                                        height: (_d = o.image) === null || _d === void 0 ? void 0 : _d.height,
                                        position: 'relative',
                                        opacity: single || selected.includes(o.id) ? 1 : 0.5,
                                    } })) : (_jsx(Typography, { style: {
                                        opacity: single || selected.includes(o.id) ? 1 : 0.5,
                                    }, children: o.title })) }, i) }, i));
                    }) }) }), !single && (_jsx(DialogActions, { children: _jsx(Button, { disabled: props.min !== undefined && selected.length < props.min, onClick: () => {
                        props.onSubmit(selected);
                    }, children: "Confirm" }) }))] }));
};
//# sourceMappingURL=ChooseOptionDialog.js.map