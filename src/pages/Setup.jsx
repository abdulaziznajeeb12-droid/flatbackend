import { useEffect, useState } from "react";
import { api } from "../api";
import { Card } from "../components/UI";

const EMPTY_FEE = { name: "", defaultAmount: "" };

export default function Setup({ toast }) {
  const [blocks, setBlocks] = useState([]);
  const [types, setTypes] = useState([]);
  const [b, setB] = useState("");
  const [ft, setFt] = useState(EMPTY_FEE);

  const load = () => { api.get("/api/blocks").then(setBlocks); api.get("/api/feetypes").then(setTypes); };
  useEffect(() => { load(); }, []);

  const addBlock = async () => { await api.post("/api/blocks", { name: b }); setB(""); toast("Block add ho gaya ✔"); load(); };
  const addType = async () => {
    await api.post("/api/feetypes", { name: ft.name, defaultAmount: +ft.defaultAmount || 0, isMonthly: true });
    setFt(EMPTY_FEE); toast("Fee type add ho gayi ✔"); load();
  };
  const del = async (url, name) => { if (window.confirm(`${name} delete karein?`)) { await api.del(url); load(); } };

  return (
    <>
      <h1>Setup</h1>
      <div className="grid" style={{ gridTemplateColumns: "repeat(auto-fit,minmax(320px,1fr))", alignItems: "start" }}>
        <Card title="Blocks">
          <div className="row">
            <input placeholder="Block name (A, B, C...)" value={b} onChange={e => setB(e.target.value)} />
            <button className="btn" disabled={!b} onClick={addBlock}>Add</button>
          </div>
          <p>{blocks.map(x => (
            <span key={x.id} className="tag" style={{ marginRight: 6 }}>
              {x.name} <span style={{ cursor: "pointer" }} onClick={() => del(`/api/blocks/${x.id}`, x.name)}>✕</span>
            </span>
          ))}</p>
        </Card>

        <Card title="Fee types (admin khud add kare)">
          <div className="row">
            <input placeholder="Name (Water, Lift...)" value={ft.name} onChange={e => setFt({ ...ft, name: e.target.value })} />
            <input placeholder="Default Rs" style={{ width: 100 }} value={ft.defaultAmount} onChange={e => setFt({ ...ft, defaultAmount: e.target.value })} />
            <button className="btn" disabled={!ft.name} onClick={addType}>Add</button>
          </div>
          <p>{types.map(x => (
            <span key={x.id} className="tag" style={{ marginRight: 6 }}>
              {x.name} {x.defaultAmount > 0 && `(${x.defaultAmount})`}{" "}
              <span style={{ cursor: "pointer" }} onClick={() => del(`/api/feetypes/${x.id}`, x.name)}>✕</span>
            </span>
          ))}</p>
        </Card>
      </div>
    </>
  );
}