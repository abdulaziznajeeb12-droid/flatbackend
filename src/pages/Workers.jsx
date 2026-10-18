import { useEffect, useState } from "react";
import { api } from "../api";
import { Card } from "../components/UI";
import { money, thisMonth } from "../utils";
import { printSlip, printReport } from "../printReceipt";

const EMPTY = { name: "", role: "", monthlySalary: "" };

export default function Workers({ toast }) {
  const [m, setM] = useState(thisMonth());
  const [list, setList] = useState([]);
  const [n, setN] = useState(EMPTY);

  const load = () => api.get(`/api/workers?month=${m}`).then(setList);
  useEffect(() => { load(); }, [m]);

  const add = async () => {
    await api.post("/api/workers", { ...n, monthlySalary: +n.monthlySalary });
    setN(EMPTY); toast("Worker add ho gaya ✔"); load();
  };
  const pay = async w => {
    await api.post("/api/workers/pay", { workerId: w.id, forMonth: m, amount: w.monthlySalary - w.paidThisMonth });
    toast("Salary de di ✔"); printSlip({ name: w.name, role: w.role, forMonth: m, amount: w.monthlySalary - w.paidThisMonth }); load();
  };
  const remove = async w => {
    if (!window.confirm(`${w.name} ko hata dein?`)) return;
    await api.del(`/api/workers/${w.id}`); load();
  };

  const totalSalary = list.reduce((a, w) => a + w.monthlySalary, 0);
  const totalPaid = list.reduce((a, w) => a + w.paidThisMonth, 0);

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><h1 style={{ margin: 0 }}>Workers</h1><button className="btn light" onClick={() => printReport({ title: "Salary Report", subtitle: m, lines: list.map(w => [w.name, `${money(w.paidThisMonth)} / ${money(w.monthlySalary)}`]), total: ["Paid", money(totalPaid)] })}>🖨 Print Report</button></div>
      <Card title="Naya worker">
        <div className="row">
          <input placeholder="Name" value={n.name} onChange={e => setN({ ...n, name: e.target.value })} />
          <input placeholder="Role (Guard, Sweeper...)" value={n.role} onChange={e => setN({ ...n, role: e.target.value })} />
          <input placeholder="Monthly salary" value={n.monthlySalary} onChange={e => setN({ ...n, monthlySalary: e.target.value })} />
          <button className="btn" disabled={!n.name || !n.monthlySalary} onClick={add}>Add</button>
        </div>
      </Card>

      <Card title="Monthly salary">
        <div className="row">
          <span className="muted">Mahina</span><input type="month" value={m} onChange={e => setM(e.target.value)} />
          <span className="muted">Total {money(totalSalary)} · Paid {money(totalPaid)} · Baqaya {money(totalSalary - totalPaid)}</span>
        </div>
        <table>
          <thead><tr><th>Name</th><th>Role</th><th>Salary</th><th>Paid</th><th>Status</th><th></th></tr></thead>
          <tbody>
            {list.map(w => {
              const done = w.paidThisMonth >= w.monthlySalary;
              return (
                <tr key={w.id}>
                  <td>{w.name}</td><td>{w.role}</td><td>{money(w.monthlySalary)}</td><td>{money(w.paidThisMonth)}</td>
                  <td><span className="tag" style={{ background: done ? "#e3f7ef" : "#fff3df", color: done ? "#2c9e75" : "#c98a1b" }}>{done ? "Paid" : "Baqaya"}</span></td>
                  <td className="row">
                    {!done && <button className="btn sm" onClick={() => pay(w)}>Pay</button>}
                    <button className="btn del sm" onClick={() => remove(w)}>Remove</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </Card>
    </>
  );
}