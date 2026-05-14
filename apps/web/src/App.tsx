import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ROUTES } from "@convo/constants";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Register from "./pages/Register";

function App() {
  return (
    <Router>
      <Routes>
        <Route path={ROUTES.LOGIN} element={<Login />} />
        <Route path={ROUTES.REGISTER} element={<Register />} />
        <Route path={ROUTES.HOME} element={<Home />} />
      </Routes>
    </Router>
  );
}

export default App;
