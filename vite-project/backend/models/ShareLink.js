import mongoose from "mongoose";

const shareEncryptedPayloadSchema = new mongoose.Schema(
  {
    algorithm: {
      type: String,
      required: true,
      enum: ["AES-GCM"],
      default: "AES-GCM",
    },

    iv: {
      type: String,
      required: true,
    },

    ciphertext: {
      type: String,
      required: true,
    },

    encoding: {
      type: String,
      required: true,
      enum: ["base64url"],
      default: "base64url",
    },
  },
  {
    _id: false,
  }
);

const passwordKdfSchema = new mongoose.Schema(
  {
    algorithm: {
      type: String,
      enum: ["PBKDF2-SHA-256"],
    },

    salt: {
      type: String,
    },

    iterations: {
      type: Number,
      min: 100000,
      max: 600000,
    },
  },
  {
    _id: false,
  }
);

const shareLinkSchema = new mongoose.Schema(
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

    encryptedPayload: {
      type: shareEncryptedPayloadSchema,
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    burnAfterReading: {
      type: Boolean,
      default: false,
    },

    passwordProtected: {
      type: Boolean,
      default: false,
    },

    passwordKdf: {
      type: passwordKdfSchema,
      default: undefined,
    },

    readCount: {
      type: Number,
      default: 0,
      min: 0,
    },

    openedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

shareLinkSchema.index({ owner: 1, createdAt: -1 });
shareLinkSchema.index({ owner: 1, expiresAt: 1 });

const ShareLink = mongoose.model("ShareLink", shareLinkSchema);

export default ShareLink;
