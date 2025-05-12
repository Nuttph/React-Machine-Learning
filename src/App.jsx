import { Route, Routes } from "react-router-dom"
import FirstPage from "./components/FirstPage/FirstPage"
import Cookie from "./components/layout/Cookie"
import Navbar from "./components/layout/Navbar"
import CheckDevice from "./components/Check/CheckDevice"

const App = () => {
  return (
    <div className="bg-[#EAEAEA] min-h-screen">
      <div className="pt-[30px]">
        <Navbar/>
      </div>
        <Routes>
          <Route path="/" element={<FirstPage />} />
          <Route path="/check-device" element={<CheckDevice />} />
        </Routes>
      <Cookie/>
    </div>
  )
}

export default App