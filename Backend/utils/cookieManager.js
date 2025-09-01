
exports.sendCookie = (user = {}, statusCode,res) => {
    const token = user.generateToken();

    res.cookie('token', token, {
      expires : new Date(Date.now() + process.env.COOKIE_EXPIRE*24*60*60*1000),
      httpOnly: true,
      maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });

    res.status(statusCode).json({ success: true, user });
}

exports.deleteCookie = (statusCode,res) => {
  res.cookie('token', "", {
      expires : new Date(Date.now()),
      httpOnly: true,
      maxAge: process.env.COOKIE_EXPIRE * 24 * 60 * 60 * 1000, 
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'Lax'
    });

    res.status(statusCode).json({ success: true,message: "User logged out.." });
}