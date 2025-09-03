
const COOKIE_EXPIRE_DAYS = Number(process.env.COOKIE_EXPIRE) || 7;
const isProd = process.env.NODE_ENV === 'production';

const commonOptions = {
  expires: new Date(Date.now() + COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000),
  httpOnly: true,
  maxAge: COOKIE_EXPIRE_DAYS * 24 * 60 * 60 * 1000,
  secure: isProd,                       // only send over HTTPS in prod
  sameSite: isProd ? 'None' : 'Lax',    // cross-site cookies need 'none' in prod
};

if (process.env.COOKIE_DOMAIN && isProd) {
  commonOptions.domain = process.env.COOKIE_DOMAIN; // e.g. '.yourdomain.com'
}

exports.sendCookie = (user = {}, statusCode,res) => {
    const token = user.generateToken();

    res.cookie('token', token, commonOptions);

    res.status(statusCode).json({ success: true, user });
}

exports.deleteCookie = (statusCode,res) => {
  res.cookie('token', "", { ...commonOptions, maxAge: 0 });

    res.status(statusCode).json({ success: true,message: "User logged out.." });
}