import { findUserByEmail, createUser, storeRefreshToken, findRefreshToken } from "../repositories/userRepository.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

export const signupUser = async (email, password) => {
    const existingUser = await findUserByEmail(email);
    if(existingUser){
        throw new Error("User already exists");
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    await createUser(email, hashedPassword);
    return { message: "User created successfully!" };
};

export const loginUser = async (email, password) => {

    const user = await findUserByEmail(email);

    if (!user) {
        throw new Error("Invalid credentials");
    }

    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
        throw new Error("Invalid credentials");
    }
    const accessToken = jwt.sign(
        { userId: user.id},
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
    );

    const refreshToken = jwt.sign(
        { userId: user.id },
        process.env.JWT_SECRET,
        { expiresIn: "7d" }
    );

    await storeRefreshToken(user.id, refreshToken);

    return {
        accessToken,
        refreshToken
    };
};

export const refreshAccessToken = async (refreshToken) => {
    try {
        // 1. Verify JWT (signature + expiry)
        const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);

        // 2. 🔥 NEW STEP — check if token exists in DB
        const tokenExists = await findRefreshToken(refreshToken);

        if (!tokenExists) {
            throw new Error("Invalid refresh token");
        }

        // 3. Generate new access token
        const newAccessToken = jwt.sign(
            { userId: decoded.userId },
            process.env.JWT_SECRET,
            { expiresIn: "15m" }
        );

        return { accessToken: newAccessToken };

    } catch (error) {
        throw new Error("Invalid refresh token");
    }
};