import react from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Students from './pages/Students'
import Submission from './pages/Submission'
import ProtectedRoute from './components/ProtectedRoute'

function Logout() {
  localStorage.clear()
  return <Navigate to='/login' />
}

function RegisterAndLogout() {
  localStorage.clear()
  return <Register />
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route path='/login' element={<Login />}/>
        <Route path='/logout' element={<Logout />}/>
        <Route path='/register' element={<RegisterAndLogout />}/>
        <Route 
          path='/assignment/:assignment_id/:course_id/students' 
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />  
        <Route 
          path='/submission/:submission_id/grading' 
          element={
            <ProtectedRoute>
              <Submission />
            </ProtectedRoute>
          }
        />  
        <Route path='*' element={<NotFound />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App
