import Sidebar from "../components/Sidebar";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <>
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">
        <div className="page-header">
        </div>

        <section className="cards">
          <div className="card">Quick metrics and widgets will appear here.</div>
          <div className="card">Another card example</div>
        </section>
      </main>
    </div>
    </>
  );
}
