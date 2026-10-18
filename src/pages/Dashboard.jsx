import { useEffect, useState } from "react";
import { api } from "../api";
import { printReport } from "../printReceipt";
import { Card, Stat } from "../components/UI";
import { money, qs, today, thisMonth } from "../utils";

export default function Dashboard() {
  const [from, setFrom] = useState(thisMonth() + "-01");
  const [to, setTo] = useState(today());
  const [s, setS] = useState(null);
  const [dues, setDues] = useState([]);

  useEffect(() => { api.get(`/api/summary?${qs({ from, to })}`).then(setS); }, [from, to]);
  useEffect(() => { api.get(`/api/dues?month=${thisMonth()}`).then(setDues); }, []);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><h1 style={{ margin: 0 }}>Dashboard</h1><button className="btn light" onClick={() => printReport({ title: "Summary", subtitle: `${from} to ${to}`, lines: [...(s ? [["Fee Income", money(s.income)], ["Worker Salary", money(s.wages)], ["Expenses", money(s.expenses)], ...s.byBlock.map(b => ["Block " + b.block, money(b.total)])] : []), ...(dues.length ? ["Baqaya (" + dues.length + ")", ...dues.map(d => [`${d.blockName}-${d.flatNo} ${d.ownerName}`, money(d.monthlyFee)])] : [])], total: ["Balance", money(s?.balance)] })}>🖨 Print Report</button></div>
      <Card>
        <div className="row">
          <span className="muted">From</span><input type="date" value={from} onChange={e => setFrom(e.target.value)} />
          <span className="muted">To</span><input type="date" value={to} onChange={e => setTo(e.target.value)} />
        </div>
        {s && (
          <div className="grid" style={{ marginTop: 16 }}>
            <Stat label="Fee Income" value={money(s.income)} color="g" />
            <Stat label="Worker Salary" value={money(s.wages)} color="y" />
            <Stat label="Expenses" value={money(s.expenses)} color="r" />
            <Stat label="Balance" value={money(s.balance)} />
          </div>
        )}
      </Card>

      {s?.byBlock.length > 0 && (
        <Card title="Block wise income">
          <table><tbody>
            {s.byBlock.map(b => <tr key={b.block}><td>{b.block}</td><td align="right">{money(b.total)}</td></tr>)}
          </tbody></table>
        </Card>
      )}

      <Card title={`Is mahine ke baqaya (${dues.length} flats)`}>
        {dues.length === 0 ? <p className="muted">Sab ne fee de di hai 🎉</p> : (
          <table>
            <thead><tr><th>Block</th><th>Flat</th><th>Name</th><th>Phone</th><th>Fee</th></tr></thead>
            <tbody>
              {dues.map(d => (
                <tr key={d.flatId}><td>{d.blockName}</td><td>{d.flatNo}</td><td>{d.ownerName}</td><td>{d.phone}</td><td>{money(d.monthlyFee)}</td></tr>
              ))}
            </tbody>
          </table>
        )}
      </Card>
    </>
  );
}