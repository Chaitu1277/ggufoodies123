import Navbar from '../../components/Navbar';
import Footer from '../../components/Footer';

const Shipping = () => {
    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <h1 className="text-3xl font-bold text-gray-800 mb-8">Shipping and Delivery Policy</h1>

                <div className="prose max-w-none bg-white p-6 rounded-lg shadow">
                    <h2>1. Service Options</h2>
                    <p>
                        GGU Foodies is a campus-based food ordering platform exclusively for GGU students and staff. We offer:
                    </p>
                    <ul>
                        <li><strong>Dine-in:</strong> Pre-order meals and enjoy them at the respective food court</li>
                        <li><strong>Takeaway:</strong> Pre-order and collect food for takeout</li>
                    </ul>

                    <h2>2. How Ordering Works</h2>
                    <p>
                        Our platform enables convenient pre-ordering:
                    </p>
                    <ul>
                        <li>Orders can be placed via our web app</li>
                        <li>Select your preferred pickup slot</li>
                        <li>Payments are made securely online through Razorpay</li>
                        <li>Orders can be placed up to 2 hours in advance</li>
                    </ul>

                    <h2>3. Preparation & Pickup Timelines</h2>
                    <p>
                        Estimated food preparation times:
                    </p>
                    <ul>
                        <li>Regular meals: 20–30 minutes during service hours (9:00 AM – 9:00 PM)</li>
                        <li>Bulk/complex orders: 40–50 minutes (users will be notified if extra time is required)</li>
                    </ul>

                    <h2>4. Order Notifications</h2>
                    <p>
                        Notifications related to your order will be sent to your registered email:
                    </p>
                    <ul>
                        <li>Order confirmation</li>
                        <li>When your order is under preparation</li>
                        <li>When your order is ready for pickup</li>
                        <li>Reminder if not picked up within 15 minutes of readiness</li>
                    </ul>

                    <h2>5. Pickup Guidelines</h2>
                    <p>
                        To ensure smooth and timely pickups:
                    </p>
                    <ul>
                        <li>Show your order confirmation email or OTP to verify your identity</li>
                        <li>Orders must be picked up within 30 minutes after notification</li>
                        <li>Orders not collected within this timeframe may be discarded without refund</li>
                    </ul>

                    <h2>6. Refunds & Cancellations</h2>
                    <p>
                        Once an order is placed and payment is confirmed, it cannot be canceled. Refunds will not be issued unless:
                    </p>
                    <ul>
                        <li>The vendor fails to prepare your order</li>
                        <li>You are charged but do not receive the item (upon verification)</li>
                    </ul>
                    <p>
                        All refund requests are subject to approval and will be processed within 5–7 business days.
                    </p>
                </div>
            </div>

            <Footer />
        </div>
    );
};

export default Shipping;