import { useEffect, useState } from "react";
import { api } from "../api";
import { printReport } from "../printReceipt";
import { Card, Opts } from "../components/UI";
import { money, qs } from "../utils";

const EMPTY = { blockId: "", flatNo: "", ownerName: "", phone: "", monthlyFee: "" };

export default function Flats({ toast }) {
  const [blocks, setBlocks] = useState([]);
  const [flats, setFlats] = useState([]);
  const [fl, setFl] = useState(EMPTY);
  const [editId, setEditId] = useState(null);
  const [q, setQ] = useState("");
  const [blockFilter, setBlockFilter] = useState("");
  const set = k => e => setFl({ ...fl, [k]: e.target.value });

  const load = () => api.get(`/api/flats?${qs({ q, blockId: blockFilter })}`).then(setFlats);
  useEffect(() => { api.get("/api/blocks").then(setBlocks); }, []);
  useEffect(() => { load(); }, [q, blockFilter]);

  const save = async () => {
    const body = { ...fl, blockId: +fl.blockId, monthlyFee: +fl.monthlyFee };
    if (editId) await api.put(`/api/flats/${editId}`, body); else await api.post("/api/flats", body);
    toast("Flat save ho gaya ✔"); setFl(EMPTY); setEditId(null); load();
  };
  const edit = x => {
    setEditId(x.id);
    setFl({ blockId: x.blockId, flatNo: x.flatNo, ownerName: x.ownerName, phone: x.phone || "", monthlyFee: x.monthlyFee });
    window.scrollTo(0, 0);
  };
  const remove = async x => {
    if (!window.confirm(`Flat ${x.flatNo} delete karein?`)) return;
    await api.del(`/api/flats/${x.id}`); load();
  };

  return (
    <>
      <div className="row" style={{ justifyContent: "space-between", marginBottom: 14 }}><h1 style={{ margin: 0 }}>Flats</h1><button className="btn light" onClick={() => printReport({ title: "Flats List", subtitle: `${flats.length} flats`, lines: flats.map(x => [`${x.blockName}-${x.flatNo} ${x.ownerName}`, money(x.monthlyFee)]), total: null })}>🖨 Print Report</button></div>
      <Card title={editId ? "Flat edit karein" : "Naya flat"}>
        <div className="row">
          <select value={fl.blockId} onChange={set("blockId")}><Opts list={blocks} label="Block" /></select>
          <input placeholder="Flat no" value={fl.flatNo} onChange={set("flatNo")} style={{ width: 90 }} />
          <input placeholder="Owner / Tenant" value={fl.ownerName} onChange={set("ownerName")} />
          <input placeholder="Phone" value={fl.phone} onChange={set("phone")} />
          <input placeholder="Monthly fee" value={fl.monthlyFee} onChange={set("monthlyFee")} style={{ width: 110 }} />
          <button className="btn" disabled={!fl.blockId || !fl.flatNo || !fl.ownerName} onClick={save}>{editId ? "Update" : "Add flat"}</button>
          {editId && <button className="btn light" onClick={() => { setEditId(null); setFl(EMPTY); }}>Cancel</button>}
        </div>
      </Card>

      <Card title={`Flats (${flats.length})`}>
        <div className="row">
          <select value={blockFilter} onChange={e => setBlockFilter(e.target.value)}><Opts list={blocks} label="All blocks" /></select>
          <input placeholder="Search flat / naam / phone" value={q} onChange={e => setQ(e.target.value)} />
        </div>
        <table>
          <thead><tr><th>Block</th><th>Flat</th><th>Name</th><th>Phone</th><th>Monthly fee</th><th></th></tr></thead>
          <tbody>
            {flats.map(x => (
              <tr key={x.id}>
                <td>{x.blockName}</td><td>{x.flatNo}</td><td>{x.ownerName}</td><td>{x.phone}</td><td>{money(x.monthlyFee)}</td>
                <td className="row">
                  <button className="btn light sm" onClick={() => edit(x)}>Edit</button>
                  <button className="btn del sm" onClick={() => remove(x)}>Delete</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </>
  );
}