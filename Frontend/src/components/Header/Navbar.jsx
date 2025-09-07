import React, { use } from 'react';
import logo from '../../assets/logo.png';
import {IconButton} from '@mui/material'
import {Person, Search, Menu} from '@mui/icons-material'
import variables from '../../styles/Variables.module.scss';
import {useSelector, useDispatch} from 'react-redux'
import "../../styles/Navbar.scss"
import {Link} from 'react-router-dom'
import { useState } from 'react';
import {setLogout} from '../../redux/authSlice.js'

const Navbar = () => {
  const user = useSelector((state) => state.user)
  const [dropdownMenu, setDropdownMenu] = useState(false);
  const dispatch= useDispatch();
  
  return (
    <div className='navbar'>
      <a href="/">
        <img src={logo} alt="logo" />
      </a>

      <div className='navbar_search'>
        <input type='text' placeholder='Search...' />
        <IconButton>
          <Search sx={{color: variables.pinkred}}/>
        </IconButton>
      </div>

      <div className='navbar_right'>
        {user ? (
          <a href="/create-listing" className='host'>Become A Host</a>
        ) : (
          <a href="/login" className='host'>Become A Host</a>
        )}

        <button className="navbar_right_account" onClick={() => setDropdownMenu(!dropdownMenu)}>
          <Menu sx={{ color: variables.darkgrey }} />
          {!user ? (
            <Person sx={{color: variables.darkgrey}}/>
          ) : (
            <img 
              src={user.profileImage} 
              alt='profile photo' 
              style={{
                objectFit: "cover", 
                borderRadius: "50%",
                width: "30px",
                height: "30px"
              }}
            />
          )}
        </button>

        {dropdownMenu && !user && (
          <div className="navbar_right_accountmenu">
            <Link to={"/login"}> Log In</Link>
            <Link to={"/register"}>Register</Link>
          </div>
        )}

        {dropdownMenu && user && (
          <div className="navbar_right_accountmenu">
            <Link to="">Trip List</Link>
            <Link to="">Wish List</Link>
            <Link to="">Property List</Link>
            <Link to="">Reservation List</Link>
            <Link to="">Become A Host</Link>

            <Link to="/login" onClick={() => {dispatch(setLogout())}}>Log Out</Link>
          </div>
        )}

      </div>
    </div>
  )
}

export default Navbar