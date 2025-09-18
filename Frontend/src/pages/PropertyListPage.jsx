import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { useSelector } from 'react-redux';
import axios from 'axios';
import Loader from '../components/Loader';
import ListingCard from '../components/ListingCard';

const PropertyListPage = () => {

    const [loading, setLoading]= useState(true);

    const [property, setProperty]= useState([]);

    const user= useSelector((state) => (state.user));
    const userId= user?._id;

    const getPropertyList= async () => {
        if (!userId) {
        console.log('No user ID found');
        setLoading(false);
        return;
        }

        try {
            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users/${userId}/propertyList`
            );

            const data = response.data.data;
            setProperty(data);
            setLoading(false);
        } catch (error) {
            console.log("Property List fetched error: ", error);
            setLoading(false);
        }
    }

  console.log("Data: ", property);
    
    useEffect(() => {
        getPropertyList()
    }, [userId])

    return loading ? (
        <Loader />
    ): (
        <div className="title-list">
            <h1 className="title-list">Your Property List</h1>
            <div className="list">
                {property.length > 0 ? (
                    property.map((propertyId) => (
                        <ListingCard
                            key={propertyId?._id}
                            title={propertyId?.title}
                            listingId={propertyId?._id}
                            category={propertyId?.category}
                            type={propertyId?.type}
                            listingPhotos={propertyId?.listingPhotos}
                            city={propertyId?.city}
                            state={propertyId?.state}
                            country={propertyId?.country}
                            price={propertyId?.price}
                        />
                    ))
                ) : (
                    <p>Your property list is empty</p>
                )}
            </div>
        </div>
    )
}

export default PropertyListPage
