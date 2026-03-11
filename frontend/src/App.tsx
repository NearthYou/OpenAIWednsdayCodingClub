import { useEffect, useState } from "react";
import { PageTabs, type AppView } from "./components/PageTabs";
import { CalendarPage } from "./pages/CalendarPage";
import { GoodsExplorePage } from "./pages/GoodsExplorePage";

function getViewFromHash(hash: string): AppView {
  if (hash === "#goods-explore") {
    return "goods";
  }

  return "calendar";
}

export default function App() {
  const [view, setView] = useState<AppView>(() => getViewFromHash(window.location.hash));

  useEffect(() => {
    function handleHashChange() {
      setView(getViewFromHash(window.location.hash));
    }

    window.addEventListener("hashchange", handleHashChange);
    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <>
      <div className="page-shell page-shell--nav">
        <PageTabs currentView={view} />
      </div>
      {view === "goods" ? <GoodsExplorePage /> : <CalendarPage />}
    </>
  );
}
