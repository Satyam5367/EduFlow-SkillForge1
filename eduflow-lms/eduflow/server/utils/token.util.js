// utils/token.util.js
const sendTokenResponse = (user, statusCode, res, message = 'Success') => {
  const token = user.getSignedJWT();

  const userResponse = {
    _id:      user._id,
    name:     user.name,
    email:    user.email,
    role:     user.role,
    avatar:   user.avatar,
    isVerified: user.isVerified,
    isInstructorApproved: user.isInstructorApproved,
  };

  res.status(statusCode).json({
    success: true,
    message,
    token,
    data: userResponse,
  });
};

module.exports = { sendTokenResponse };
