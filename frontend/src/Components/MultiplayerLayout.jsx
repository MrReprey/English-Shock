import Navbar from "./Navbar";
import "./css/MultiplayerLayout.css";

function MultiplayerLayout({
  children,
  sidebar,
}) {
  return (
    <div className="multiplayer-layout-page">
      <Navbar />

      <main className="multiplayer-layout">
        <section className="multiplayer-layout-main">
          {children}
        </section>

        <aside className="multiplayer-layout-sidebar">
          {sidebar}
        </aside>
      </main>
    </div>
  );
}

export default MultiplayerLayout;
