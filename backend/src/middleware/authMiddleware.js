import jwt from "jsonwebtoken";

export const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers["authorization"];

        if (!authHeader) {
            return res.status(401).json({ message: "No token provided" });
        }

        const token = authHeader.split(" ")[1];

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        req.user = decoded.userId; // attach oonly what u need, jwt has {message, token, iat, expiry, we need only userId}

        next(); // move forward

    } catch (error) {
        return res.status(401).json({ message: "Invalid token" });
    }
};