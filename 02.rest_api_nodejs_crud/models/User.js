import mongoose from "mongoose";

const UserSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  username: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
  createdDate: {
    type: Date,
    default: Date.now,
  },
  deletedDate: {
    type: Date,
    default: null,
  },
  modifiedDate: {
    type: Date,
    default: null,
  },
});

const User = mongoose.model("Users", UserSchema);

export default User;
