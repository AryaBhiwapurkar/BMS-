import * as screenRepository from "../repositories/screenRepository.js";
import * as theatreRepository from "../repositories/theatreRepository.js";

export const createScreen = async ({ theatre_id, name, capacity }) => {
    const theatre = await theatreRepository.getTheatreById(theatre_id);

    if (!theatre) {
        throw new Error("Theatre not found");
    }

    return await screenRepository.createScreen({
        theatre_id,
        name,
        capacity,
    });
};