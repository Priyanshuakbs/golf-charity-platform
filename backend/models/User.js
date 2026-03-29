const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const UserSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 6,
      select: false, // ✅ FIX: authController mein .select('+password') kaam karega
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // ── Subscription ─────────────────────────────────────────
    isSubscribed: {
      type: Boolean,
      default: false,
    },
    subscriptionPlan: {
      type: String,
      enum: ["monthly", "yearly", null],
      default: null,
    },
    subscriptionStart: Date,
    subscriptionEnd: Date,

    // ── Charity ───────────────────────────────────────────────
    charityId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Charity",
      default: null,
    },
    charityPercentage: {
      type: Number,
      default: 10,
      min: 10,
      max: 100,
    },

    // ── Stats ─────────────────────────────────────────────────
    totalWinnings: {
      type: Number,
      default: 0,
    },
    drawsEntered: {
      type: Number,
      default: 0,
    },

    avatar: {
      type: String,
      default: null,
    },

    // ── Password Reset ────────────────────────────────────────
    resetPasswordToken: String,
    resetPasswordExpire: Date,
  },
  { timestamps: true }
);

// ✅ FIX: Password ko save se pehle hash karo
UserSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

module.exports = mongoose.model("User", UserSchema);