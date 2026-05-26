import mongoose from "mongoose";

const secretRequestSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    token: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },

    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },

    status: {
      type: String,
      enum: ["pending", "submitted"],
      default: "pending",
      index: true,
    },

    submittedSecret: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "EncryptedSecret",
    },

    submittedAt: {
      type: Date,
    },

    expiresAt: {
      type: Date,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

secretRequestSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

const SecretRequest = mongoose.model("SecretRequest", secretRequestSchema);

export default SecretRequest;
