export const Card = ({ title, children }) => (
  <div className="card">{title && <h3>{title}</h3>}{children}</div>
);

export const Stat = ({ label, value, color }) => (
  <div className={"stat " + (color || "")}><small>{label}</small><b>{value}</b></div>
);

export const Opts = ({ list, label, value = "id", text = "name" }) => (
  <>
    <option value="">{label}</option>
    {list.map(x => <option key={x[value]} value={x[value]}>{x[text]}</option>)}
  </>
);

export const Toast = ({ msg }) => (msg ? <div className="toast">{msg}</div> : null);