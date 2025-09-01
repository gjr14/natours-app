const Tour = require("../models/tourModels");
const User = require("../models/userModel");
const Review = require("../models/reviewModel");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/appError");
const Booking = require("../models/bookingModel");

exports.getOverview = catchAsync(async (req, res, next) => {
    // Get tour data from collection
    const tours = await Tour.find();

    // Build template
    // Build template from step 1

    res.status(200).render("overview", {
        title: "All Tours",
        tours,
    });
});

exports.getTour = catchAsync(async (req, res, next) => {
    // 1 Get data from tours, reviews and guides
    const [tour] = await Tour.find({ slug: req.params.slug }).populate({
        path: "reviews",
        fields: "review rating user",
    });
    const reviews = await Review.find({ tour: tour?.id });
    // 2 Build template
    // 3 Render template using data from 1

    if (!tour) {
        return next(new AppError("There is no tour with that name", 404));
    }

    res.status(200).render("tour", {
        title: tour.name,
        tour,
        reviews,
    });
});

exports.getMyTours = catchAsync(async (req, res, next) => {
    //  1 Find all bookings
    const bookings = await Booking.find({ user: req.user.id });

    // 2 Find tours with the returned IDs
    const tourIDs = bookings.map((el) => el.tour);
    const tours = await Tour.find({ _id: { $in: tourIDs } });

    res.status(200).render('overview', {
        title: 'My tours',
        tours
    })
});

exports.login = async (req, res) => {
    res.status(200).render("login", {
        title: "Log in",
    });
};

exports.getAccount = async (req, res) => {
    res.status(200).render("account", {
        title: "My account",
        user: req.user,
    });
};

exports.updateUserData = catchAsync(async (req, res, next) => {
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        {
            name: req.body.name,
            email: req.body.email,
        },
        {
            new: true,
            runValidators: true,
        },
    );

    res.status(200).render("account", {
        title: "My account",
        user: updatedUser,
    });
});
