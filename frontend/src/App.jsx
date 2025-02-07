import './App.css'
import {BrowserRouter, Route, Routes} from 'react-router-dom'
import { Dashboard } from './pages/Dashboard'
import { Signup } from './pages/Signup'
import { Signin } from './pages/Signin'
import { Comments } from './pages/Comments'
import Draw from './pages/Draw'
import Quiz from './pages/Quiz'
import Calendar from './pages/Calendar'
import { Recommendations } from './pages/Recommendations'
import { Map } from './pages/Map'
function App() {

return(
      <BrowserRouter>
        <Routes>
          <Route path="/dashboard" element={<Dashboard/>}></Route>
          <Route path="/signup" element={<Signup/>}></Route>
          <Route path="/signin" element={<Signin/>}></Route>
          <Route path="/draw" element={<Draw/>}></Route>
          <Route path="/quiz" element={<Quiz/>}></Route>
          <Route path="/calendar" element={<Calendar/>}></Route> 
          <Route path="/recommendations" element={<Recommendations/>}></Route>
          <Route path="/:tourId" element={<Map />} />
          <Route path="/comments" element={<Comments/>}></Route>
        </Routes>
      </BrowserRouter>
  )
}

export default App
