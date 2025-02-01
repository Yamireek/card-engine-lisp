import { jsx as _jsx, jsxs as _jsxs } from "react/jsx-runtime";
import { Button, Dialog, DialogActions, DialogContent, DialogTitle, List, ListItemButton, ToggleButton, ToggleButtonGroup, } from '@mui/material';
import { min, sum } from 'lodash/fp';
import { useState } from 'react';
import { MinimizeDialogButton } from './MinimizeDialogButton';
// eslint-disable-next-line @typescript-eslint/no-unnecessary-type-constraint
export const ChooseDistributionDialog = (props) => {
    var _a, _b;
    const [amounts, setAmounts] = useState(props.choices.map((c) => { var _a; return (_a = c.min) !== null && _a !== void 0 ? _a : 0; }));
    const total = sum(amounts);
    const count = amounts.filter((a) => a).length;
    const totalMax = total <= props.total.max;
    const totalMin = total >= props.total.min;
    const countMax = ((_a = props.count) === null || _a === void 0 ? void 0 : _a.max) ? count <= props.count.max : true;
    const countMin = ((_b = props.count) === null || _b === void 0 ? void 0 : _b.min) ? count >= props.count.min : true;
    const canSubmit = totalMax && totalMin && countMax && countMin;
    const remains = props.total.max - total;
    return (_jsxs(Dialog, { open: true, maxWidth: "md", children: [_jsx(DialogTitle, { children: props.title }), _jsx(MinimizeDialogButton, { onMinimize: props.onMinimize }), _jsx(DialogContent, { children: _jsx(List, { style: {
                        display: 'flex',
                        flexWrap: 'wrap',
                        justifyContent: 'space-evenly',
                    }, children: props.choices.map((o, index) => {
                        var _a, _b, _c;
                        const amount = amounts[index];
                        const minAmount = o.min;
                        const maxAmount = min([o.max, props.total.max]);
                        return (_jsxs("div", { style: { display: 'flex', flexDirection: 'column', margin: 4 }, children: [_jsx(ListItemButton, { style: { flex: '0 0 auto' }, onClick: () => {
                                        const remainPart = o.max - amount;
                                        setAmounts((p) => p.map((a, i) => { var _a; return index === i ? a + ((_a = min([remainPart, remains])) !== null && _a !== void 0 ? _a : 0) : a; }));
                                    }, children: _jsx("img", { alt: "", src: (_a = o.image) === null || _a === void 0 ? void 0 : _a.src, style: {
                                            width: (_b = o.image) === null || _b === void 0 ? void 0 : _b.width,
                                            height: (_c = o.image) === null || _c === void 0 ? void 0 : _c.height,
                                            position: 'relative',
                                            opacity: amount > 0 ? 1 : 0.5,
                                        } }) }), _jsx(ToggleButtonGroup, { value: amount, exclusive: true, onChange: (_, v) => {
                                        setAmounts((p) => p.map((a, i) => (index === i ? v : a)));
                                    }, style: { justifyContent: 'space-evenly' }, children: Array.from({ length: maxAmount - minAmount + 1 }, (_, i) => i + minAmount).map((v) => {
                                        const adds = v - amount;
                                        return (_jsx(ToggleButton, { value: v, style: { flexGrow: 1 }, disabled: adds > 0 && adds > remains, children: v }, v));
                                    }) })] }, index));
                    }) }) }), _jsx(DialogActions, { children: _jsx(Button, { disabled: !canSubmit, onClick: () => {
                        props.onSubmit(amounts);
                    }, children: "Confirm" }) })] }));
};
//# sourceMappingURL=ChooseDistributionDialog.js.map