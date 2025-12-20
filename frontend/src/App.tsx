import { useEffect, useState } from "react";
import "./App.css";

type HealthResponse = {
  status: string;
};

function App() {
  const [healthStatus, setHealthStatus] = useState<string>("loading...");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    const run = async () => {
      try {
        const response = await fetch("/api/health/");

        if (!response.ok) {
          throw new Error(`Health check failed: HTTP ${response.status}`);
        }

        const data = (await response.json()) as HealthResponse;
        setHealthStatus(data.status);
      } catch (error) {
        setErrorMessage(error instanceof Error ? error.message : "Unknown error");
      }
    };

    run();
  }, []);

  return (
    <>
      <h1>personal-site</h1>

      <div style={{ marginTop: "1rem" }}>
        <strong>Backend health:</strong>{" "}
        {errorMessage ? <span>{errorMessage}</span> : <span>{healthStatus}</span>}
      </div>
    </>
  );
}

export default App;
