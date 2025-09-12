import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import "../styles/Lists.scss";
import ListingCard from '../components/ListingCard';
import Loader from '../components/Loader';

const WishListPage = () => {
  const [loading, setLoading] = useState(true);
  const [wishlist, setWishlist] = useState([]);
  
  // Get user from Redux state
  const user = useSelector((state) => state.user);
  const userId = user?._id;

  const getWishlists = async () => {
    if (!userId) {
      console.log('No user ID found');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users/${userId}/wishlists`
      );

      const data = response.data.data;
      setWishlist(data);
      setLoading(false);
    //   console.log("Wishlist fetched: ", data);
    } catch (error) {
      console.log('Fetch WishList failed: ', error);
      setLoading(false);
    }
  };

//   console.log("Wishlist fetched: ", wishlist.wishList);

  useEffect(() => {
    getWishlists();
  }, [userId]); // Add userId as dependency


  return loading ? (
    <Loader />
  ) : (
    <div className="title-list">
      <h1 className="title-list">Your Wish List</h1>
      <div className="list">
        {wishlist.wishList?.length > 0 ? (
            wishlist.wishList.map((listingId) => (
                <ListingCard
                    key={listingId._id}
                    title={listingId?.title}
                    listingId={listingId?._id}
                    listingPhotos={listingId?.listingPhotos}
                    city={listingId?.city}
                    state={listingId?.state}
                    country={listingId?.country}
                    price={listingId?.price}
                />
            ))
        ) : (
            <>
                <p>Your wishlist is empty</p>
            </>
        )}
      </div>
    </div>
  );
};

export default WishListPage;