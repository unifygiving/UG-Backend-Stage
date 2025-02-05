-- TABLES
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    first_name TEXT,
    last_name TEXT,
    password TEXT,
    agree_to_terms BOOLEAN NOT NULL,
    role TEXT NOT NULL,
    status TEXT NOT NULL,
    story TEXT,
    balance FLOAT,
    bio TEXT,
    picture TEXT,
    qr_code TEXT ,
    charity_id INT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    charity_id_admin INT UNIQUE,
    charity_id_recipient INT,
    CONSTRAINT users_pkey PRIMARY KEY (id),
    CONSTRAINT users_charity_id_admin_fk FOREIGN KEY (charity_id_admin) REFERENCES charity(id) ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT users_charity_id_recipient_fk FOREIGN KEY (charity_id_recipient) REFERENCES charity(id) ON DELETE SET NULL ON UPDATE CASCADE
);

CREATE TABLE "charity" (
    id SERIAL NOT NULL,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    address TEXT NOT NULL,
    city TEXT NOT NULL,
    country TEXT NOT NULL,
    postal_code TEXT NOT NULL,
    contact TEXT NOT NULL,
    picture TEXT,
    social_link TEXT 
    created_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_admin INTEGER UNIQUE,
    CONSTRAINT charity_pkey PRIMARY KEY (id),
    CONSTRAINT charity_user_admin_fk FOREIGN KEY (user_admin) REFERENCES users(id) ON DELETE SET NULL ON UPDATE CASCADE
);

-- FUNCTION for TIMESTAMP
CREATE FUNCTION set_updated_at() RETURNS TRIGGER
    LANGUAGE plpgsql
    AS $$
    BEGIN
        NEW.updated_at = CURRENT_TIMESTAMP;
        RETURN NEW;
    END;
$$;

-- TRIGGERS for TIMESTAMP
CREATE TRIGGER update_timestamp BEFORE UPDATE ON users FOR EACH ROW EXECUTE FUNCTION set_updated_at();
CREATE TRIGGER update_timestamp BEFORE UPDATE ON charity FOR EACH ROW EXECUTE FUNCTION set_updated_at();

-- INSERT FAKE USERS (all the passwords are '12345678', but they have been hashed by bcrypt)
INSERT INTO users (email, first_name, last_name, password, agree_to_terms, role, status, charity_id)
VALUES ('fakeadmin@email.com', 'Fake', 'Admin', '$2a$10$OWojPnrPLxX0TfV5NCaqEu65gSOKaWCAcupoYmekuxKq1eHC68Ulq', true, 'admin', 'active', null);
INSERT INTO users (email, first_name, last_name, password, agree_to_terms, role, status, charity_id)
VALUES ('fakedonor@email.com', 'Fake', 'Donor', '$2a$10$OWojPnrPLxX0TfV5NCaqEu65gSOKaWCAcupoYmekuxKq1eHC68Ulq', true, 'donor', 'active', null);
INSERT INTO users (email, first_name, last_name, password, agree_to_terms, role, status, charity_id)
VALUES ('fakecharity@email.com', 'Fake', 'Charity', '$2a$10$OWojPnrPLxX0TfV5NCaqEu65gSOKaWCAcupoYmekuxKq1eHC68Ulq', true, 'charity', 'active', null);
INSERT INTO users (email, first_name, last_name, password, agree_to_terms, role, status, charity_id)
VALUES ('fakerecipient@email.com', 'Fake', 'Recipient', '$2a$10$OWojPnrPLxX0TfV5NCaqEu65gSOKaWCAcupoYmekuxKq1eHC68Ulq', true, 'recipient', 'active', 3);

-- INSERT FAKE CHARITY
INSERT INTO charity (name, description, address, city, country, postal_code, contact)
VALUES ('Unify Giving', 'Created to donation...', '20 London Road', 'London', 'Uk', 'LN10 20BB', '+44123456789');