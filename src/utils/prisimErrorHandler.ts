import { Prisma } from "@prisma/client";

export function prismaErrorHandler(err: any) {
  // Known Prisma client errors
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    if (err.code === "P2002") {
      const fields = (err.meta?.target as string[] | undefined)?.join(", ");
      return `The following field(s) must be unique: ${fields ?? "unknown"}`;
    }
    if (err.code === "P2025") return "The user could not be found";
    if (err.code === "P2000") return "Value too long for a field";
    if (err.code === "P2003") return "Foreign key constraint failed";
  }

  // Prisma client initialization errors (DB not reachable)
  if (err instanceof Prisma.PrismaClientInitializationError) {
    return "Cannot connect to the database. Please check your database server.";
  }

  // Cloudinary error
  if (err.name === "Error" && err.message.includes("Cloudinary")) {
    return "Failed to upload image. Please try again.";
  }

  // Fallback
  return err.message;
}
