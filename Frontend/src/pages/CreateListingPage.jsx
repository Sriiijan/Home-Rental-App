import React, { useState } from "react";
import "../styles/CreateListing.scss";
import { categories, facilities, types } from "../data.jsx";
import { RemoveCircleOutline, AddCircleOutline } from "@mui/icons-material";
import variables from "../styles/Variables.module.scss";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { IoIosImages } from "react-icons/io";
import { BiTrash } from "react-icons/bi";
import { useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import Loader from '../components/Loader.jsx';

const CreateListingPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false); // Fixed: should start as false
  const [error, setError] = useState(null); // Added error state
  
  // Form states
  const [category, setCategory] = useState("");
  const [type, setType] = useState("");

  const [formLocation, setFormLocation] = useState({
    address: "",
    city: "",
    pincode: "",
    state: "",
    country: ""
  });

  const [guestCount, setGuestCount] = useState(1);
  const [bedroomCount, setBedroomCount] = useState(1);
  const [bedCount, setBedCount] = useState(1);
  const [bathroomCount, setBathroomCount] = useState(1);

  const [amenities, setAmenities] = useState([]); // Fixed typo: setAminities -> setAmenities
  const [photos, setPhotos] = useState([]);

  const [formDescription, setFormDescription] = useState({
    title: "",
    description: "",
    highlight: "",
    highlightDesc: "",
    price: 0
  });

  const creatorId = useSelector((state) => state.user._id);

  // Handlers
  const handleChangeLocation = (e) => {
    const { name, value } = e.target;
    setFormLocation({
      ...formLocation,
      [name]: value
    });
  };

  const handleSelectAmenities = (facility) => { // Fixed typo in function name
    if (amenities.includes(facility)) {
      setAmenities((prevAmenities) => 
        prevAmenities.filter((option) => option !== facility)
      );
    } else {
      setAmenities((prev) => [...prev, facility]);
    }
  };

  const handleUploadPhotos = (e) => {
    const newPhotos = Array.from(e.target.files); // Convert FileList to Array
    setPhotos((prevPhotos) => [...prevPhotos, ...newPhotos]);
  };

  const handleDragPhotos = (result) => { // Fixed typo in function name
    if (!result.destination) return;

    const items = Array.from(photos);
    const [reorderedItem] = items.splice(result.source.index, 1); // Fixed typo: recordedItem -> reorderedItem
    items.splice(result.destination.index, 0, reorderedItem);

    setPhotos(items);
  };

  const handleRemovePhoto = (indexToRemove) => { // Fixed typo in function name
    setPhotos((prevPhotos) =>
      prevPhotos.filter((_, index) => index !== indexToRemove)
    );
  };

  const handleChangeDescription = (e) => {
    const { name, value } = e.target;
    setFormDescription({
      ...formDescription,
      [name]: value
    });
  };

  // Form validation
  const validateForm = () => {
    if (!category) {
      setError("Please select a category");
      return false;
    }
    if (!type) {
      setError("Please select a property type");
      return false;
    }
    if (!formLocation.address || !formLocation.city || !formLocation.pincode || 
        !formLocation.state || !formLocation.country) {
      setError("Please fill in all location fields");
      return false;
    }
    if (photos.length === 0) {
      setError("Please upload at least one photo");
      return false;
    }
    if (!formDescription.title || !formDescription.description || 
        !formDescription.highlight || !formDescription.highlightDesc) {
      setError("Please fill in all description fields");
      return false;
    }
    if (formDescription.price <= 0) {
      setError("Please set a valid price");
      return false;
    }
    return true;
  };

  const handlePost = async (e) => {
    e.preventDefault();
    setError(null);

    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      const listingForm = new FormData();

      // Append basic data
      listingForm.append("creator", creatorId);
      listingForm.append("category", category);
      listingForm.append("type", type);
      listingForm.append("address", formLocation.address);
      listingForm.append("city", formLocation.city);
      listingForm.append("pincode", formLocation.pincode);
      listingForm.append("state", formLocation.state);
      listingForm.append("country", formLocation.country);
      listingForm.append("guestCount", guestCount);
      listingForm.append("bedroomCount", bedroomCount);
      listingForm.append("bedCount", bedCount);
      listingForm.append("bathroomCount", bathroomCount);
      listingForm.append("amenities", JSON.stringify(amenities)); // Properly serialize array
      listingForm.append("title", formDescription.title);
      listingForm.append("description", formDescription.description);
      listingForm.append("highlight", formDescription.highlight);
      listingForm.append("highlightDesc", formDescription.highlightDesc);
      listingForm.append("price", formDescription.price);

      // Append photos
      photos.forEach((photo) => {
        listingForm.append("listingPhotos", photo);
      });

      const config = {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      const response = await axios.post(
        `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000'}/api/v1/listing/create`,
        listingForm,
        config
      );

      if (response.status === 200 || response.status === 201) {
        navigate('/');
      }
    } catch (error) {
      console.error("Publish listing error:", error);
      setError(error.response?.data?.message || "Failed to create listing. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // Show loader when loading
  if (loading) {
    return <Loader />;
  }

  return (
    <div>
      <div className="create-listing">
        <h1>Publish Your Place</h1>
        
        {/* Error display */}
        {error && (
          <div className="error-message" style={{ 
            color: 'red', 
            background: '#ffebee', 
            padding: '10px', 
            borderRadius: '4px',
            margin: '10px 0' 
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handlePost}>
          {/* Step 1 */}
          <div className="create-listing_step1">
            <h2>Step 1: Tell us about your place</h2>
            <hr />
            
            <h3>Which of these categories best describes your place?</h3>
            <div className="category-list">
              {categories?.map((item, index) => (
                <div
                  className={`category ${category === item.label ? "selected" : ""}`}
                  key={index}
                  onClick={() => setCategory(item.label)}
                >
                  <div className="category_icon">{item.icon}</div>
                  <p>{item.label}</p>
                </div>
              ))}
            </div>

            <h3>What type of place will guests have?</h3>
            <div className="type-list">
              {types?.map((item, index) => (
                <div
                  className={`type ${type === item.name ? "selected" : ""}`}
                  key={index}
                  onClick={() => setType(item.name)}
                >
                  <div className="type_text">
                    <h4>{item.name}</h4>
                    <p>{item.description}</p>
                  </div>
                  <div className="type_icon">{item.icon}</div>
                </div>
              ))}
            </div>

            <h3>Where's your place located?</h3>
            <div className="full">
              <div className="location">
                <p>Address</p>
                <input
                  type="text"
                  placeholder="Address (Area and Street)"
                  name="address"
                  value={formLocation.address}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>
            
            <div className="half">
              <div className="location">
                <p>City</p>
                <input
                  type="text"
                  placeholder="City/District/Town"
                  name="city"
                  value={formLocation.city}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
              <div className="location">
                <p>Pincode</p>
                <input
                  type="text" // Changed from number to text for better validation
                  placeholder="Pincode"
                  name="pincode"
                  value={formLocation.pincode}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>
            
            <div className="half">
              <div className="location">
                <p>State</p>
                <input
                  type="text"
                  placeholder="State"
                  name="state"
                  value={formLocation.state}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
              <div className="location">
                <p>Country</p>
                <input
                  type="text"
                  placeholder="Country" // Fixed typo: Counntry -> Country
                  name="country"
                  value={formLocation.country}
                  onChange={handleChangeLocation}
                  required
                />
              </div>
            </div>

            <h3>Share some basics about your place</h3>
            <div className="basics">
              {[
                { label: "Guests", count: guestCount, setCount: setGuestCount },
                { label: "Bedrooms", count: bedroomCount, setCount: setBedroomCount },
                { label: "Beds", count: bedCount, setCount: setBedCount },
                { label: "Bathrooms", count: bathroomCount, setCount: setBathroomCount }
              ].map(({ label, count, setCount }) => (
                <div className="basic" key={label}>
                  <p>{label}</p>
                  <div className="basic_count">
                    <RemoveCircleOutline
                      onClick={() => count > 1 && setCount(count - 1)}
                      sx={{
                        fontSize: "25px",
                        cursor: "pointer",
                        "&:hover": { color: variables.pinkred },
                      }}
                    />
                    <p>{count}</p>
                    <AddCircleOutline
                      onClick={() => setCount(count + 1)}
                      sx={{
                        fontSize: "25px",
                        cursor: "pointer",
                        "&:hover": { color: variables.pinkred },
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Step 2 */}
          <div className="create-listing_step2">
            <h2>Step 2: Make your place stand out</h2>
            <hr />

            <h3>Tell guests what your place has to offer</h3>
            <div className="amenities">
              {facilities?.map((item, index) => (
                <div
                  className={`facility ${amenities.includes(item.name) ? "selected" : ""}`}
                  key={index}
                  onClick={() => handleSelectAmenities(item.name)}
                >
                  <div>{item.icon}</div>
                  <p>{item.name}</p>
                </div>
              ))}
            </div>

            <h3>Add some photos of your place</h3>
            <DragDropContext onDragEnd={handleDragPhotos}>
              <Droppable droppableId="photos" direction="horizontal">
                {(provided) => (
                  <div
                    className="photos"
                    {...provided.droppableProps}
                    ref={provided.innerRef}
                  >
                    {photos.length < 1 && (
                      <>
                        <input
                          id="image"
                          type="file"
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={handleUploadPhotos}
                          multiple
                        />
                        <label htmlFor="image" className="alone">
                          <div className="icon">
                            <IoIosImages />
                          </div>
                          <p>Upload from your device</p>
                        </label>
                      </>
                    )}

                    {photos.length >= 1 && (
                      <>
                        {photos.map((photo, index) => (
                          <Draggable
                            key={index}
                            draggableId={index.toString()}
                            index={index}
                          >
                            {(provided) => (
                              <div
                                className="photo"
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                              >
                                <img
                                  src={URL.createObjectURL(photo)}
                                  alt="place"
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRemovePhoto(index)}
                                >
                                  <BiTrash />
                                </button>
                              </div>
                            )}
                          </Draggable>
                        ))}
                        <input
                          id="image"
                          type="file"
                          style={{ display: "none" }}
                          accept="image/*"
                          onChange={handleUploadPhotos}
                          multiple
                        />
                        <label htmlFor="image" className="together">
                          <div className="icon">
                            <IoIosImages />
                          </div>
                          <p>Upload from your device</p>
                        </label>
                      </>
                    )}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>

            <h3>What makes your place attractive and exciting?</h3>
            <div className="description">
              <p>Title</p>
              <input 
                type="text"
                placeholder="Title"
                name="title" 
                onChange={handleChangeDescription}
                value={formDescription.title}
                required
              />
              <p>Description</p>
              <textarea
                placeholder="Description"
                name="description"
                onChange={handleChangeDescription}
                value={formDescription.description}
                required
                rows="4"
              />
              <p>Highlight</p>
              <input
                type="text"
                placeholder="Highlight"
                name="highlight"
                onChange={handleChangeDescription}
                value={formDescription.highlight}
                required
              />
              <p>Highlight details</p>
              <textarea
                placeholder="Highlight details"
                name="highlightDesc"
                onChange={handleChangeDescription}
                value={formDescription.highlightDesc}
                required
                rows="3"
              />
              <p>Now, set your PRICE</p>
              <div style={{ position: 'relative', display: 'inline-block' }}>
                <span style={{ position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)', zIndex: 1 }}>₹</span>
                <input
                  type="number"
                  placeholder="100"
                  name="price"
                  className="price"
                  onChange={handleChangeDescription}
                  value={formDescription.price}
                  required
                  min="1"
                  style={{ paddingLeft: '25px' }}
                />
              </div>
            </div>
          </div>

          <button 
            className="submit_btn" 
            type="submit"
            disabled={loading}
          >
            {loading ? "CREATING..." : "CREATE YOUR LISTING"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default CreateListingPage;