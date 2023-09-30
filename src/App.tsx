import { Route, Routes } from 'react-router-dom'
import Diff from './routes/Diff'

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Diff />} />
        <Route path="*" element={<>No such route on frontend</>} />
      </Routes>
    </>
  )
}

export default App
