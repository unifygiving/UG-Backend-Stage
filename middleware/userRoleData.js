export const formatRoleData = (user) => {
    switch (user.role) {
      case 'admin':
        user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          status: user.status,
          role: user.role,
          picture: user.picture,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
        break;
      case 'recipient':
        user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          role: user.role,
          picture: user.picture,
          city: user.city,
          country: user.country,
          qrcode: user.qrcode,
          story: user.story,
          balance: user.balance,
          created_at: user.created_at,
          updated_at: user.updated_at,
          charity_id_recipient: user.charity_id_recipient,
        };
        break;
      case 'donor':
        user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          status: user.status,
          role: user.role,
          picture: user.picture,
          city: user.city,
          country: user.country,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
        break;
      case 'business':
        user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          status: user.status,
          role: user.role,
          picture: user.picture,
          businesses: user.userbusiness.map(ub => ub.business_id),
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
        break;
      case 'charity':
        user = {
          id: user.id,
          email: user.email,
          firstName: user.first_name,
          lastName: user.last_name,
          status: user.status,
          role: user.role,
          picture: user.picture,
          city: user.city,
          country: user.country,
          charity_id_admin: user.charity_id_admin,
          created_at: user.created_at,
          updated_at: user.updated_at,
        };
        break;
    }
    return user;
};
  