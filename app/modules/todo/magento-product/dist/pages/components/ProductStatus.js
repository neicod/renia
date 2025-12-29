import { jsx as _jsx } from "react/jsx-runtime";
const toneColor = {
    muted: '#6b7280',
    error: '#b91c1c',
    info: '#0f172a'
};
export const ProductStatus = ({ message, tone = 'muted' }) => (_jsx("p", { style: { color: toneColor[tone] }, children: message }));
export default ProductStatus;
