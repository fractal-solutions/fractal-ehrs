import { useAuth, ROLES } from "./context/AuthContext.jsx";
import Login from "./pages/Login.jsx";
import Page from "@/pages/Frame";
import { useState } from "react";
import RegisterDialog from "./components/RegisterDialog.jsx";

function App() {
  const { user } = useAuth();
  const [showRegister, setShowRegister] = useState(false);

  if (!user) {
    return <Login onLogin={() => {}} />;
  }

  return (
    <>
      <Page onShowRegister={() => setShowRegister(true)} />
      <RegisterDialog open={showRegister} onOpenChange={setShowRegister} />
    </>
  );
}

export default App;
