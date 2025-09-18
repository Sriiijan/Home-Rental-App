import React, { useEffect, useState } from 'react'
import '../styles/ListingDetails.scss'
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { facilities } from '../data.jsx';
import Loader from '../components/Loader.jsx';
import { useSelector } from 'react-redux';

import 'react-date-range/dist/styles.css';
import 'react-date-range/dist/theme/default.css';
import { DateRange } from 'react-date-range';

const ListingDetailsPage = () => {
  const navigate = useNavigate();
  const { listingId } = useParams();
  const customerId = useSelector((state) => state?.user?._id);

  const [loading, setLoading] = useState(true);
  const [listing, setListing] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [error, setError] = useState(null);
  const [dateRange, setDateRange] = useState([
    {
      startDate: new Date(),
      endDate: new Date(Date.now() + 24 * 60 * 60 * 1000), // Tomorrow as default end date
      key: "selection"
    }
  ]);

  const getListingDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/listing/?listingId=${listingId}`
      );

      // Handle array of listings - find the specific listing by ID
      const listingsArray = response.data?.data;
      if (listingsArray && Array.isArray(listingsArray) && listingsArray.length > 0) {
        // Find the listing that matches the listingId
        const foundListing = listingsArray.find(listing => listing._id === listingId);
        
        if (foundListing) {
          setListing(foundListing);
        } else {
          // If not found by ID, use the first listing (fallback)
          setListing(listingsArray[0]);
        }
      } else {
        setError('Listing not found');
      }
    } catch (error) {
      console.error("Fetch Listing Details Failed", error);
      setError('Failed to load listing details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (listingId) {
      getListingDetails();
    }
  }, [listingId]);

  const handleSelect = (ranges) => {
    setDateRange([ranges.selection]);
  };

  // Fixed: Proper date calculation
  const start = new Date(dateRange[0].startDate);
  const end = new Date(dateRange[0].endDate);
  const dayCount = Math.max(1, Math.ceil((end - start) / (1000 * 60 * 60 * 24)));

  const handleSubmit = async () => {
    // Validation checks
    if (!customerId) {
      alert('Please login to make a booking');
      navigate('/login');
      return;
    }

    if (!listing) {
      alert('Listing information not available');
      return;
    }

    if (dayCount < 1) {
      alert('Please select valid dates');
      return;
    }

    try {
      setBookingLoading(true);
      
      const bookingForm = {
        customerId,
        listingId,
        hostId: listing.creator?._id,
        startDate: dateRange[0].startDate.toISOString(),
        endDate: dateRange[0].endDate.toISOString(),
        totalPrice: listing.price * dayCount
      };

      const config = {
        headers: {
          "Content-Type": "application/json",
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/booking/create`,
        bookingForm,
        config
      );

      if (response.data) {
        alert('Booking successful!');
        navigate('/trips');
      }
    } catch (error) {
      console.error("Error while booking: ", error);
      alert(error.response?.data?.message || 'Booking failed. Please try again.');
    } finally {
      setBookingLoading(false);
    }
  };

  // Error state
  if (error) {
    return (
      <div className="error-container">
        <h2>Error</h2>
        <p>{error}</p>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return <Loader />;
  }

  // No listing found
  if (!listing) {
    return (
      <div className="no-listing">
        <h2>Listing not found</h2>
        <button onClick={() => navigate(-1)}>Go Back</button>
      </div>
    );
  }

  return (
    <div className="listing-details">
      <div className="title">
        <h1>{listing.title}</h1>
        <div></div>
      </div>

      <div className="photos">
        {listing.listingPhotos && listing.listingPhotos.length > 0 ? (
          listing.listingPhotos.map((photo, index) => (
            <img 
              key={index} 
              src={photo} 
              alt={`${listing.title} - Photo ${index + 1}`} 
              className="listing-photo"
              onError={(e) => {
                e.target.style.display = 'none';
              }}
            />
          ))
        ) : (
          <div className="no-photos">
            <p>No photos available</p>
          </div>
        )}
      </div>
      
      <h2>{listing.type} in {listing.city}, {listing.state}</h2>
      <p>
        {listing.guestCount} guest{listing.guestCount !== 1 ? 's' : ''} • {' '}
        {listing.bedroomCount} bedroom{listing.bedroomCount !== 1 ? 's' : ''} • {' '}
        {listing.bedCount} bed{listing.bedCount !== 1 ? 's' : ''} • {' '}
        {listing.bathroomCount} bathroom{listing.bathroomCount !== 1 ? 's' : ''}
      </p>
      <hr />

      {listing.creator && (
        <>
          <div className="profile">
            <img 
              src={listing.creator.profileImage} 
              alt={`${listing.creator.firstName} ${listing.creator.lastName}`}
              onError={(e) => {
                e.target.src = '/default-avatar.png'; // Fallback image
              }}
            />
            <h3>Hosted by {listing.creator.firstName} {listing.creator.lastName}</h3>
          </div>
          <hr />
        </>
      )}

      <h3>Description</h3>
      <p>{listing.description}</p>
      <hr />

      {listing.highlight && (
        <>
          <h3>{listing.highlight}</h3>
          <p>{listing.highlightDesc}</p>
          <hr />
        </>
      )}

      <div className="booking">
        <div>
          <h2>What this place offers</h2>
          <div className="amenities">
            {listing.amenities && listing.amenities.length > 0 ? (
              listing.amenities.map((name, index) => {
                const facility = facilities.find((f) => f.name === name.trim());
                return (
                  <div className="facility" key={index}>
                    <div className="facility_icon">
                      {facility?.icon || '•'}
                    </div>
                    <p>{name.trim()}</p>
                  </div>
                );
              })
            ) : (
              <p>No amenities listed</p>
            )}
          </div>


          <div className="booking-section">
            <h2>How long do you want to stay?</h2>
            <div className="date-range-calendar">
              <DateRange 
                ranges={dateRange} 
                onChange={handleSelect}
                minDate={new Date()}
                showDateDisplay={false}
              />
              
              <div className="pricing-info">
                <h3>
                  ₹{listing.price?.toLocaleString()} ⨯ {dayCount} night{dayCount !== 1 ? 's' : ''}
                </h3>
                <h2>Total price: ₹{(listing.price * dayCount)?.toLocaleString()}</h2>
                
                <div className="date-info">
                  <p><strong>Check-in:</strong> {dateRange[0].startDate.toDateString()}</p>
                  <p><strong>Check-out:</strong> {dateRange[0].endDate.toDateString()}</p>
                </div>

                <button 
                  className="button booking-button" 
                  type='button' 
                  onClick={handleSubmit}
                  disabled={bookingLoading || !customerId}
                >
                  {bookingLoading ? 'BOOKING...' : 'RESERVE'}
                </button>
                
                {!customerId && (
                  <p className="login-prompt">Please login to make a booking</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ListingDetailsPage;