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

  // Handler for when a booking is cancelled
  const handleCancelBooking = (cancelledBookingId) => {
    // Update Redux state by removing the cancelled booking
    const updatedTripList = tripList.filter(trip => trip._id !== cancelledBookingId)
    dispatch(setTripList(updatedTripList))
  }

  useEffect(() => {
    if (userId) getTripList()
  }, [userId])

  console.log(tripList);
  
  return loading ? (
    <Loader />
  ) : (
    <>
      <h1 className="title-list">Your Trip List</h1>
      <div className="list">
        {tripList?.length > 0 ? (
          tripList.map(({ _id, listingId, startDate, endDate, totalPrice }, index) => (
            <ListingCard
              key={listingId?._id || index}
              bookingId={_id}
              title={listingId?.title}
              listingId={listingId?._id}
              category={listingId?.category}
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
              reservation={false}
              onCancelBooking={handleCancelBooking} // Add the callback
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