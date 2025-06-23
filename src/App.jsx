import { useAuth, ROLES } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Register from "./pages/Register.jsx";
import Page from "@/pages/Frame";
import { useState } from "react";

function App() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  if (user.role === ROLES.ADMIN && showRegister) {
    return (
      <>
        <button className="absolute top-4 left-4" onClick={() => setShowRegister(false)}>
          ← Back
        </button>
        <Register />
      </>
    );
  }

  return (
    <Page onShowRegister={() => setShowRegister(true)} />
  );
}

export default App;
