import { Response } from "express";

export class HttpError extends Error {
    constructor(public status: number, message: string) {
        super(message);
    }
}

export const responderError = (res: Response, error: any) => {
    if (error instanceof HttpError) {
        return res.status(error.status).json({ message: error.message });
    }
    if (error.sqlState === "45000") {
        return res.status(400).json({ message: error.sqlMessage });
    }
    return res.status(500).json({ message: error.message });
};
