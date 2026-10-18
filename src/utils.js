export const today = () => new Date().toISOString().slice(0, 10);
export const thisMonth = () => today().slice(0, 7);
export const money = n => "Rs " + Number(n || 0).toLocaleString();
export const qs = o => new URLSearchParams(Object.entries(o).filter(([, v]) => v)).toString();