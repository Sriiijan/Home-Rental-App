import React, { useEffect, useState } from "react";
import "../styles/Listings.scss";
import { categories } from "../data.jsx";
import ListingCard from "./ListingCard.jsx";
import Loader from "./Loader.jsx";
import { useDispatch, useSelector } from "react-redux";
import axios from "axios";
import { setListings } from "../redux/authSlice.js";

const Listings = () => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);

  const [selectedCategory, setSelectedCategory] = useState("All");

  const listings = useSelector((state) => state.listings);

  const getFeedListings = async () => {
    try {
      const response = await axios.get(
        selectedCategory !== "All"
          ? `${
              import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
            }/api/v1/listing?category=${selectedCategory}`
          : `${
              import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"
            }/api/v1/listing`
      );

      const data = response.data;

      // console.log(data);

      dispatch(setListings({ listings: data.data }));

      setLoading(false);
    } catch (error) {
      // console.log("Fetch listong failed: ", error);
    }
  };

  useEffect(() => {
    getFeedListings();
  }, [selectedCategory]);

  // console.log("Listings: ", selectedCategory);

  return (
    <>
      <div className="category-list">
        {categories.map((category, index) => (
          <div
            className={`category ${selectedCategory === category.label ? 'selected' : ''}`}
            key={index}
            onClick={() => setSelectedCategory(category.label)}
          >
            <div className="category_icon">{category.icon}</div>
            <p>{category.label}</p>
          </div>
        ))}
      </div>

      {loading ? (
        <Loader />
      ) : (
        <div className="listings">
          {listings.map(
            (listing, index) => (
              <ListingCard 
                key={listing._id || index}
                listingId={listing._id}
                creator={listing.creator}
                title={listing.title}
                listingPhotos={listing.listingPhotos}
                city={listing.city}
                state={listing.state}
                country={listing.country}
                category={listing.category}
                type={listing.type}
                price={listing.price}
                booking= {false}
              />
            )
          )}
        </div>
      )}
    </>
  );
};

export default Listings;
