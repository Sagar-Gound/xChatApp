import { Room } from "../models/room.model.js";

// Initialize or get existing chat room
export const initRoom = async (req, res) => {
  try {
    const { otheruser } = req.body;

    if (!otheruser) {
      return res.status(400).json({
        success: false,
        message: "Other user is required to create a chat room",
      });
    }

    let room = await Room.findOne({
      users: { $all: [req.user._id, otheruser] },
    }).populate("users", "_id fullName username email avatar");

    if (!room) {
      room = await Room.create({
        users: [req.user._id, otheruser],
      });
      room = await Room.findById(room._id).populate(
        "users",
        "_id fullName username email avatar"
      );
    }

    return res.status(200).json({
      success: true,
      data: room,
      message: "Room initialized successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while initializing the chat room",
    });
  }
};

// Get all rooms for current user
export const getUserRooms = async (req, res) => {
  try {
    const rooms = await Room.find({
      users: req.user._id,
    }).populate("users", "_id fullName username email avatar");

    return res.status(200).json({
      success: true,
      data: rooms,
      message: "Rooms fetched successfully",
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Something went wrong while fetching user rooms",
    });
  }
};

