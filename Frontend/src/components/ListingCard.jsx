import React, { useState } from "react";
import "../styles/ListingCard.scss";
import { MdArrowBackIosNew, MdArrowForwardIos } from "react-icons/md";

const ListingCard = ({
  creator,
  listingPhotos,
  city,
  state,
  country,
  category,
  type,
  price,
}) => {
  // console.log("photos: " ,listingPhotos);

  const [currentIndex, setCurrentIndex]= useState(0);

  const gotoPrevSlide= () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex -1 + listingPhotos.length) % listingPhotos.length
    )
  }

  const gotoNextSlide= () => {
    setCurrentIndex(
      (prevIndex) => (prevIndex + 1) % listingPhotos.length
    )
  }
  
  return (
    <div className="listing-card">
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

      <h3>{city}, {state}, {country}</h3>
      <p>{category}</p>
      <p>{type}</p>
      <p>₹{price} per night</p>
    </div>
  );
};

export default ListingCard;
