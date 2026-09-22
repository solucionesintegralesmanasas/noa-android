import { authGuard } from "@router/guards/auth.js";

export async function authMiddleware({ to, from, next }) {
    return new Promise((resolve) => {
        authGuard(to, from, (res) => { next(res); resolve(); });
    });
}