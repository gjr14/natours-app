const stripe = Stripe(
    "pk_test_51S1tpUDZjv9fnB4za8M78ZB8PX8zVy3skeXFD3MLiRgIUlWTjlDrsUFutlGbGG9LLjaq4QtQ6YWfNKO0GE1UJgj000naY3mfvB",
);
import axios from "axios";

export const bookTour = async (tourId) => {
    try {
        // 1 Get checkout session from the API
        const session = await axios(
            `/api/v1/bookings/checkout-session/${tourId}`,
        );

        // 2 Create checkout form + charge cc
        await stripe.redirectToCheckout({
            sessionId: session.data.session.id,
        });
    } catch (err) {
        console.log(err);
    }
};
