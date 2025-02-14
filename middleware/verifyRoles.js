//! Roles 검증 custom middleware 
//!   - 로그인 사용자 roles 중 인자로 제공된 roles 와 한개라도 일치하면 통과

const verifyRoles = (...rolesAllowed) => {
  return (req, res, next) => {
    if (!req?.roles) {
      return res.sendStatus(401);   // Unauthorized
    }

    const allowed = req.roles.map(role => rolesAllowed.includes(role)).find(elm => elm === true);
    if (!allowed) {
      return res.sendStatus(401);   // Unauthorized
    }

    next();
  }
};

module.exports = verifyRoles;