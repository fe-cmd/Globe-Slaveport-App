import mongoose from "mongoose";

const locationSchema = new mongoose.Schema(
  {
    item: String,
    city: String,
    country: String,
    lat: Number,
    lng: Number,
    area: String,
    year: String,
    picture: String, // Cloudinary URL
    comments: String,
  },
  { timestamps: true }
);

export default mongoose.model("Location", locationSchema);