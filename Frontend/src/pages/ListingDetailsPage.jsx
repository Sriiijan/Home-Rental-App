import React, { useEffect, useState } from 'react'
import '../styles/ListingDetails.scss'
import { data, useParams } from 'react-router-dom';
import axios from 'axios';
import { facilities } from '../data.jsx';
import Loader from '../components/Loader.jsx';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRange } from 'react-date-range';

const ListingDetailsPage = () => {

  const [loading, setLoading]= useState(true);

  const {listingId}= useParams();
  const [listing, setListing]= useState(null)

  const getListingDetails= async () => {
    try {
        const response= await axios.get(
            `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/listing/?listingId=${listingId}`
        )

        const list= response.data.data[0];
        setListing(list)
        setLoading(false);
    } catch (error) {
        console.log("Fetch Listing Details Failed", error);
    }
  }

  useEffect(() => {
    getListingDetails()
    
  }, [])

  const [dateRange, setDateRange]= useState([
    {
        startDate: new Date(),
        endDate: new Date(),
        key: "selection"
    }
  ])

  const handleSelect= (ranges) => {
    // Update the selected date range when user makes a selection
    setDateRange([ranges.selection])
  }

  const start= new Date(dateRange[0].startDate)
  const end= new Date(dateRange[0].endDate)
  const dayCount= Math.round(end - start) / (1000 * 60 * 60 * 24)


//   console.log("RESPONSE: ", listing);
//   console.log("TITLE: ", listing?.title);
  
  
  return loading ? <Loader /> : (
    <>
        <div className="listing-details">
        <div className="title">
            <h1>{listing?.title}</h1>
            <div></div>
        </div>

        <div className="photos">
            {listing?.listingPhotos && listing.listingPhotos.length > 0 ? (
                listing.listingPhotos.map((photo, index) => (
                <img 
                    key={index} 
                    src={photo} 
                    alt={`Listing photo ${index + 1}`} 
                    className="listing-photo"
                />
                ))
            ) : (
                <p>No photos available</p>
            )}
        </div>
        
        <h2>{listing?.type} in {listing?.city}, {listing?.state}</h2>
        <p>{listing?.guestCount} guests - {listing?.bedroomCount} bedroom - {listing?.bedCount} bed - {listing?.bathroomCount} bath</p>
        <hr />

        <div className="profile">
            <img src={listing?.creator?.profileImage} alt="image" />
            <h3>Hosted by {listing?.creator.firstName} {listing?.creator.lastName}</h3>
        </div>
        <hr />

        <h3>Description</h3>
        <p>{listing?.description}</p>
        <hr />

        <h3>{listing?.highlight}</h3>
        <p>{listing?.highlightDesc}</p>
        <hr />

        <div className="booking">
            <div>
                <h2>What this place offers?</h2>
                <div className="amenities">
                    {listing?.amenities?.length > 0 &&
                        listing.amenities[0]
                        .split(",") // because you’re storing amenities as a single string
                        .map((name, index) => {
                            const facility = facilities.find((f) => f.name === name);
                            return (
                            <div className="facility" key={index}>
                                <div className="facility_icon">{facility?.icon}</div>
                                <p>{name}</p>
                            </div>
                            );
                        })}
                </div>

                <div>
                    <h2>How long do you want to stay?</h2>
                    <div className="date-range-calendar">
                        <DateRange ranges={dateRange} onChange={handleSelect}/>
                        {dayCount > 1 ? (
                            <h2>{listing?.price} ⨯ {dayCount} nights</h2>
                        ) : (
                            <h2>{listing?.price} ⨯ {dayCount} night</h2>
                        )}
                        <h2>Total price: ₹{listing?.price * dayCount}</h2>
                        <p>Start Date: {dateRange[0].startDate.toDateString()}</p>
                        <p>End Date: {dateRange[0].endDate.toDateString()}</p>

                        <button className="button" type='submit'>BOOKING</button>
                    </div>
                </div>
            </div>
        </div>
        </div>
    </>
  )
}

export default ListingDetailsPage