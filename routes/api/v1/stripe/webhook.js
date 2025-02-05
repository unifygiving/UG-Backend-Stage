import express from "express";
import Stripe from "stripe";
import { prisma } from '../../../../db_share.js';

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_API_KEY);
const endpointSecret = process.env.endpointSecret;

router.post('/', express.raw({ type: 'application/json' }), async (request, response) => {
    const sig = request.headers['stripe-signature'];

    let event;
    try {
        event = stripe.webhooks.constructEvent(request.body, sig, endpointSecret);
    } catch (err) {
        console.error("Webhook signature verification failed:", err.message);
        return response.status(400).send(`Webhook Error: ${err.message}`);
    }

    switch (event.type) {
        case 'checkout.session.completed':
            try {
                const session = event.data.object;

                if (!session.payment_intent) {
                    console.error("Session completed without a payment_intent:", session);
                    return response.status(400).send("Invalid session data.");
                }

                // Check if the payment intent already exists
                const existingIntent = await prisma.paymentintent.findUnique({
                    where: { payment_intent: session.payment_intent }
                });

                if (existingIntent) {
                    console.log(`Payment Intent ${session.payment_intent} has already been processed.`);
                    return response.send();
                }

                // Find the payment associated with the session ID
                const payment = await prisma.payments.findFirst({
                    where: { payment_id: session.id }
                });

                if (payment) {
                    // Associate the payment intent with the existing payment
                    await prisma.payments.update({
                        where: { id: payment.id },
                        data: { payment_intent_id: session.payment_intent }
                    });

                    // Create the payment intent record in the database
                    await prisma.paymentintent.create({
                        data: {
                            payment_intent: session.payment_intent,
                            payload: JSON.stringify(session)
                        },
                    });

                    console.log(`Payment Intent ${session.payment_intent} successfully associated with Payment ID ${session.id}.`);
                } else {
                    console.error(`Payment not found for Session ID ${session.id}.`);
                }
            } catch (error) {
                console.error("Error processing checkout.session.completed:", error);
                return response.status(500).send("Internal Server Error.");
            }
            break;

        case 'payment_intent.succeeded':
            try {
                const paymentIntent = event.data.object;

                // Find the payment associated with the payment intent
                const payment = await prisma.payments.findFirst({
                    where: { payment_intent_id: paymentIntent.id }
                });

                if (payment) {
                    // Update the payment status to "paid"
                    await prisma.payments.update({
                        where: { id: payment.id },
                        data: { status: "paid" }
                    });

                    // Increment the recipient's balance if there's a donation
                    const donation = await prisma.donation.findUnique({
                        where: { id: payment.donation_id }
                    });

                    if (donation && donation.amount_donation) {
                        await prisma.users.update({
                            where: { id: donation.recipient_id },
                            data: {
                                balance: { increment: donation.amount_donation }
                            }
                        });
                    }

                    // Update the payment intent payload in the database
                    await prisma.paymentintent.update({
                        where: { payment_intent: payment.payment_intent_id },
                        data: { payload: JSON.stringify(paymentIntent) }
                    });

                    console.log(`Payment Intent ${paymentIntent.id} successfully updated to "paid".`);
                } else {
                    console.error(`No payment found for Payment Intent ${paymentIntent.id}.`);
                }
            } catch (error) {
                console.error("Error processing payment_intent.succeeded:", error);
                return response.status(500).send("Internal Server Error.");
            }
            break;

        default:
            console.log(`Unhandled event type ${event.type}.`);
            break;
    }

    response.send();
});

router.use(express.json());
export default router;
