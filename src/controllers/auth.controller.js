const User = require("../models/User");
const crypto = require("crypto");
const { sendVerificationEmail, sendResetPasswordEmail } = require("../utils/emailservice");
const jwt = require("jsonwebtoken");

// Generar Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Registrarse (MODIFICADO PARA SALTAR EL EMAIL)
const register = async (req, res, next) => {
  try {
    const { name, surname, email, password } = req.body;

    // Creamos el usuario
    const newUser = new User({ name, surname, email, password });

    // TRUCO: Lo marcamos como verificado automáticamente para que pueda hacer login directo
    newUser.verifiedEmail = true;

    await newUser.save();

    // COMENTAMOS EL ENVÍO DE EMAIL PARA QUE RENDER NO SE QUEDE COLGADO
    // await sendVerificationEmail(email, name, newUser.verificationCode);

    return res.status(201).json({
      ok: true,
      message: "Usuario registrado con éxito. Ya puedes iniciar sesión.",
      user: { id: newUser._id, name: newUser.name, email: newUser.email }
    });

  } catch (error) {
    next(error);
  }
}

// Verificar el mail (Lo dejamos por si acaso, pero ya no se usará obligatoriamente)
const verifyEmail = async (req, res, next) => {
  try {
    const { email, code } = req.body;
    const user = await User.findOne({ email });

    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });
    if (user.verifiedEmail) return res.status(400).json({ ok: false, message: "Usuario ya verificado" });
    if (user.verificationCode !== code) return res.status(400).json({ ok: false, message: "Código incorrecto" });
    if (new Date() > user.codeExpiration) return res.status(400).json({ ok: false, message: "El código ha expirado" });

    user.verifiedEmail = true;
    user.verificationCode = null;
    user.codeExpiration = null;
    await user.save();

    return res.status(200).json({ ok: true, message: "Email verificado. Ya puedes iniciar sesión" });
  } catch (error) {
    next(error);
  }
};

// --- LOGIN ---
const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(401).json({ ok: false, message: "Credenciales inválidas" });

    const validPassword = await user.comparePassword(password);
    if (!validPassword) return res.status(401).json({ ok: false, message: "Credenciales inválidas" });

    if (!user.verifiedEmail) return res.status(403).json({ ok: false, message: "Debes verificar tu email primero" });
    if (!user.active) return res.status(403).json({ ok: false, message: "Cuenta suspendida" });

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 3600000
    });

    return res.status(200).json({
      ok: true, message: "Login Exitoso", token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (error) {
    next(error);
  }
}

// --- LOGOUT ---
const logout = async (req, res, next) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ ok: true, message: "Sesión cerrada" });
  } catch (error) {
    next(error);
  }
}

// Obtener perfil
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verificationCode");
    return res.status(200).json({ ok: true, data: user });
  } catch (error) {
    next(error);
  }
}

// Cambiar contraseña (MODIFICADO PARA SALTAR EL EMAIL)
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ ok: true, message: "Si existe, recibirás instrucciones." });
    }

    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Ajustamos la URL dinámicamente según dónde esté el frontend
    const frontendUrl = process.env.FRONTEND_URL || "https://hotel-braul.vercel.app";
    const resetUrl = `${frontendUrl}/reset-password/${token}`;

    // COMENTAMOS EL EMAIL Y MOSTRAMOS EL LINK EN LA CONSOLA DE RENDER
    // await sendResetPasswordEmail(user.email, user.name, resetUrl);
    console.log("=========================================");
    console.log("🔗 LINK PARA RECUPERAR CONTRASEÑA:");
    console.log(resetUrl);
    console.log("=========================================");

    return res.status(200).json({ ok: true, message: "Correo 'enviado'. (Revisa la consola de Render para ver el link)" });

  } catch (error) {
    next(error);
  }
};

// Reseteamos la contraseña  
const resetPassword = async (req, res, next) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ ok: false, message: "Token inválido o expirado" });

    user.password = password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();

    return res.status(200).json({ ok: true, message: "Contraseña restablecida" });
  } catch (error) {
    next(error);
  }
}

// Controlador de inicio de sesion de google
const googleLogin = async (req, res, next) => {
  try {
    const { email, name, surname, googleId } = req.body;

    let user = await User.findOne({ email });

    if (!user) {
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      user = new User({
        name: name || "User",
        surname: surname || "Google",
        email: email,
        password: randomPassword,
        role: "user",
        active: true,
        verifiedEmail: true,
        googleId: googleId
      });
      await user.save();
    }

    const token = generateToken(user._id);

    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 3600000
    });

    return res.status(200).json({
      ok: true,
      message: "Login con Google exitoso",
      token,
      user: { id: user._id, name: user.name, email: user.email, role: user.role, photo: user.photo }
    });

  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ ok: false, message: "Usuario no encontrado" });

    res.status(200).json({ ok: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser,
  verifyEmail,
  getUserProfile,
  forgotPassword,
  resetPassword,
  googleLogin
};