import {BrowserRouter, Routes, Route} from 'react-router-dom';
import './App.css'
import HomePage from './pages/HomePage';
import RegisterPage from './pages/RegisterPage';
import LoginPage from './pages/LoginPage';
import Navbar from './components/Header/Navbar';
import CreateListingPage from './pages/CreateListingPage';
import ListingDetailsPage from './pages/ListingDetailsPage.jsx';
import TripListPage from './pages/TripListPage.jsx';
import WishListPage from './pages/WishListPage.jsx';
import PropertyListPage from './pages/PropertyListPage.jsx';
import Footer from './components/Footer/Footer.jsx';
import ReservationPage from './pages/ReservationPage.jsx';
import SearchPage from './pages/SearchPage.jsx';
import UserDetailsPage from './pages/UserDetailsPage.jsx';
import MyProfilePagfe from './pages/MyProfilePage.jsx';

function App() {

  return (
    <>
      <BrowserRouter>
        <Navbar />
        <Routes>
          <Route path='/' element={<HomePage />} />
          <Route path='/properties/search/:search' element={<SearchPage />} />
          <Route path='/register' element={<RegisterPage />} />
          <Route path='/login' element={<LoginPage />} />
          <Route path='/create-listing' element={<CreateListingPage />} />
          <Route path='/properties/:listingId' element={<ListingDetailsPage />} />
          <Route path='/trips' element={<TripListPage />} />
          <Route path='/wishlists' element={<WishListPage />} />
          <Route path='/propertyList' element={<PropertyListPage />} />
          <Route path='/reservationList' element={<ReservationPage />} />
          <Route path='/user/:userId' element={<UserDetailsPage />} />
          <Route path='/profile' element={<MyProfilePagfe />} />
          {/* <Route path='/cancel/:bookingId' element={< />} /> */}
        </Routes>
        <Footer />
      </BrowserRouter>
    </>
  )
}

export default App