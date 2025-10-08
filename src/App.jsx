import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Router from "./Router";
import { LocaleProvider } from "./contexts/LocaleContext";
import ErrorBoundary from "./component/error/ErrorBoundary";

function App() {
  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);
  return (
    <>
      <LocaleProvider>
        <ErrorBoundary fallback={<div>Something went wrong.</div>}>
          <Router />
        </ErrorBoundary>
      </LocaleProvider>
    </>
  );
}

export default App;
