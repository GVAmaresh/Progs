import { createClerkClient, User } from "@clerk/backend";
import { useUser } from "@clerk/nextjs";

const secretKey = process.env.CLERK_SECRET_KEY;

const clerkClient = createClerkClient({ secretKey });

export async function getUserInfo() {
  try {
    const { user } = useUser();


    if (!user) {
      return null;
    }
    const response = await clerkClient.users.getUser(user?.id);

    if (!response) {
      return null;
    }

    return {
      fullName: response.fullName || "No name provided",
      profileImageUrl: response.imageUrl || "No image URL provided",
      email: response.emailAddresses || "No email address provided"
    };
  } catch (error) {
    console.error("Error fetching user information:", error);
    throw new Error("Failed to retrieve user information");
  }
}
