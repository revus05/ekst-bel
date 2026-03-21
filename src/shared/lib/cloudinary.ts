import { createHash } from "node:crypto";

import { env } from "shared/config/env";

type CloudinaryUploadResult = {
  secure_url: string;
};

function getCloudinarySignature(paramsToSign: Record<string, string>) {
  const serializedParams = Object.entries(paramsToSign)
    .sort(([leftKey], [rightKey]) => leftKey.localeCompare(rightKey))
    .map(([key, value]) => `${key}=${value}`)
    .join("&");

  return createHash("sha1")
    .update(`${serializedParams}${env.CLOUDINARY_API_SECRET}`)
    .digest("hex");
}

async function uploadImageToCloudinary(file: File) {
  const timestamp = String(Math.floor(Date.now() / 1000));
  const folder = "ekst-bel/products";
  const signature = getCloudinarySignature({
    folder,
    timestamp,
  });
  const formData = new FormData();

  formData.set("file", file);
  formData.set("api_key", env.CLOUDINARY_API_KEY);
  formData.set("folder", folder);
  formData.set("signature", signature);
  formData.set("timestamp", timestamp);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${env.CLOUDINARY_CLOUD_NAME}/image/upload`,
    {
      body: formData,
      method: "POST",
    },
  );

  if (!response.ok) {
    const payload = await response.text();

    throw new Error(payload || "Cloudinary upload failed.");
  }

  const payload = (await response.json()) as CloudinaryUploadResult;

  if (!payload.secure_url) {
    throw new Error("Cloudinary did not return secure_url.");
  }

  return payload.secure_url;
}

export { uploadImageToCloudinary };
