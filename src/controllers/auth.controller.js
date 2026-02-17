const User = require("../models/User");
const crypto = require("crypto"); 
const { sendVerificationEmail, sendResetPasswordEmail } = require("../utils/emailservice"); 
const jwt = require("jsonwebtoken");

// Generar Token
const generateToken = (id) => {
  return jwt.sign({id}, process.env.JWT_SECRET, { expiresIn: "1h" });
};

// Registrarse
const register = async (req, res, next) => {
  try {
    const { name, surname, email, password } = req.body;
    const newUser = await User.create({ name, surname, email, password });

    newUser.generateVerificationCode();
    await newUser.save();

    try {
      await sendVerificationEmail(email, name, newUser.verificationCode);
      return res.status(201).json({
        ok: true,
        message: "Usuario registrado. Verifica tu email.",
        user: { id: newUser._id, name: newUser.name, email: newUser.email }
      });
    } catch (emailError) {
      await User.findByIdAndDelete(newUser._id);
      return res.status(500).json({ ok: false, message: "Error enviando email", error: emailError.message });
    }
  } catch (error) {
    next(error);
  }
}

// Verificar el mail
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
      sameSite: "strict",
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

// 
const getUserProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select("-password -verificationCode");
    return res.status(200).json({ ok: true, data: user });
  } catch (error) {
    next(error);
  }
}

// cambiar la contraceña 
const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(200).json({ ok: true, message: "Si existe, recibirás instrucciones." });
    }

    const token = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Ajusta el puerto si tu front no es 5173
    const resetUrl = `http://localhost:5173/reset-password/${token}`;

    try {
      // Usamos la función importada (sendResetPasswordEmail) para enviar el correo
      await sendResetPasswordEmail(user.email, user.name, resetUrl);
      return res.status(200).json({ ok: true, message: "Correo enviado" });
    } catch (err) {
      user.resetPasswordToken = undefined;
      user.resetPasswordExpires = undefined;
      await user.save({ validateBeforeSave: false });
      return res.status(500).json({ ok: false, message: "Error enviando correo" });
    }
  } catch (error) {
    next(error);
  }
};

// reseteamos la contraceña  

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

// controlador de inicio de sesion de google


const googleLogin = async (req, res, next) => {
  try {
    const { email, name, surname, googleId } = req.body;

    // 1. Buscamos si el usuario ya existe en nuestra BD
    let user = await User.findOne({ email });

    if (!user) {
      // 2. SI NO EXISTE: Lo creamos automáticamente (Auto-Register)
      // Generamos una contraseña aleatoria segura
      const randomPassword = Math.random().toString(36).slice(-8) + Math.random().toString(36).slice(-8);
      
      user = new User({
        name: name || "User",
        surname: surname || "Google",
        email: email,
        password: randomPassword, // Se hasheará en el pre('save')
        role: "user",
        active: true,
        verifiedEmail: true, // Google ya verificó el email
        googleId: googleId   // Opcional: podrías agregar este campo a tu Schema si quieres
      });

      await user.save();
    }

    // 3. SI YA EXISTE (o acabamos de crearlo): Generamos el Token JWT propio del Hotel
    // (Reutilizamos la lógica de tu login normal)
    const token = generateToken(user._id);

    // 4. Enviamos la Cookie
    res.cookie("token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 3600000 
    });

    return res.status(200).json({
      ok: true,
      message: "Login con Google exitoso",
      user: { id: user._id, name: user.name, email: user.email, role: user.role, photo: user.photo } // Agrega photo al Schema si quieres guardarla
    });

  } catch (error) {
    next(error);
  }
};

const getCurrentUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.user.id).select('-password');

    if (!user) {
      return next(errorHandler(404, 'Usuario no encontrado'));
    }

    res.status(200).json({
      ok: true,
      user,
    });
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