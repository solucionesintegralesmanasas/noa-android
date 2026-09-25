import { BaseService } from "@services/api/base.service.js";
import { validateSchema } from "@utils/validation.js";

export class UserService extends BaseService {
    constructor(tenantId = null) {
        super({ resourcePath: "/users", tenantId, metadata: { service: "user" } });
    }

    async create(data) {
        const { valid, sanitized } = validateSchema(data, {
            email: { type: "email", required: true },
            firstName: { type: "string", required: true },
            lastName: { type: "string", required: true }
        });

        if (!valid) throw new Error("Datos de usuario inválidos");
        return super.create(sanitized);
    }

    async updateProfile(data) {
        return this._request("PATCH", "/me", { data });
    }
}

export const userService = new UserService();