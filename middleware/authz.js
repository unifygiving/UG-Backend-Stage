import { UserRole, UserStatus } from '../utils/enums.js';
import { prisma } from '../db_share.js';

export default async (req, res, next) => {
    const { userId: jwtUserId, role: jwtUserRole, status: jwtUserStatus } = req.jwtPayload;
    const resourceUserId = getResourceUserId(req);
    let isReqCharity = !!req.charity;
    const routeInfo = req.method + req.baseUrl + req.route.path;

    if (jwtUserStatus !== UserStatus.ACTIVE) {
        return res.status(403).json({ message: `Access denied. The current status of the user is: ${jwtUserStatus}.` });
    }

    if (jwtUserRole === UserRole.ADMIN) {
        return next();
    }

    /*********************************************************************
    User routes authorization
    **********************************************************************/
    if (routeInfo === 'GET/api/v1/users/') {
        return isDonorOrRecipient(jwtUserRole)
            ? res.status(403).json({ message: `Access denied. Users who have a role of ${jwtUserRole} are not allowed to access this endpoint.` })
            : next();
    }
    if (routeInfo === 'GET/api/v1/users/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'DELETE/api/v1/users/user_actions/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'POST/api/v1/users/user_actions/picture/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'PUT/api/v1/users/user_actions/picture/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'PUT/api/v1/users/custom_user/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'GET/api/v1/users/recipient/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'GET/api/v1/users/donor/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'PUT/api/v1/users/custom_user/update/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'PUT/api/v1/users/recipient/update/:id') {
        return await hasCharityAdminPermission(jwtUserId, resourceUserId, isReqCharity)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'GET/api/v1/users/recipient/transactions/:id') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }

    /*********************************************************************
    Charity routes authorization
    **********************************************************************/
    if (req.baseUrl === '/api/v1/charity') {
        return await hasCharityAdminPermission(jwtUserId, resourceUserId, isReqCharity)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }

    /*********************************************************************
    Donation routes authorization
    **********************************************************************/
    if (req.baseUrl === '/api/v1/donation') {
        return await hasDefaultPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }

    /*********************************************************************
    Business routes authorization
    **********************************************************************/
    if (routeInfo === 'POST/api/v1/business/') {
        console.log(jwtUserRole)
        return jwtUserRole === UserRole.ADMIN
            ? next()
            : res.status(403).json({ message: "Access denied. Only admins can access this endpoint." });
    }
    if (routeInfo === 'POST/api/v1/business/find_recipient') {
        return jwtUserRole === UserRole.BUSINESS
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    if (routeInfo === 'POST/api/v1/business/transaction/:id') {
        return await hasBusinessPermission(jwtUserId, resourceUserId)
            ? next()
            : res.status(403).json({ message: "Access denied. You can only access or modify your own records. Charity organizations can access or modify their recipients records. This error can also happen if a user id for the requested resource was not found." });
    }
    return res.status(404).json({ message: "Endpoint not found or user lacks permissions." });
};

/*********************************************************************
Supporting functions
**********************************************************************/
function getResourceUserId(req) {
    // For requests with an id param in the url path, the requested resource should have been added to req from a middleware function that runs before this authz middleware runs
    return req.user?.id || req.charity?.id || req.business?.id ||req.body.userId || null;
};

function isDonorOrRecipient(res, role) {
    (role === UserRole.DONOR || role === UserRole.RECIPIENT) ? true : false;
};

async function hasDefaultPermission(jwtUserId, resourceUserId) {
    // Default permission allows user to modify their own records only
    if (!resourceUserId) { return false; }
    
    return jwtUserId === resourceUserId;
};

async function hasCharityAdminPermission(jwtUserId, resourceUserId, isReqCharity) {
    //Permission to modify the charity or the recipients related to this charity by the charity administrator
    try {
        const user = await prisma.users.findUniqueOrThrow({ where: { id: jwtUserId } });
        
        const ownerOfResource = isReqCharity 
            ? await prisma.charity.findUniqueOrThrow({ where: { id: resourceUserId } })
            : await prisma.users.findUniqueOrThrow({ where: { id: resourceUserId } });

        if (user.charity_id_admin === ownerOfResource.charity_id_recipient ||
            (isReqCharity && user.charity_id_admin === ownerOfResource.id)) {
            return true;
        }

        return false;
    } catch (error) {
        console.error(error);
        return false;
    }
};

async function hasBusinessPermission(jwtUserId, resourceBusinessId) {
    try {
        const user = await prisma.users.findUniqueOrThrow({
            where: { id: jwtUserId },
            select: { role: true }
        });

        if (user.role !== UserRole.BUSINESS) {
            return false;
        }

        const userBusiness = await prisma.userbusiness.findFirst({
            where: {
                user_id: jwtUserId,
                business_id: resourceBusinessId
            }
        });

        return !!userBusiness;
    } catch (error) {
        console.log(error);
        return false;
    }
};