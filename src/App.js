import { useEffect, useState } from "react";
import { setErrorHandler } from "./api";
import Sidebar from "./components/Sidebar";
import { Toast } from "./components/UI";
import Dashboard from "./pages/Dashboard";
import FeeCollection from "./pages/FeeCollection";
import Payments from "./pages/Payments";
import Expenses from "./pages/Expenses";
import Workers from "./pages/Workers";
import Flats from "./pages/Flats";
import Setup from "./pages/Setup";

const PAGES = { Dashboard, "Fee Collection": FeeCollection, Payments, Expenses, Workers, Flats, Setup };

export default function App() {
  const [tab, setTab] = useState("Dashboard");
  const [msg, setMsg] = useState("");

  const toast = m => { setMsg(m); setTimeout(() => setMsg(""), 3000); };
  useEffect(() => setErrorHandler(toast), []);

  const Page = PAGES[tab];
  return (
    <div className="app">
      <Sidebar pages={Object.keys(PAGES)} tab={tab} setTab={setTab} />
      <main className="main"><Page key={tab} toast={toast} /></main>
      <Toast msg={msg} />
    </div>
  );
}