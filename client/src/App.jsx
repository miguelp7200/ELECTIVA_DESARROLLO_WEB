import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./Hooks/AuthContext";
import ProtectedRoute from "./Hooks/ProtectedRoute";
import Busqueda from "./Components/Busqueda";
import Login from "./Components/Login";

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route 
            path="/BusquedaAudios" 
            element={
              <ProtectedRoute>
                <Busqueda />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
