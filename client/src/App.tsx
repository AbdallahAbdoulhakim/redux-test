import LoginPage from "./components/LoginPage";
import { Navbar } from "./components/Navbar";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

function App() {
  return (
    <Router>
      <Navbar />
      <div className=""></div>
      <Routes>
        <Route path="/" element={<div>Main</div>}></Route>
        <Route path="/login" element={<LoginPage />}></Route>
        <Route path="/posts" element={<div>Posts</div>}></Route>
        <Route path="/users" element={<div>Users</div>}></Route>
        <Route path="/blog" element={<div>Blog</div>}></Route>
      </Routes>
    </Router>
  );
}

export default App;
