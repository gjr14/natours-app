const crypto = require("crypto");
const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, "A user must have a name"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        required: [true, "A user must have an email"],
        unique: true,
        trim: true,
        lowercase: true,
        validate: [validator.isEmail, "Please enter a valid email"],
    },
    photo: {
        type: String,
        default: "default.jpg",
    },
    password: {
        type: String,
        required: [true, "A user must have a password"],
        trim: true,
        minlength: [
            8,
            "A user email must have mroe or equal than 8 characters",
        ],
        select: false,
    },
    role: {
        type: String,
        enum: ["admin", "user", "guide", "lead-guide"],
        default: "user",
    },
    passwordConfirm: {
        type: String,
        required: [true, "Please confirm your password"],
        trim: true,
        validate: {
            // This only works on CREATE and SAVE
            validator: function (val) {
                return val === this.password;
            },
            message: "Passwords do not match",
        },
    },
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,
    active: {
        type: Boolean,
        default: true,
        select: false,
    },
});

userSchema.pre("save", async function (next) {
    // Only run this function if password was actually modified or created,
    // not the document
    if (!this.isModified("password")) return next();

    // Hash password with the cost of 12
    this.password = await bcrypt.hash(this.password, 12);

    this.passwordConfirm = undefined;
    next();
});

userSchema.pre("save", function (next) {
    if (!this.isModified("password") || this.isNew) return next();

    this.passwordChangedAt = Date.now() - 1000;
    next();
});

userSchema.pre(/^find/, function (next) {
    // this points to the current query
    this.find({ active: { $ne: false } });
    next();
});

userSchema.methods.correctPassword = async function (candidatePwd, userPwd) {
    return await bcrypt.compare(candidatePwd, userPwd);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
    if (this.passwordChangedAt) {
        const changedTimestamp = parseInt(
            this.passwordChangedAt.getTime() / 1000,
            10,
        );

        return JWTTimestamp < changedTimestamp;
    }

    // false means not changed
    return false;
};

userSchema.methods.createPasswordResetToken = function () {
    const resetToken = crypto.randomBytes(32).toString("hex");

    this.passwordResetToken = crypto
        .createHash("sha256")
        .update(resetToken)
        .digest("hex");

    this.passwordResetExpires = Date.now() + 10 * 60 * 1000;

    return resetToken;
};

const User = mongoose.model("User", userSchema);

module.exports = User;
