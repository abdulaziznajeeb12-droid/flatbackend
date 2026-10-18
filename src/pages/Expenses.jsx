import { useEffect, useState } from "react";
import { API, api } from "../api";
import { printReport } from "../printReceipt";
import { Card } from "../components/UI";
import { money, qs, today } from "../utils";

const EMPTY = { title: "", category: "", amount: "", date: today(), note: "" };

export default function Expenses({ toast }) {
  const [list, setList] = useState([]);
  const [r, setR] = useState({ from: "", to: "", q: "" });
  const [f, setF] = useState(EMPTY);
  const [img, setImg] = useState(null);

  const load = () => api.get(`/api/expenses?${qs(r)}`).then(setList);
  useEffect(() => { load(); }, []);

  const save = async () => {
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => fd.append(k, v));
    if (img) fd.append("image", img);
    await api.post("/api/expenses", fd);
    setF({ ...EMPTY, date: f.date }); setImg(null);
    toast("Expense save ho gaya ✔"); load();
  };
  const remove = async id => {
    if (!window.confirm("Expense delete karein?")) return;
    await api.del(`/api/expenses/${id}`); load();
  };

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><h1 style={{ margin: 0 }}>Expenses</h1><button className="btn light" onClick={() => printReport({ title: "Expenses Report", subtitle: `${list.length} entries`, lines: list.map(x => [`${x.expenseDate.slice(0, 10)} ${x.title}`, money(x.amount)]), total: ["Total", money(list.reduce((a, x) => a + x.amount, 0))] })}>🖨 Print Report</button></div>
      <Card title="Naya expense (bill ki picture ke saath)">
        <div className="row">
          <input placeholder="Title" value={f.title} onChange={e => setF({ ...f, title: e.target.value })} />
          <input placeholder="Category" value={f.category} onChange={e => setF({ ...f, category: e.target.value })} />
          <input placeholder="Amount" value={f.amount} onChange={e => setF({ ...f, amount: e.target.value })} style={{ width: 110 }} />
          <input type="date" value={f.date} onChange={e => setF({ ...f, date: e.target.value })} />
          <input type="file" accept="image/*" onChange={e => setImg(e.target.files[0])} />
          {img && <img className="thumb" src={URL.createObjectURL(img)} />}
          <button className="btn" disabled={!f.title || !f.amount} onClick={save}>Save</button>
        </div>
      </Card>

      <Card title="Expense list">
        <div className="row">
          <input type="date" onChange={e => setR({ ...r, from: e.target.value })} />
          <input type="date" onChange={e => setR({ ...r, to: e.target.value })} />
          <input placeholder="Title / category" onChange={e => setR({ ...r, q: e.target.value })} />
          <button className="btn" onClick={load}>Filter</button>
        </div>
        <p>Total: <b>{money(list.reduce((a, x) => a + x.amount, 0))}</b></p>
        <table>
          <thead><tr><th>Pic</th><th>Date</th><th>Title</th><th>Category</th><th>Amount</th><th></th></tr></thead>
          <tbody>
            {list.map(x => (
              <tr key={x.id}>
                <td>{x.imagePath
                  ? <a href={`${API}/${x.imagePath}`} target="_blank"><img className="thumb" src={`${API}/${x.imagePath}`} /></a>
                  : "—"}</td>
                <td>{x.expenseDate.slice(0, 10)}</td><td>{x.title}</td>
                <td><span className="tag">{x.category || "-"}</span></td><td>{money(x.amount)}</td>
                <td><button className="btn del sm" onClick={() => remove(x.id)}>Delete</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}