import express from "express";
import Stripe from "stripe";
import { prisma } from '../../../../db_share.js';

const router = express.Router();
const stripe = Stripe(process.env.STRIPE_API_KEY);
router.use(express.json());

export async function oldPayment(amount, customer_email, donation_id, currency) {
    try {
        const session = await stripe.checkout.sessions.create({
            customer_email,
            line_items: [
                {
                    price_data: {
                        currency: currency,
                        product_data: { name: 'Donation' },
                        unit_amount: amount * 100,
                    },
                    quantity: 1,
                },
            ],
            mode: 'payment',
            success_url: 'https://unifygiving.com/',
            cancel_url: 'https://unifygiving.com/contact/',
        });

        const payment = await prisma.payments.create({
            data: {
                donation: { connect: { id: donation_id }},
                currency: currency,
                amount: amount,
                email: customer_email,
                payment_id: session.id,
                status: 'unpaid',
				donation_id: donation_id
            },
        });

        await prisma.donation.update({
            where: { id: donation_id },
            data: { payment_id: payment.id }
        });

        return { sessionUrl: session.url };

    } catch (error) {
        console.error(`Error creating payment: ${error.message}`);
        throw new Error(`Payment creation failed: ${error.message}`);
    }
}

export async function newPayment(amount, customer_email, donation_id, currency) {
    try {
        const paymentIntent = await stripe.paymentIntents.create({
			amount: amount * 100,
			currency: currency,
			automatic_payment_methods: {
			  enabled: true,
			},
		});

		await prisma.paymentintent.create({
			data: {
				payment_intent: paymentIntent.id,
				payload: JSON.stringify(paymentIntent)
			},
		});

        const payment = await prisma.payments.create({
            data: {
                donation: { connect: { id: donation_id }},
                currency: currency,
                amount: amount,
                email: customer_email,
                payment_id: null,
                status: 'unpaid',
				donation_id: donation_id,
				payment_intent_id: paymentIntent.id
            },
        });

        await prisma.donation.update({
            where: { id: donation_id },
            data: { payment_id: payment.id }
        });

        return { 
			paymentIntent: paymentIntent.client_secret, 
			publishableKey: process.env.publishableKey,
		};

    } catch (error) {
        console.error(`Error creating payment: ${error.message}`);
        throw new Error(`Payment creation failed: ${error.message}`);
    }
}

// router.post("/subscribe", async (req, res) => {

// 	console.log('Stripe API Key:', process.env.STRIPE_API_KEY);

// 	const {
// 		amount,
// 		quantity = 1,
// 		currency = "gbp",
// 		name,
// 		frequency,
// 		desc = "Donation",
// 		customer_email,
// 	} = req.body;

// 	let message = "";
// 	message += isIdValid(amount) ? "" : "Invalid input for Amount.";
// 	message += isNameValid(name) ? "" : "Invalid input for Name.";
// 	message += isCurrencyValid(currency) ? "" : "Invalid input for Currency.";
// 	message += isPaymentFrequencyValid(frequency)
// 		? ""
// 		: "Invalid input for Frequency.";

// 	if (message) {
// 		return res.status(400).json({ message });
// 	}

// 	const interval = frequency === "quarter" ? "month" : frequency;
// 	const interval_count = frequency === "quarter" ? 3 : 1;

// 	try {
// 		const customer = await stripe.customers.create({
// 			name: name,
// 			email: customer_email,
// 		});
// 		const subscription = await stripe.subscriptions.create({
// 			customer: customer.id,
// 			items: [
// 				{
// 					price_data: {
// 						currency: currency,
// 						recurring: {
// 							interval,
// 							interval_count,
// 						},
// 						product: "prod_QRP8qdratiZIsA",
// 						unit_amount: amount,
// 					},
// 					quantity: 1,
// 				},
// 			],
// 			payment_behavior: "default_incomplete",
// 			payment_settings: { save_default_payment_method: "on_subscription" },
// 			expand: ["latest_invoice.payment_intent"],
// 		});

// 		const subscriptionId = subscription.id;

// 		await prisma.subscriptions.create({
// 			data: {
// 				currency: currency,
// 				frequency: frequency,
// 				amount: amount,
// 				email: customer_email,
// 				name: name,
// 				subscription_id: subscriptionId,
// 			},
// 		})

// 		res.send({
// 			subscriptionId,
// 			clientSecret: subscription.latest_invoice.payment_intent.client_secret,
// 		});

// 	} catch (error) {
// 		return res.status(400).json({ error: error.message });
// 	}
// });

export default router;