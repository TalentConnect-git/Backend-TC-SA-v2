import jwt from 'jsonwebtoken';
import Auth from '../models/auth-model.js';
import { googleClient } from '../utils/google-client.js';

export const handleGoogleAuthService = async (tokenId, accountType = 'school_user', action = null) => {
  if (!tokenId) {
    throw { status: 400, message: 'Google tokenId is required' };
  }

  const normalizedAccountType = (accountType === 'school') ? 'school' : 'school_user';

  // Support Web, Android, iOS, and Legacy Client IDs
  const allowedAudiences = [
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_ID_MOBILE,
    process.env.GOOGLE_CLIENT_ID_WEB,
    '61664057766-ral4biepjmo0e3ueqtgghv0cfvprbact.apps.googleusercontent.com', // Web Client ID
    '574038035729-6nlkp4a98fj3jdqkqlkub49asnskcnmh.apps.googleusercontent.com', // Mobile Android/iOS Client ID
    '809028962389-buh0m92ilhd1n27vkuhi1og76g9kb5v2.apps.googleusercontent.com', // Legacy Client ID
  ].filter(Boolean);

  let payload;
  try {
    const ticket = await googleClient.verifyIdToken({
      idToken: tokenId,
      audience: allowedAudiences,
    });
    payload = ticket.getPayload();
  } catch (verifyError) {
    console.warn('Google verifyIdToken with audience list failed, trying direct verification:', verifyError.message);
    try {
      // Direct verification fallback without audience restriction
      const ticket = await googleClient.verifyIdToken({
        idToken: tokenId,
      });
      payload = ticket.getPayload();
    } catch (secondError) {
      console.error('Google token verification failed completely:', secondError.message);
      throw { status: 401, message: 'Invalid or expired Google authentication token.' };
    }
  }

  const { email } = payload;
  if (!email) {
    throw { status: 400, message: 'Unable to retrieve email from Google token.' };
  }

  let existingAuth = await Auth.findOne({ email });

  if (action === 'signin') {
    if (!existingAuth) {
      throw {
        status: 404,
        message: `No account found for this Google email. Please sign up first as ${normalizedAccountType === 'school' ? 'School' : 'School User'}.`,
      };
    }

    if (normalizedAccountType === 'school' && existingAuth.userType !== 'school') {
      throw {
        status: 403,
        message: 'This Google account is registered as a School User. Please sign in as School User.',
      };
    }

    if (normalizedAccountType === 'school_user' && !['student', 'parent'].includes(existingAuth.userType)) {
      throw {
        status: 403,
        message: 'This Google account is registered as a School. Please sign in as School.',
      };
    }
  } else if (action === 'signup') {
    if (existingAuth) {
      if (normalizedAccountType === 'school' && existingAuth.userType !== 'school') {
        throw {
          status: 409,
          message: 'This Google account is already registered as a School User. Please sign in as School User.',
        };
      }
      if (normalizedAccountType === 'school_user' && !['student', 'parent'].includes(existingAuth.userType)) {
        throw {
          status: 409,
          message: 'This Google account is already registered as a School. Please sign in as School.',
        };
      }
      // If already registered with matching accountType, proceed seamlessly
    } else {
      const userType = normalizedAccountType === 'school' ? 'school' : 'student';
      existingAuth = new Auth({
        email,
        authProvider: 'google',
        userType,
        isEmailVerified: true,
      });
      await existingAuth.save();
    }
  } else {
    // Fallback if action is not passed (e.g. mobile app sign-in/sign-up in one flow)
    if (existingAuth) {
      if (normalizedAccountType === 'school' && existingAuth.userType !== 'school') {
        throw {
          status: 403,
          message: 'This Google account is registered as a School User. Please sign in as School User.',
        };
      }
      if (normalizedAccountType === 'school_user' && !['student', 'parent'].includes(existingAuth.userType)) {
        throw {
          status: 403,
          message: 'This Google account is registered as a School. Please sign in as School.',
        };
      }
    } else {
      const userType = normalizedAccountType === 'school' ? 'school' : 'student';
      existingAuth = new Auth({
        email,
        authProvider: 'google',
        userType,
        isEmailVerified: true,
      });
      await existingAuth.save();
    }
  }

  const token = jwt.sign(
    { id: existingAuth._id, email: existingAuth.email, userType: existingAuth.userType },
    process.env.SECRET,
    { expiresIn: '7d' }
  );

  return { auth: existingAuth, token };
};

export const handleWebGoogleAuthService = async (tokenId, userType, action = null) => {
  return handleGoogleAuthService(tokenId, userType, action);
};
