import mongoose from "mongoose";

const base64UrlPattern = /^[A-Za-z0-9_-]+$/;

const base64UrlValidator = {
  validator: (value) => typeof value === "string" && base64UrlPattern.test(value),
  message: "Value must be base64url encoded",
};

const encryptedPayloadSchema = new mongoose.Schema(
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
      validate: base64UrlValidator,
    },
    ciphertext: {
      type: String,
      required: true,
      validate: base64UrlValidator,
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

const participantSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true,
    },
    status: {
      type: String,
      enum: ["invited", "verified", "revoked"],
      default: "invited",
    },
    wrappedSessionKey: {
      type: encryptedPayloadSchema,
      default: undefined,
    },
    verifiedAt: {
      type: Date,
    },
    joinedAt: {
      type: Date,
    },
    lastSeenAt: {
      type: Date,
    },
    viewCount: {
      type: Number,
      default: 0,
      min: 0,
    },
  },
  {
    _id: false,
  }
);

const liveSessionSchema = new mongoose.Schema(
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
      validate: base64UrlValidator,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    status: {
      type: String,
      enum: ["active", "ended", "expired"],
      default: "active",
      index: true,
    },
    encryptedPayload: {
      type: encryptedPayloadSchema,
      required: true,
    },
    kdf: {
      algorithm: {
        type: String,
        required: true,
        enum: ["PBKDF2-SHA-256"],
      },
      salt: {
        type: String,
        required: true,
        validate: base64UrlValidator,
      },
      iterations: {
        type: Number,
        required: true,
        min: 100000,
        max: 600000,
      },
    },
    policy: {
      maxViewCount: {
        type: Number,
        default: 1,
        min: 1,
        max: 10,
      },
    },
    participants: {
      type: [participantSchema],
      default: [],
    },
    expiresAt: {
      type: Date,
      required: true,
    },
    endedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

liveSessionSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });
liveSessionSchema.index({ owner: 1, createdAt: -1 });

const LiveSession = mongoose.model("LiveSession", liveSessionSchema);

export default LiveSession;
