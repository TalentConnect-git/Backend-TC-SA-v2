import { handleGoogleAuthService } from '../services/google-auth-services.js';

export const googleAuth = async (req, res) => {
  try {
    const { tokenId, accountType, userType, action } = req.body;

    const effectiveAccountType = accountType 
      || (userType === 'school' ? 'school' : 'school_user');

    const { auth, token } = await handleGoogleAuthService(tokenId, effectiveAccountType, action);

    res.status(200).json({
      status: 'success',
      message: action === 'signup' ? 'Account created successfully' : 'Login successful',
      data: {
        auth,
        token,
      },
    });
  } catch (error) {
    console.error('Google Auth Error:', error);
    res.status(error.status || 500).json({
      status: 'failed',
      message: error.message || 'Google authentication failed',
    });
  }
};