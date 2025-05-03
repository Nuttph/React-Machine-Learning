import React from 'react'
import HandDetector from './components/HandDetector'
import TextToVideo from './components/texttovideo/TextToVideo'

import { Routes,Route, Link } from 'react-router-dom'

const App = () => {
  return (
    <div className=''>
      <div className='flex flex-row items-center justify-center gap-4 bg-[#333]'>
        <Link className='px-4 py-2 bg-yellow-300 hover:bg-yellow-600 duration-300 rounded-lg border my-4' to={"/hand-detect"}>Hand Detect</Link>
        <Link className='px-4 py-2 bg-yellow-300 hover:bg-yellow-600 duration-300 rounded-lg border my-4' to={"/text-to-video"}>Text to Video</Link>
      </div>
      <Routes>
        <Route path="/hand-detect" element={<HandDetector/>}/>
        <Route path="/text-to-video" element={<TextToVideo/>}/>
      </Routes>
    </div>
  )
}

export default App