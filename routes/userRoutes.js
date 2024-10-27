// routes/userRoutes.js
import { Router } from 'express';
import admin from '../config/firebaseAdmin.js';
import User from '../models/User.js';
import { verifyToken } from '../middlewares/authMiddleware.js';
import { getDistance } from 'geolib';

const userRouter = Router();

// Route to add a user to the database
userRouter.post('/add-user', verifyToken, async (req, res) => {
  const { email } = req.body;
  const uid = req.user.uid;

  try {
    let existingUser = await User.findOne({ uid });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const newUser = new User({
      uid,
      email,
    });

    await newUser.save();
    return res.status(201).json({ message: 'User added successfully', user: newUser });
  } catch (error) {
    console.error('Error adding user:', error);
    return res.status(500).json({ message: 'Error adding user', error });
  }
});

// Update user location, interests, and active status
userRouter.post('/update-location', verifyToken, async (req, res) => {
  const { location, interests } = req.body;
  const uid = req.user.uid;

  try {
    const user = await User.findOneAndUpdate(
      { uid },
      { location, interests, active: true },
      { new: true }
    );
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Find nearby users
    const nearbyUsers = await findNearbyUsers(user);
    console.log('nearby user',nearbyUsers)
    return res.status(200).json({ message: 'Location updated', nearbyUsers });
  } catch (error) {
    console.error('Error updating location:', error);
    return res.status(500).json({ message: 'Error updating location', error });
  }
});

// Helper function to find nearby users
const findNearbyUsers = async (currentUser) => {
  const { latitude, longitude } = currentUser.location;
  const maxDistance = 2000; // 2km radius in meters

  const users = await User.find({
    active: true,
    _id: { $ne: currentUser._id },
    interests: { $in: currentUser.interests },
  });

  return users.filter((user) => {
    const distance = getDistance(
      { latitude, longitude },
      { latitude: user.location.latitude, longitude: user.location.longitude }
    );
    return distance <= maxDistance;
  });
};

// Verify user
userRouter.get('/verify', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const user = await User.findOne({ uid });
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('user-verified', user.email);
    return res.status(200).json({ message: 'User verified successfully', user });
  } catch (error) {
    console.error('Error verifying user:', error);
    return res.status(500).json({ message: 'Error verifying user', error });
  }
});

// Update user profile
userRouter.post('/update-profile', verifyToken, async (req, res) => {
  const { name, bio, image } = req.body;
  const uid = req.user.uid;

  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.name = name || user.name;
    user.bio = bio || user.bio;
    user.image = image || user.image;
    await user.save();

    return res.status(200).json({ message: 'Profile updated successfully', user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({ message: 'Error updating profile', error });
  }
});

// Get user profile
userRouter.get('/profile', verifyToken, async (req, res) => {
  const uid = req.user.uid;

  try {
    const user = await User.findOne({ uid });
    if (!user) return res.status(404).json({ message: 'User not found' });

    return res.status(200).json({ user: { name: user.name, bio: user.bio, image: user.image } });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({ message: 'Error fetching profile', error });
  }
});

export default userRouter;
