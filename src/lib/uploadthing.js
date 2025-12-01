import { createUploadthing } from "uploadthing/next";
import { auth } from "@/auth";

const f = createUploadthing();

// FileRouter for your app, can contain multiple FileRoutes
export const ourFileRouter = {
  // 1. Profile Picture Upload (Admin Settings / Org Creation)
  profileImage: f({ image: { maxFileSize: "4MB", maxFileCount: 1 } })
    .middleware(async ({ req }) => {
      // This code runs on your server before upload
      const session = await auth();

      // If you throw, the user will not be able to upload
      if (!session) throw new Error("Unauthorized");

      // Whatever is returned here is accessible in onUploadComplete as `metadata`
      return { userEmail: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      // This code RUNS ON YOUR SERVER after upload
      console.log("Profile Image Upload complete for:", metadata.userEmail);
      console.log("file url", file.url);
      
      // Return the URL to the client side to be stored in form state
      return { url: file.url };
    }),

  // 2. Chat Attachments (Images, PDFs, and Audio)
  chatAttachment: f({
    image: { maxFileSize: "16MB", maxFileCount: 1 },
    pdf: { maxFileSize: "16MB", maxFileCount: 1 },
    audio: { maxFileSize: "16MB", maxFileCount: 1 }, // For voice notes
  })
    .middleware(async ({ req }) => {
      const session = await auth();
      if (!session) throw new Error("Unauthorized");
      return { userEmail: session.user.email };
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Chat Attachment uploaded by:", metadata.userEmail);
      return { url: file.url, name: file.name, type: file.type };
    }),
};