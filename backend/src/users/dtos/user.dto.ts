import { UserStatus } from "../services/users.service";

export class UserDto {
	username: string;
	first_name: string;
	last_name: string;
	fortytwo_id: string;
	status: UserStatus;
	profilePic: string | null;
}