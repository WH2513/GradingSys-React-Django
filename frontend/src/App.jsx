import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Login from './pages/Login'
import Home from './pages/Home'
import Register from './pages/Register'
import NotFound from './pages/NotFound'
import Students from './pages/Students'
import Submission from './pages/Submission'
import MyGrade from './pages/MyGrade'
import ProtectedRoute from './components/ProtectedRoute'
import AssignmentCreationEdition from './pages/AssignmentCreateionEdition'

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
      <Routes>
        <Route
          path='/'
          element={
            <ProtectedRoute>
              <Home />
            </ProtectedRoute>
          }
        />
        <Route
          path='/student'
          element={
            <ProtectedRoute>
              <MyGrade />
            </ProtectedRoute>
          }
        />
        <Route path='/login' element={<Login />}/>
        <Route path='/logout' element={<Logout />}/>
        <Route path='/register' element={<RegisterAndLogout />}/>
        <Route path='/assignments/create' element={<AssignmentCreationEdition />} />
        <Route 
          path='/assignment/submissions' 
          element={
            <ProtectedRoute>
              <Students />
            </ProtectedRoute>
          }
        />  
        <Route 
          path='/submission/grading' 
          element={
            <ProtectedRoute>
              <Submission />
            </ProtectedRoute>
          }
        />  
        <Route path='*' element={<NotFound />}/>
      </Routes>
  )
}

export default App
