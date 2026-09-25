import { getServerSession } from "next-auth";
import { createUploadthing, type FileRouter } from "uploadthing/next";
import { UploadThingError } from "uploadthing/server";
import { authOptions } from "@/lib/auth";

const f = createUploadthing();

// Only logged-in users can upload, one small image at a time.
// The saved URL is stored by /api/profile/avatar after the upload finishes.
export const ourFileRouter = {
  avatar: f({ image: { maxFileSize: "2MB", maxFileCount: 1 } })
    .middleware(async () => {
      const session = await getServerSession(authOptions);
      if (!session?.user?.id) throw new UploadThingError("Log in to upload a photo.");
      return { userId: session.user.id };
    })
    .onUploadComplete(async ({ metadata }) => ({ uploadedBy: metadata.userId })),
} satisfies FileRouter;

export type OurFileRouter = typeof ourFileRouter;
