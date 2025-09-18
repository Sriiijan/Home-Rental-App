import axios from 'axios';
import React from 'react'
import { useEffect } from 'react';
import { useState } from 'react'
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';
import ListingCard from '../components/ListingCard';

const ReservationPage = () => {

    const [loading, setLoading]= useState(true);
    const [reservation, setReservation]= useState([]);

    const host= useSelector((state) => (state.user));
    const hostId= host?._id;

    const getReservationList= async () => {
        try {
            if (!hostId) {
                console.log('No host ID found');
                setLoading(false);
                return;
            }

            const response = await axios.get(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/booking/${hostId}/reservations`
            );
            const data= response.data.data;
            setReservation(data);
            setLoading(false);
        } catch (error) {
            console.log("Reservation list fetchig failed: ", error);
            setLoading(false);
        }

    }

    console.log("Data: ", reservation);

    useEffect(() => {
        getReservationList()
    }, [hostId])
    

    return loading ? (
        <Loader />
    ) : (
        <div>
            <h1 className="title-list">Your Reservation List</h1>
            <div className="list">
                {reservation.length > 0 ? (
                    reservation.map((res) => (
                        <ListingCard
                        key={res._id}
                        listingId={res.listingId?._id}
                        creator={res.hostId?._id}
                        customerFirstName={res.customerId?.firstName}
                        customerLastName={res.customerId?.lastName}
                        customerId={res?.customerId?._id}
                        title={res.listingId?.title}
                        listingPhotos={res?.listingId?.listingPhotos}
                        city={res.listingId?.city}
                        state={res.listingId?.state}
                        country={res.listingId?.country}
                        category={res.listingId?.category}
                        startDate={new Date(res.startDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                        endDate={new Date(res.endDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                        })}
                        totalPrice={res.totalPrice}
                        booking={true}
                        reservation={true}
                        />
                    ))
                ) : (
                    <p>Your reservation list is empty</p>
                )}
            </div>
        </div>
    )
}

export default ReservationPage
