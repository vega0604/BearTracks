import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Landing from '@pages/Landing';
import Map from '@pages/Map';
import './index.css'

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path='/' element={<Map />}/>
        <Route path='/map' element={<Map />}/>
      </Routes>
    </BrowserRouter>
  )
}

export default App;