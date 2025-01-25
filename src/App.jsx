import AOS from "aos";
import "aos/dist/aos.css";
import { useEffect } from "react";
import Router from "./Router";

function App() {
  useEffect(() => {
    AOS.init();
    AOS.refresh();
  }, []);
  return (
    <>
      <Router />
    </>
  );
}

export default App;
