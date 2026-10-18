import { useEffect, useState } from "react";
import { api } from "../api";
import { Card, Opts } from "../components/UI";
import printReceipt from "../printReceipt";
import { money, qs, today, thisMonth } from "../utils";

const EMPTY = { blockId: "", flatId: "", feeTypeId: "", forMonth: thisMonth(), amount: "", method: "Cash", note: "" };

export default function FeeCollection({ toast }) {
  const [blocks, setBlocks] = useState([]);
  const [types, setTypes] = useState([]);
  const [flats, setFlats] = useState([]);
  const [todayList, setTodayList] = useState([]);
  const [f, setF] = useState(EMPTY);
  const set = k => e => setF({ ...f, [k]: e.target.value });

  const loadToday = () => api.get(`/api/payments?${qs({ from: today(), to: today() })}`).then(setTodayList);
  
  useEffect(() => { 
    api.get("/api/blocks").then(setBlocks); 
    api.get("/api/feetypes").then(setTypes); 
    loadToday(); 
  }, []);

  useEffect(() => { 
    if (f.blockId) {
      api.get(`/api/flats?${qs({ blockId: f.blockId })}`).then(setFlats); 
    } else {
      setFlats([]);
    }
  }, [f.blockId]);

  const pickFlat = e => {
    const flat = flats.find(x => x.id == e.target.value);
    setF({ ...f, flatId: e.target.value, amount: flat ? flat.monthlyFee : "" });
  };

  const pickType = e => {
    const t = types.find(x => x.id == e.target.value);
    setF({ ...f, feeTypeId: e.target.value, amount: t?.defaultAmount > 0 ? t.defaultAmount : f.amount });
  };

  const pay = async () => {
    const r = await api.post("/api/payments", { ...f, flatId: +f.flatId, feeTypeId: +f.feeTypeId, amount: +f.amount });
    toast("Fee save ho gayi ✔");
    printReceipt(await api.get(`/api/payments/${r.id}`));
    setF({ ...EMPTY, blockId: f.blockId });
    loadToday();
  };

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}>
        <h1 style={{ margin: 0 }}>Fee Collection</h1>
        <button className="btn light" onClick={() => window.print()}>🖨 Print Report</button>
      </div>

      <Card title="Nayi fee jama karein">
        <div className="row">
          <select value={f.blockId} onChange={set("blockId")}><Opts list={blocks} label="Block" /></select>
          <select value={f.flatId} onChange={pickFlat}>
            <Opts list={flats.map(x => ({ ...x, label: `${x.flatNo} - ${x.ownerName}` }))} label="Flat" text="label" />
          </select>
          <select value={f.feeTypeId} onChange={pickType}><Opts list={types} label="Fee type" /></select>
          <input type="month" value={f.forMonth} onChange={set("forMonth")} />
          <input placeholder="Amount" value={f.amount} onChange={set("amount")} style={{ width: 110 }} />
          <select value={f.method} onChange={set("method")}>
            <option>Cash</option><option>Bank</option><option>Easypaisa</option><option>JazzCash</option>
          </select>
          <input placeholder="Note (optional)" value={f.note} onChange={set("note")} />
          <button className="btn" disabled={!f.flatId || !f.feeTypeId || !f.amount} onClick={pay}>Save & Print</button>
        </div>
      </Card>

      <Card title={`Aaj ki receipts — ${money(todayList.reduce((a, x) => a + x.amount, 0))}`}>
        <table>
          <thead><tr><th>Receipt</th><th>Flat</th><th>Name</th><th>Fee</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {todayList.map(x => (
              <tr key={x.receiptNo}>
                <td>#{x.receiptNo}</td><td>{x.blockName}-{x.flatNo}</td><td>{x.ownerName}</td>
                <td><span className="tag">{x.feeType}</span> {x.forMonth}</td><td>{money(x.amount)}</td>
                <td><button className="btn light sm" onClick={() => printReceipt(x)}>🖨 Print</button></td>
              </tr>
            ))}
          </tbody>
        </table>
        {todayList.length === 0 && <p className="muted">Aaj abhi koi payment nahi aayi.</p>}
      </Card>
    </>
  );
}