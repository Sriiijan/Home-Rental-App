import React, { useEffect, useState } from 'react'
import '../styles/Lists.scss'
import Loader from '../components/Loader.jsx'
import { useDispatch, useSelector } from 'react-redux'
import axios from 'axios'
import { setTripList } from '../redux/authSlice.js'
import ListingCard from '../components/ListingCard.jsx'

const TripListPage = () => {
  const [loading, setLoading] = useState(true)
  const dispatch = useDispatch()

  const tripList = useSelector((state) => state.user.tripList)
  const userId = useSelector((state) => state.user._id)

  const getTripList = async () => {
    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users/${userId}/trips`
      )

      const data = response.data.data
      dispatch(setTripList(data))
      setLoading(false)
    } catch (error) {
      console.log('Fetch Trip List failed: ', error)
      setLoading(false)
    }
  }

  useEffect(() => {
    if (userId) getTripList()
  }, [userId])

  return loading ? (
    <Loader />
  ) : (
    <>
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList?.length > 0 ? (
          tripList.map(({ listingId, startDate, endDate, totalPrice }, index) => (
            <ListingCard
              key={listingId?._id || index}
              title={listingId?.title}
              listingId={listingId?._id}
              listingPhotos={listingId?.listingPhotos}
              city={listingId?.city}
              state={listingId?.state}
              country={listingId?.country}
              startDate={new Date(startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              endDate={new Date(endDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
              totalPrice={totalPrice}
              booking={true}
            />
          ))
        ) : (
          <p>No trips booked yet.</p>
        )}
      </div>
    </>
  )
}

export default TripListPage
