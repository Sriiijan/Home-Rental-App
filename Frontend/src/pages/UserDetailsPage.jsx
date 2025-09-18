import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import Loader from "../components/Loader";

const UserDetailsPage = () => {
  const { userId } = useParams(); // userId from /user/:userId route
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [error, setError] = useState("");

  const getUser = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await axios.get(
        `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/api/v1/users/user/${userId}`
      );

      setUser(response.data.data); 
    } catch (err) {
      console.error("Failed to fetch user:", err);
      setError("Failed to load user details. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      getUser();
    }
  }, [userId]);

  if (loading) return <p>Loading user details...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <p>No user found</p>;

  return loading ? (<Loader />) : (
    <div style={{ padding: "20px" }}>
      <h1>Customer Details</h1>

      <div
        style={{
          border: "1px solid #ddd",
          padding: "15px",
          borderRadius: "8px",
          maxWidth: "400px",
          textAlign: "center",
        }}
      >
        {/* Profile Photo */}
        {user.profileImage ? (
          <img
            src={user.profileImage}
            alt={`${user.firstName} ${user.lastName}`}
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              objectFit: "cover",
              marginBottom: "15px",
            }}
          />
        ) : (
          <div
            style={{
              width: "120px",
              height: "120px",
              borderRadius: "50%",
              background: "#ccc",
              margin: "0 auto 15px auto",
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

        <p>
          <strong>Name:</strong> {user.firstName} {user.lastName}
        </p>
        <p>
          <strong>Email:</strong> {user.email}
        </p>
      </div>

      <button
        style={{
          marginTop: "20px",
          padding: "10px 20px",
          backgroundColor: "#007bff",
          color: "white",
          border: "none",
          borderRadius: "5px",
          cursor: "pointer",
        }}
        onClick={() => (window.location.href = `mailto:${user.email}`)}
      >
        Contact User
      </button>
    </div>
  );
};

export default UserDetailsPage;
