const ICONS = { Dashboard: "📊", "Fee Collection": "💰", Payments: "🔎", Expenses: "🧾", Workers: "👷", Flats: "🏠", Setup: "⚙️" };

export default function Sidebar({ pages, tab, setTab }) {
  return (
    <aside className="side">
      <h2>🏢 Fee Manager</h2>
      {pages.map(t => (
        <button key={t} className={t === tab ? "on" : ""} onClick={() => setTab(t)}>{ICONS[t]} {t}</button>
      ))}
    </aside>
  );
}