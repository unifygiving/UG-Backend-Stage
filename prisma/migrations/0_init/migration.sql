-- CreateTable for charity
CREATE TABLE "charity" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "postal_code" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "contact" TEXT NOT NULL,
    "picture" TEXT,
    "social_link" TEXT,
    "user_id_admin" INTEGER UNIQUE,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    CONSTRAINT "charity_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "charity_user_id_admin_fk" FOREIGN KEY ("user_id_admin") REFERENCES "users"("id") ON DELETE SET NULL
);

-- CreateTable for users
CREATE TABLE "users" (
    "id" SERIAL NOT NULL,
    "google_id" TEXT,
    "email" TEXT NOT NULL,
    "first_name" TEXT,
    "last_name" TEXT,
    "password" TEXT,
    "agree_to_terms" BOOLEAN NOT NULL,
    "role" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "story" TEXT,
    "balance" NUMERIC,
    "city" TEXT,
    "country" TEXT,
    "picture" TEXT,
    "qr_code" TEXT,
    "charity_id_admin" INTEGER UNIQUE,
    "charity_id_recipient" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "users_charity_id_admin_fk" FOREIGN KEY ("charity_id_admin") REFERENCES "charity"("id") ON DELETE SET NULL,
    CONSTRAINT "users_charity_id_recipient_fk" FOREIGN KEY ("charity_id_recipient") REFERENCES "charity"("id") ON DELETE SET NULL
);

-- CreateTable for donation
CREATE TABLE "donation" (
    "id" SERIAL NOT NULL,
    "donor_id" INTEGER NOT NULL,
    "charity_id" INTEGER NOT NULL,
    "recipient_id" INTEGER NOT NULL,
    "amount_donation" NUMERIC (10, 2) DEFAULT 0.00 NOT NULL,
    "message" TEXT,
    "payment_id" INTEGER,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "donation_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "donation_donor_fk" FOREIGN KEY ("donor_id") REFERENCES "users"("id"),
    CONSTRAINT "donation_charity_fk" FOREIGN KEY ("charity_id") REFERENCES "charity"("id"),
    CONSTRAINT "donation_recipient_fk" FOREIGN KEY ("recipient_id") REFERENCES "users"("id"),
    CONSTRAINT "donation_payment_fk" FOREIGN KEY ("payment_id") REFERENCES "payments"("id")
);

-- CreateTable for payments
CREATE TABLE "payments" (
    "id" SERIAL NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" NUMERIC(10, 2) DEFAULT 0.00,
    "email" TEXT NOT NULL,
    "payment_id" TEXT,
    "status" TEXT,
    "donation_id" INTEGER UNIQUE,
    "payment_intent_id" TEXT,
    "created_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "payments_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "payments_donation_fk" FOREIGN KEY ("donation_id") REFERENCES "donation"("id") ON DELETE NO ACTION
);

-- CreateTable for paymentintent
CREATE TABLE "paymentintent" (
    "id" SERIAL NOT NULL,
    "payment_intent" TEXT NOT NULL,
    "payload" TEXT,
    "createdat" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "paymentintent_pkey" PRIMARY KEY ("id")
);
