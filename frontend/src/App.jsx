import { BrowserRouter, Routes, Route } from 'react-router-dom';
import './index.css'

function App() {

  return (
    <BrowserRouter>
      <Routes>
        {/* <Route path='/' element={<Layout />}>
          <Route path='' element={<Home />}/>
          <Route path='about' element={<About />}/>
          <Route path='tools' element={<Tools />}/>
          <Route path='contact' element={<Contact />}/>
        </Route> */}
      </Routes>
    </BrowserRouter>
  )
}

export default App;