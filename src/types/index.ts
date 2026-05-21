import { z } from 'zod';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
const ACCEPTED_IMAGE_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export const employeeFormSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID is required"),
  image: z
    .any()
    .refine((file) => file instanceof File, "Image file is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "File size must not exceed 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      `Only ${ACCEPTED_IMAGE_EXTENSIONS.join(", ")} formats are supported`
    ),
});

export type EmployeeFormValues = z.infer<typeof employeeFormSchema>;

export interface FileUploadResponse {
  id: string;
  employeeId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadUrl: string;
  createdAt: string;
}

export interface SubmissionResponse {
  success: boolean;
  message: string;
  data: {
    id: string;
    employeeId: string;
    fileName: string;
    uploadedAt: string;
  };
}
