import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "schools_logos",
    allowed_formats: ["jpg", "jpeg", "png"],
  } as any,
});

const upload = multer({ storage });

export default upload;
