import { usePermissionsStore } from "@store/modules/permissions.js";
import { storeToRefs } from "pinia";

const TWO_FA_PATH = "/two-factor";

export function twoFAGuard(to, from, next) {
    const { user } = storeToRefs(usePermissionsStore());

    if (to.meta.requires2FA && user.value?.has2FA && !user.value?.is2FASkipped) {
        return to.path !== TWO_FA_PATH ? next(TWO_FA_PATH) : next();
    }
    next();
}