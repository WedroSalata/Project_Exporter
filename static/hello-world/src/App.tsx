import React, { useEffect, useState } from "react";
import LoadingPage from "./pages/MainPages/loadingPage";
import MainPage from "./pages/MainPages/mainPage";

function App() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      setIsLoading(false);
    })();
  }, []);

  return (
    <div style={{ margin: "10px" }}>
      {isLoading ? <LoadingPage /> : <MainPage />}
    </div>
  );
}

export default App;
