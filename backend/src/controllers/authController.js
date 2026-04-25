import { signupUser, loginUser, refreshAccessToken } from '../services/authService.js';
import { deleteRefreshToken } from '../repositories/userRepository.js';

export const signup = async (req, res) => {
    try{
        const {email, password} = req.body;
        if(!email || !password){
            return res.status(400).json({ message: "Email and password are required" });
        }
        const result = await signupUser(email, password);
        res.status(201).json(result);

    }catch(error){
        console.error("Signup error:", error);
        res.status(400).json({ message: error.message });
    }
};

export const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ message: "Email and password required" });
        }

        const result = await loginUser(email, password);

        return res.status(200).json(result);

    } catch (error) {
        return res.status(400).json({ message: error.message });
    }
};

export const refreshToken = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        if (!refreshToken) {
            return res.status(400).json({ message: "Refresh token required" });
        }

        const result = await refreshAccessToken(refreshToken);

        return res.status(200).json(result);

    } catch (error) {
        return res.status(401).json({ message: error.message });
    }
};

export const logout = async (req, res) => {
    try {
        const { refreshToken } = req.body;

        await deleteRefreshToken(refreshToken);

        return res.json({ message: "Logged out" });

    } catch (err) {
        return res.status(500).json({ message: "Error logging out" });
    }
};