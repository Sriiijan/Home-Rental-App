import axios from 'axios';
import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import Loader from '../components/Loader';

const MyProfilePage = () => {
  const [loading, setLoading] = useState(true);
  const [profileData, setProfileData] = useState(null);

  const user = useSelector((state) => state.user);
  const userId = user?._id;

  const getUserProfile = async () => {
    if (!userId) {
      console.log("No User ID found");
      setLoading(false);
      return;
    }

    try {
      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1/users/userProfile/${userId}`
      );

      setProfileData(response.data.data);
      setLoading(false);
    } catch (error) {
      console.log("Error while fetching user profile: ", error);
      setLoading(false);
    }
  };

  useEffect(() => {
    getUserProfile();
  }, [userId]);

  if (loading) return <Loader />;
  if (!profileData) return <p>No profile data found</p>;

  return (
    <div style={{ padding: "30px", display: "flex", justifyContent: "center" }}>
      <div
        style={{
          width: "100%",
          maxWidth: "600px",
          background: "#fff",
          borderRadius: "12px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          padding: "25px",
        }}
      >
        {/* Profile Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "20px", marginBottom: "20px" }}>
          {profileData.profileImage ? (
            <img
              src={profileData.profileImage}
              alt={`${profileData.firstName} ${profileData.lastName}`}
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                objectFit: "cover",
                border: "3px solid #eee",
              }}
            />
          ) : (
            <div
              style={{
                width: "120px",
                height: "120px",
                borderRadius: "50%",
                background: "#ccc",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "14px",
                color: "#555",
              }}
            >
              No Photo
            </div>
          )}

          <div>
            <h2 style={{ margin: 0 }}>
              {profileData.firstName} {profileData.lastName}
            </h2>
            <p style={{ margin: "5px 0", color: "#555" }}>{profileData.email}</p>
            <p style={{ margin: "5px 0", fontSize: "14px", color: "#888" }}>
              Joined on {new Date(profileData.createdAt).toLocaleDateString()}
            </p>
          </div>
        </div>

        <hr style={{ margin: "20px 0" }} />

        {/* Stats Section */}
        <div style={{ display: "flex", justifyContent: "space-around", textAlign: "center" }}>
          <div>
            <h3 style={{ margin: 0 }}>{profileData.wishList?.length || 0}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>Wishlist</p>
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{profileData.tripList?.length || 0}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>Trips</p>
          </div>
          <div>
            <h3 style={{ margin: 0 }}>{profileData.propertyList?.length || 0}</h3>
            <p style={{ fontSize: "14px", color: "#555" }}>Properties</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
    