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
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.firstName} ${user.lastName}`}
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
              {user.firstName} {user.lastName}
            </h2>
            <p style={{ margin: "5px 0", color: "#555" }}>{user.email}</p>
          </div>
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
    </div>
  );
};

export default UserDetailsPage;
