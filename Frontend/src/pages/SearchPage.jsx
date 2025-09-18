import { useParams } from "react-router-dom";
import "../styles/Lists.scss";
import { useEffect, useState } from "react";
import Loader from "../components/Loader";
import ListingCard from "../components/ListingCard";
import axios from "axios";

const SearchPage = () => {
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState([]);
  const { search } = useParams();

  const getSearchListings = async () => {
    try {
      const { data } = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1/listing/search/${search}`
      );

      setListings(data.data);
      setLoading(false);
    } catch (err) {
      console.log("Fetch Search List failed!", err.message);
      setLoading(false);
    }
  };

  useEffect(() => {
    getSearchListings();
  }, [search]);

  console.log(listings);
  

  return loading ? (
    <Loader />
  ) : (
    <>
      <h1 className="title-list">Results for: {search}</h1>
      <div className="list">
        {listings?.length > 0 ? (
          listings.map(
            ({
              _id,
              creator,
              title,
              listingPhotos,
              city,
              state,
              country,
              category,
              type,
              price,
              booking = false,
            }) => (
              <ListingCard
                key={_id}
                listingId={_id}
                creator={creator}
                title={title}
                listingPhotos={listingPhotos}
                city={city}
                state={state}
                country={country}
                category={category}
                type={type}
                price={price}
                booking={booking}
                reservation={false}
              />
            )
          )
        ) : (
          <p>No property found for "{search}".</p>
        )}
      </div>
    </>
  );
};

export default SearchPage;
