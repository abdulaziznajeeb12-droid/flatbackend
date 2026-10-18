import { useEffect, useState } from "react";
import { api } from "../api";
import { printReport } from "../printReceipt";
import { Card, Opts } from "../components/UI";
import printReceipt from "../printReceipt";
import { money, qs } from "../utils";

const EMPTY = { from: "", to: "", blockId: "", month: "", q: "" };

export default function Payments({ toast }) {
  const [blocks, setBlocks] = useState([]);
  const [list, setList] = useState([]);
  const [sr, setSr] = useState(EMPTY);
  const set = k => e => setSr({ ...sr, [k]: e.target.value });

  const search = (filters = sr) => api.get(`/api/payments?${qs(filters)}`).then(setList);
  useEffect(() => { api.get("/api/blocks").then(setBlocks); search(); }, []);

  const reset = () => { setSr(EMPTY); search(EMPTY); };
  const remove = async id => {
    if (!window.confirm(`Receipt #${id} delete karein?`)) return;
    await api.del(`/api/payments/${id}`);
    toast("Delete ho gayi"); search();
  };

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><h1 style={{ margin: 0 }}>Payments Search</h1><button className="btn light" onClick={() => printReport({ title: "Payments Report", subtitle: `${list.length} receipts`, lines: list.map(x => [`${new Date(x.paidOn).toLocaleDateString()} #${x.receiptNo} ${x.blockName}-${x.flatNo} ${x.ownerName}`, money(x.amount)]), total: ["Total", money(list.reduce((a, x) => a + x.amount, 0))] })}>🖨 Print Report</button></div>
      <Card>
        <div className="row">
          <input type="date" value={sr.from} onChange={set("from")} />
          <input type="date" value={sr.to} onChange={set("to")} />
          <select value={sr.blockId} onChange={set("blockId")}><Opts list={blocks} label="All blocks" /></select>
          <input type="month" value={sr.month} onChange={set("month")} />
          <input placeholder="Flat / naam / receipt #" value={sr.q} onChange={set("q")} />
          <button className="btn" onClick={() => search()}>Search</button>
          <button className="btn light" onClick={reset}>Reset</button>
        </div>
        <p>Total: <b>{money(list.reduce((a, x) => a + x.amount, 0))}</b> <span className="muted">({list.length} receipts)</span></p>
        <table>
          <thead><tr><th>Receipt</th><th>Date</th><th>Flat</th><th>Name</th><th>Fee</th><th>Method</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {list.map(x => (
              <tr key={x.receiptNo}>
                <td>#{x.receiptNo}</td><td>{new Date(x.paidOn).toLocaleDateString()}</td>
                <td>{x.blockName}-{x.flatNo}</td><td>{x.ownerName}</td>
                <td><span className="tag">{x.feeType}</span> {x.forMonth}</td><td>{x.method}</td><td>{money(x.amount)}</td>
                <td className="row">
                  <button className="btn light sm" onClick={() => printReceipt(x)}>🖨 Print</button>
                  <button className="btn del sm" onClick={() => remove(x.receiptNo)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}