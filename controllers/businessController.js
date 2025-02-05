import { createBusinessDB } from "../models/businessModel.js";
import { getUserByIdDB } from "../models/usersModel.js";

const createBusiness = async (req, res) => {
    /*
        #swagger.summary = 'Creates new business'
        #swagger.description = "Create business. Only parameter product can be null, user_admin is the user role business."
        #swagger.parameters['Request body'] = {
            in: 'body',
            schema: {
                $name: 'Tesco',
                $description: 'Super Market ....',
                product: 'Food',
                $user_admin: 123,
                $category: 'Grocery',
                $address: '250 London Rd',
                $post_code: 'LW2 5RM',
                $city: 'London',
                $country: 'United Kingdom'
            }
        }
        #swagger.responses[201] = { schema: { message: 'Successfully saved new business.' } }
        #swagger.responses[400] = { schema: { message: '...depends which error occured...' } }
        #swagger.responses[500] = { schema: { message: 'An error occured while saving the user to the database.' } }
    */
    if (!req.body.name || !req.body.description || !req.body.user_admin || !req.body.category || !req.body.address || !req.body.post_code || !req.body.city || !req.body.country) {
        return res.status(400).json({ message: "Name, description, category, address, post code, city, country, and User admin id are required." });
    }

    try {
        const user_admin = await getUserByIdDB(req.body.user_admin);
        if (user_admin.role !== 'business') {
            return res.status(403).json({ message: 'User does not have business role.' });
        }

        const business = await createBusinessDB(req.body, req.body.user_admin);
        return res.status(201).json(business);
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ message: 'User not found.' });
        }
        res.status(500).json({ message: `Error: ${error.message}` });
    }
};

export { createBusiness };