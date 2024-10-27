// models/User.js
import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  uid: { type: String, required: true, unique: true },
  email: { type: String, required: true, unique: true },
  name: { type: String },
  image: { type: String },
  bio: { type: String },
  active: { type: Boolean, default: true }, // Whether the user is actively looking for others nearby
  location: {
    latitude: { type: Number },
    longitude: { type: Number },
  },
  interests: [{ type: String }], // Array of interests to match with others
});

const User = mongoose.model('User', UserSchema);
export default User;
