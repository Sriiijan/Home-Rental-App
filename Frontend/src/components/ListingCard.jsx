import React, { useState } from "react";
import "../styles/ListingCard.scss";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";
import { useNavigate } from "react-router-dom";

const ListingCard = ({
  listingId,
  creator,
  title,
  listingPhotos,
  city,
  state,
  country,
  category,
  type,
  price,
}) => {
  // console.log("photos: " ,listingPhotos);
  const navigate= useNavigate();

  const [currentIndex, setCurrentIndex]= useState(0);

  const gotoPrevSlide= (e) => {
    e.stopPropagation();
    setCurrentIndex(
      (prevIndex) => (prevIndex -1 + listingPhotos.length) % listingPhotos.length
    )
  }

  const gotoNextSlide= (e) => {
    e.stopPropagation();
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % listingPhotos.length
    )
  }
  
  return (
    <div 
      className="listing-card"
      onClick={() => {
        navigate(`/properties/${listingId}`);
      }}
    >
      <div className="slider-container">
        <div className="slider" style={{ transform: `translateX(-${currentIndex * 100}%)`}}>
          {listingPhotos?.map((photo, index) => (
            <div key={index} className="slide">
              <img src={photo} alt={`listing photo ${index+1}`} />
              <div className="prev-button">
                <MdArrowBackIosNew sx={{fontSize: "15px"}} onClick={(e) => {gotoPrevSlide(e)}} />
              </div>
              <div className="next-button">
                <MdArrowForwardIos sx={{fontSize: "15px"}} onClick={(e) => {gotoNextSlide(e)}} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <h2>{title}</h2>
      <h3>{city}, {state}, {country}</h3>
      <p>{category}</p>
      <p>{type}</p>
      <p>
        <span>₹{price}</span> per night
      </p>
    </div>
  );
};

export default ListingCard;
