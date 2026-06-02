import type { User } from "@/shared/contexts/UserContext";

import type { ProfileValues } from "./validation";

export function initialValuesFromUser(user: User): ProfileValues {
  return {
    firstName: user.firstName,
    lastName: user.lastName,
  };
}
