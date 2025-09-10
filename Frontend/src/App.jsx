import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Header/Navbar';
import CreateListingPage from './pages/CreateListingPage';
import ListingDetailsPage from './pages/ListingDetailsPage.jsx'

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/create-listing' element={<CreateListingPage />} />
          <Route path='/properties/:listingId' element={<ListingDetailsPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
