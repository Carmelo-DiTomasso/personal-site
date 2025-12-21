// import { useEffect, useState } from "react";
import { HomePage } from "./pages/home/HomePage";
import "./App.css";

export default function App() {
  return <HomePage />;
}

// type HealthResponse = {
//   status: string;
// };

// function App() {
//   const [healthStatus, setHealthStatus] = useState<string>("loading...");
//   const [errorMessage, setErrorMessage] = useState<string | null>(null);

//   useEffect(() => {

//     // Only check backend health in local development
//     if (!import.meta.env.DEV) {
//       setHealthStatus("not configured (frontend-only deploy)");
//       return;
//     }

//     const run = async () => {
//       try {
//         const response = await fetch("/api/health/");

//         if (!response.ok) {
//           throw new Error(`Health check failed: HTTP ${response.status}`);
//         }

//         const data = (await response.json()) as HealthResponse;
//         setHealthStatus(data.status);
//       } catch (error) {
//         setErrorMessage(error instanceof Error ? error.message : "Unknown error");
//       }
//     };

//     run();
//   }, []);

//   return (
//     <>
//       <h1>personal-site</h1>

//       <div style={{ marginTop: "1rem" }}>
//         <strong>Backend health:</strong>{" "}
//         {errorMessage ? <span>{errorMessage}</span> : <span>{healthStatus}</span>}
//       </div>
//     </>
//   );
// }

// export default App;
