const express = require('express');
const reviewController = require('../controllers/reviewController');
const authController = require('../controllers/authController');

// POST /tour/234r34/reviews
const router = express.Router({ mergeParams: true });

router.use(authController.protect);

// POST /reviews
router
    .route('/')
    .get(reviewController.getAllReviews)
    .post(
        authController.restrictTo('user'),
        reviewController.setTourUserIds,
        reviewController.createReview,
    );
router
    .route('/:id')
    .get(reviewController.getReview)
    .delete(
        authController.restrictTo('admin', 'user'),
        reviewController.deleteReview,
    )
    .patch(
        authController.restrictTo('admin', 'user'),
        reviewController.updateReview,
    );

module.exports = router;
