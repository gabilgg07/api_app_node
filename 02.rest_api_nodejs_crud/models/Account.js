import mongoose from "mongoose";

const AccountSchema = new mongoose.Schema({
  _id: {
    type: mongoose.Types.ObjectId,
    default: new mongoose.Types.ObjectId(),
  },
  name: {
    type: String,
    required: true,
    min: 3,
    max: 255,
  },
  email: {
    type: String,
    required: true,
    min: 6,
    max: 255,
  },
  password: {
    type: String,
    required: true,
    min: 6,
    max: 1024,
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

const Account = mongoose.model("Accounts", AccountSchema);

export default Account;
