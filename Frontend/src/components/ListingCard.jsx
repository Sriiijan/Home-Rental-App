import React, { useState } from "react";
import "../styles/ListingCard.scss";
import { MdArrowBackIosNew, MdArrowForwardIos, MdFavorite } from "react-icons/md";
import { useNavigate } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setWishlist } from "../redux/authSlice";

const ListingCard = ({
  listingId,
  creator,
  title,
  listingPhotos = [], // Default empty array
  city,
  state,
  country,
  category,
  type,
  price,
  startDate,
  endDate,
  totalPrice,
  booking,
  reservation,
  customerFirstName,
  customerLastName
}) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const [currentIndex, setCurrentIndex] = useState(0);

  // Safe photo handling
  const photos = Array.isArray(listingPhotos) ? listingPhotos : [];
  const hasPhotos = photos.length > 0;

  const gotoPrevSlide = (e) => {
    e.stopPropagation();
    if (hasPhotos) {
      setCurrentIndex(
        (prevIndex) => (prevIndex - 1 + photos.length) % photos.length
      );
    }
  };

  const gotoNextSlide = (e) => {
    e.stopPropagation();
    if (hasPhotos) {
      setCurrentIndex(
        (prevIndex) => (prevIndex + 1) % photos.length
      );
    }
  };

  // Get user and wishlist from Redux state
  const user = useSelector((state) => state.user);
  
  // FIXED: Access wishList with capital L to match your backend
  const wishlist = user?.wishList || [];

  // FIXED: Better wishlist checking
  const isLiked = Array.isArray(wishlist) 
    ? wishlist.some((item) => {
        // Handle both populated objects and ObjectIds
        const itemId = typeof item === 'object' ? item._id : item;
        return itemId?.toString() === listingId?.toString();
      })
    : false;

  const patchWishlist = async (e) => {
    e.stopPropagation(); // Prevent card navigation
    
    if (!user?._id) {
      alert('Please login to add to wishlist');
      return;
    }

    try {
      console.log('Making wishlist request:', {
        userId: user._id,
        listingId,
        url: `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users/${user._id}/${listingId}`
      });

      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users/${user._id}/${listingId}`,
        {}, // Empty body
        {
          headers: {
            "Content-Type": "application/json",
            // Add authorization if you have token-based auth
            ...(user.token && { "Authorization": `Bearer ${user.token}` })
          },
        }
      );

      console.log('Wishlist response:', response.data);

      // FIXED: Update Redux state with the correct data structure
      const data = response.data.data;
      
      // Update the entire user object or just the wishList
      if (data.user) {
        // If backend returns full user, dispatch that
        dispatch(setWishlist(data.user.wishList));
      } else if (data.wishList) {
        // If backend returns just wishList, dispatch that
        dispatch(setWishlist(data.wishList));
      }

    } catch (error) {
      console.error('Wishlist update failed:', error);
      
      // Better error handling
      if (error.response) {
        console.error('Error response:', error.response.data);
        alert(`Failed to update wishlist: ${error.response.data.message || 'Please try again.'}`);
      } else if (error.request) {
        console.error('Network error:', error.request);
        alert('Network error. Please check your connection.');
      } else {
        console.error('Error:', error.message);
        alert('Failed to update wishlist. Please try again.');
      }
    }
  };
  
  return (
    <div 
      className="listing-card"
      onClick={() => {
        if (reservation) {
          // navigate(`/reservations/${reservation._id}`); // Reservation page
        } else {
          navigate(`/properties/${listingId}`); // Property page
        }
      }}
    >
      <div className="slider-container">
        {hasPhotos ? (
          <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)` }}>
            {photos.map((photo, index) => (
              <div key={index} className="slide">
                <img 
                  src={photo} 
                  alt={`${title || 'listing'} photo ${index + 1}`}
                  onError={(e) => {
                    e.target.style.display = 'none'; // Hide broken images
                  }}
                />
                {/* Only show arrows if there are multiple photos */}
                {photos.length > 1 && (
                  <>
                    <div className="prev-button">
                      <MdArrowBackIosNew 
                        style={{fontSize: "15px"}} 
                        onClick={gotoPrevSlide} 
                      />
                    </div>
                    <div className="next-button">
                      <MdArrowForwardIos 
                        style={{fontSize: "15px"}} 
                        onClick={gotoNextSlide} 
                      />
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="no-photos-placeholder">
            <span>📸 No Photos Available</span>
          </div>
          
        )}
      </div>

      <h2>{title || 'Untitled Listing'}</h2>
      <h3>
        {city || 'Unknown'}, {state || 'Unknown'}, {country || 'Unknown'}
      </h3>
      <p>{category || 'Uncategorized'}</p>
      {reservation ? (
        <p>Reserverd by {customerFirstName} {customerLastName}</p> 
      ) : (
        <></>
      )}

      {booking ? (
        <>
          <p>{startDate} - {endDate}</p>
          <p>
            <span>₹{totalPrice?.toLocaleString()}</span> total
          </p>
        </>
      ) : (
        <>
          <p>{type || 'Property'}</p>
          <p>
            <span>₹{price?.toLocaleString()}</span> per night
          </p>
          <button 
            className="favorite" 
            onClick={patchWishlist} 
            disabled={!user}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <MdFavorite 
              style={{
                color: isLiked ? "red" : "white",
              }} 
            />
          </button>
        </>
      )}
      
    </div>
  );
};

export default ListingCard;