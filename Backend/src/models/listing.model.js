import mongoose, {Schema} from "mongoose";

const listingSchema= new Schema({
    creator: {
        type: Schema.Types.ObjectId,
        ref: 'User'
    },
    category: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    },
    city: {
        type: String,
        required: true
    },
    pincode: {
        type: Number,
        required: true
    },
    state: {
        type: String,
        required: true
    },
    country: {
        type: String,
        required: true
    },
    guestCount: {
        type: Number,
        required: true
    },
    bedroomCount: {
        type: Number,
        required: true
    },
    bedCount: {
        type: Number,
        required: true
    },
    bathroomCount: {
        type: Number,
        required: true
    },
    amenities: {
        type: Array,
        default: []
    },
    listingPhotos: [
        {type: String}
    ],
    title: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    highlight: {
        type: String,
        required: true
    },
    highlightDesc: {
        type: String,
        required: true
    },
    price: {
        type: Number,
        required: true
    },
}, {timestamps: true})

export const Listing= mongoose.model("Listing", listingSchema)