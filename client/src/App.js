import React, { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import 'react-toastify/dist/ReactToastify.css'; // Import default CSS for toastify

import Header from "./pages/Login-SignUp/components/Header";
// import Add from "./pages/Add";
import BookAddition from "./pages/addBook";
import MyBooksPage from "./pages/myBooks";
import BookList from "./pages/BookList";
import UserProfile from "./pages/Login-SignUp/pages/UserProfile";
import LandingScreen from "./pages/Login-SignUp/pages/LandingScreen";
import Dashboard from "./pages/Dashboard/Dashboard";
import ProtectedRoute from "./pages/Security/protectedRoute"; // Import the ProtectedRoute component

import ClubList from "./pages/Dashboard/clubs/clubList"
import ClubCreation from "./pages/Dashboard/clubs/createClub"
import MemberList from "./pages/Dashboard/ClubAdmin/memberList"

import UsersList from "./pages/Dashboard/SuperAdmin-users/userList"
import AddUser from "./pages/Dashboard/SuperAdmin-users/addUser"

const Login = lazy(() => import("./pages/Login-SignUp/pages/Login"));
const NotFound = lazy(() => import("./pages/Login-SignUp/pages/NotFound"));

const App = () => {
  return (
    <div className="app">
      <Router>
        <Header />
        <Suspense fallback={<div>Loading...</div>}>
          <Routes>
            <Route path="/" element={<LandingScreen />} />
            <Route path="/login" element={<Login />} />
            <Route path="*" element={<NotFound />} />
            <Route path="/my-books" element={<ProtectedRoute><MyBooksPage /></ProtectedRoute>} />
            <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
            <Route path="/add-book" element={<ProtectedRoute><BookAddition /></ProtectedRoute>} />
            <Route path="/books-list" element={<ProtectedRoute><BookList /></ProtectedRoute>} />
            {/* <Route path="/add" element={<ProtectedRoute><Add /></ProtectedRoute>} /> */}
            <Route path="/userProfile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
            <Route path="/clubList" element={<ProtectedRoute><ClubList /></ProtectedRoute>} />
            <Route path="/createClub" element={<ProtectedRoute><ClubCreation /></ProtectedRoute>} />
            <Route path="/usersList" element={<ProtectedRoute><UsersList /></ProtectedRoute>} />
            <Route path="/addUser" element={<ProtectedRoute><AddUser /></ProtectedRoute>} />
            <Route path="/clubMembers" element={<ProtectedRoute><MemberList /></ProtectedRoute>} />
          </Routes>
        </Suspense>
        <ToastContainer 
          position="top-center" 
          autoClose={1000} 
          hideProgressBar={true} 
          closeOnClick 
          theme="colored" 
        />
      </Router>
    </div>
  );
};

export default App;