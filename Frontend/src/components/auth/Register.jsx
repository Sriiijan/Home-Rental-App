import React, { useState, useEffect } from 'react'
import "../../styles/Register.scss"
import addImage from "../../assets/addImage.png";
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Register = () => {
    const [formData, setFormData] = useState({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        confirmPassword: "",
        profileImage: null
    });
    const [passwordMatch, setPasswordMatch] = useState(true);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        setFormData({
            ...formData,
            [name]: name === "profileImage" ? files[0] : value
        });
    }

    // console.log("Form Data: ", formData);

    useEffect(() => {
        setPasswordMatch(
            formData.password === formData.confirmPassword || formData.confirmPassword === ""
        );
    }, [formData.password, formData.confirmPassword]);
    
    const handleSubmit = async (e) => {
        e.preventDefault();
        
        // Validate passwords match before submission
        if (formData.password !== formData.confirmPassword) {
            setError("Passwords do not match!");
            return;
        }

        // Validate all required fields
        if (!formData.firstName || !formData.lastName || !formData.email || 
            !formData.password || !formData.profileImage) {
            setError("All fields are required!");
            return;
        }

        setLoading(true);
        setError("");

        try {
            const registerForm = new FormData();

            // Only append the fields that the backend expects
            registerForm.append('firstName', formData.firstName);
            registerForm.append('lastName', formData.lastName);
            registerForm.append('email', formData.email);
            registerForm.append('password', formData.password);
            registerForm.append('profileImage', formData.profileImage);

            const config = {
                headers: {
                    "Content-Type": "multipart/form-data",
                },
            };

            // console.log("Submitting registration form...");

            const response = await axios.post(
                `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/users/register`,
                registerForm,
                config
            );

            // console.log("Registration successful:", response.data);
            navigate("/login");
            
        } catch (error) {
            console.log("Registration Error: ", error);
            
            // Handle different types of errors
            if (error.response) {
              const { status, data } = error.response;
              
              if (status === 409) {
                  // User already exists
                  setError("An account with this email already exists.");
                  setUserExistsError(true);
              } else if (status === 400) {
                  // Bad request
                  setError(data.message || "Please check all required fields and try again.");
              }
            }
            else if (error.request && error.code === 'ERR_NETWORK') {
                // Network error but user might be created - redirect anyway
                console.log("Network error occurred, but user might be created. Redirecting to login...");
                navigate("/login");
                return;
            } else {
                // Other error
                setError("An unexpected error occurred.");
            }
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className='register'>
            <div className='register_content'>
                <form className="register_content_form" onSubmit={handleSubmit}>
                    <input
                        placeholder='First Name'
                        name='firstName'
                        value={formData.firstName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        placeholder='Last Name'
                        name='lastName'
                        value={formData.lastName}
                        onChange={handleChange}
                        required
                    />
                    <input
                        placeholder='Email'
                        name='email'
                        type='email'
                        value={formData.email}
                        onChange={handleChange}
                        required
                    />
                    <input
                        placeholder='Password'
                        name='password'
                        type='password'
                        value={formData.password}
                        onChange={handleChange}
                        required
                    />
                    <input
                        placeholder='Confirm Password'
                        name='confirmPassword'
                        type='password'
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    {!passwordMatch && (
                        <p style={{color: "red"}}>Passwords do not match!</p>
                    )}

                    {error && (
                        <p style={{color: "red"}}>{error}</p>
                    )}

                    <input
                        id='image'
                        type="file"
                        name="profileImage"
                        accept='image/*'
                        style={{display: 'none'}}
                        onChange={handleChange}
                    />
                    <label htmlFor="image" style={{ cursor: 'pointer' }}>
                        <img src={addImage} alt='add profile photo' />
                        <p>Upload your Photo</p>
                    </label>

                    {!formData.profileImage && (
                        <p style={{color: "red", fontSize: "12px"}}>
                            Profile image is required
                        </p>
                    )}

                    {formData.profileImage && (
                        <img 
                            src={URL.createObjectURL(formData.profileImage)}
                            alt='Profile Photo'
                            style={{maxWidth: "80px"}}
                        />
                    )}

                    <button 
                        type='submit' 
                        className="register-button"
                        disabled={!passwordMatch || loading}
                    >
                        {loading ? (<div className="spinner"></div>) : "REGISTER"}
                    </button>
                </form>
                <a href="/login">Already have an account? Log In here</a>
            </div>
        </div>
    )
}

export default Register