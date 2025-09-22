import React, { useState } from "react";
import "../styles/ListingCard.scss";
import { MdArrowBackIosNew, MdArrowForwardIos, MdFavorite, MdDeleteForever } from "react-icons/md";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useSelector, useDispatch } from "react-redux";
import axios from "axios";
import { setWishlist } from "../redux/authSlice";

const ListingCard = ({
  listingId,
  bookingId,
  creator,
  title,
  listingPhotos = [],
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
  customerLastName,
  customerId,
  onCancelBooking // New prop for handling booking cancellation
}) => {
  const [loading, setLoading] = useState(false); // Changed to false initially
  const [isDeleting, setIsDeleting] = useState(false); // New state for deletion loading
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [currentIndex, setCurrentIndex] = useState(0);

  // Photos
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
      setCurrentIndex((prevIndex) => (prevIndex + 1) % photos.length);
    }
  };

  // Redux state
  const user = useSelector((state) => state.user);
  const wishlist = user?.wishList || [];

  const isLiked = Array.isArray(wishlist)
    ? wishlist.some((item) => {
        const itemId = typeof item === "object" ? item._id : item;
        return itemId?.toString() === listingId?.toString();
      })
    : false;

  // Wishlist patch request
  const patchWishlist = async (e) => {
    e.stopPropagation();

    if (!user?._id) {
      alert("Please login to add to wishlist");
      return;
    }

    try {
      const response = await axios.patch(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1/users/${user._id}/${listingId}`,
        {},
        {
          headers: {
            "Content-Type": "application/json",
            ...(user.token && { Authorization: `Bearer ${user.token}` }),
          },
        }
      );

      const data = response.data.data;
      if (data.user) {
        dispatch(setWishlist(data.user.wishList));
      } else if (data.wishList) {
        dispatch(setWishlist(data.wishList));
      }
    } catch (error) {
      console.error("Wishlist update failed:", error);
      alert("Failed to update wishlist. Please try again.");
    }
  };

  const cancelBooking = async (e) => {
    e.stopPropagation();

    if (!bookingId) {
      console.log('No booking ID found');
      return;
    }

    // Confirm cancellation
    if (!window.confirm('Are you sure you want to cancel this booking?')) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await axios.delete(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/booking/cancel/${bookingId}`
      );

      // Call parent callback to update the UI
      if (onCancelBooking && typeof onCancelBooking === 'function') {
        onCancelBooking(bookingId);
      }
      
      // alert('Booking cancelled successfully!');
      
    } catch (error) {
      console.error("Error while cancel booking:", error);
      alert('Failed to cancel booking. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div
      className="listing-card"
      onClick={() => {
        if (!reservation) {
          navigate(`/properties/${listingId}`);
        }
      }}
    >
      {/* Slider */}
      <div className="slider-container">
        {hasPhotos ? (
          <div
            className="slider"
            style={{ transform: `translateX(-${currentIndex * 100}%)` }}
          >
            {photos.map((photo, index) => (
              <div key={index} className="slide">
                <img
                  src={photo}
                  alt={`${title || "listing"} photo ${index + 1}`}
                  onError={(e) => (e.target.style.display = "none")}
                />
                {photos.length > 1 && (
                  <>
                    <div className="prev-button">
                      <MdArrowBackIosNew
                        style={{ fontSize: "15px" }}
                        onClick={gotoPrevSlide}
                      />
                    </div>
                    <div className="next-button">
                      <MdArrowForwardIos
                        style={{ fontSize: "15px" }}
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

      {/* Info */}
      <h2>{title || "Untitled Listing"}</h2>
      <h3>
        {city || "Unknown"}, {state || "Unknown"}, {country || "Unknown"}
      </h3>
      <p>{category || "Uncategorized"}</p>

      {/* Reservation Info */}
      {reservation ? (
        <Link
          to={`/user/${customerId}`}
          style={{ textDecoration: "none", color: "inherit" }}
          onClick={(e) => e.stopPropagation()} // stop card navigation
        >
          <div className="reserved-info">
            <p>
              Reserved by <strong>{customerFirstName} {customerLastName}</strong>
            </p>
          </div>
        </Link>
      ) : null}

      {/* Booking Info */}
      {booking ? (
        <>
          <p>
            {startDate} - {endDate}
          </p>
          <p>
            <span>₹{totalPrice?.toLocaleString()}</span> total
          </p>
          {/* cancel booking */}
          {!reservation ? (
            <button 
            onClick={cancelBooking} 
            disabled={!user || isDeleting} 
            className={`cancel-booking-btn ${isDeleting ? 'deleting' : ''}`}
            title="Cancel booking"
          >
            <MdDeleteForever 
              style={{ 
                color: isDeleting ? "gray" : "red", 
                fontSize: "24px" 
              }} 
            />
            {isDeleting && <span className="loading-text">Cancelling...</span>}
          </button>
          ) : (null)}
        </>
      ) : (
        <>
          <p>{type || "Property"}</p>
          <p>
            <span>₹{price?.toLocaleString()}</span> per night
          </p>
          <button
            className="favorite"
            onClick={patchWishlist}
            disabled={!user}
            aria-label={isLiked ? "Remove from wishlist" : "Add to wishlist"}
          >
            <MdFavorite style={{ color: isLiked ? "red" : "white" }} />
          </button>
        </>
      )}
    </div>
  );
};

export default ListingCard;