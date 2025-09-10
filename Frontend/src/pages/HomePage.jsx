import React from 'react'
import Slide from '../components/Slide.jsx'
import Categories from '../components/Categories.jsx'
import Listings from '../components/Listings.jsx'

const HomePage = () => {
  return (
    <div>
      <Slide />
      <Categories />
      <Listings />
    </div>
  )
}

export default HomePage
