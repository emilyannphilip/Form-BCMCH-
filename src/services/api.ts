/**
 * API Service Module
 * 
 * This module provides mock API endpoints for File Upload and Form Submission.
 * These functions use placeholder implementations that can be easily replaced with real API calls.
 * 
 * INTEGRATION NOTES:
 * - Replace mock setTimeout delays with actual axios/fetch calls
 * - Update mock upload response with real file upload endpoint
 */

import { useMutation } from '@tanstack/react-query';
import type { 
  FileUploadResponse, 
  SubmissionResponse 
} from '../types';

// ============================================================================
// FILE UPLOAD API
// ============================================================================

/**
 * Uploads a file for the given employee
 * 
 * @param employeeId - The employee ID
 * @param file - The file to upload
 * @returns Promise with upload response
 * 
 * REPLACE WITH: 
 * const formData = new FormData();
 * formData.append('file', file);
 * axios.post(`/api/employees/${employeeId}/upload`, formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' }
 * })
 */
export const uploadEmployeeFile = async (
  employeeId: string,
  file: File
): Promise<FileUploadResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        id: `upload_${Date.now()}_${Math.random().toString(36).substring(7)}`,
        employeeId,
        fileName: file.name,
        fileSize: file.size,
        mimeType: file.type,
        uploadUrl: URL.createObjectURL(file), // Mock URL - will be real API URL
        createdAt: new Date().toISOString(),
      });
    }, 1200);
  });
};

/**
 * React Query hook for file upload
 */
export const useUploadEmployeeFile = () => {
  return useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: string; file: File }) =>
      uploadEmployeeFile(employeeId, file),
  });
};

// ============================================================================
// FORM SUBMISSION API
// ============================================================================

/**
 * Submits the complete employee form (Employee ID + File)
 * 
 * @param employeeId - The employee ID
 * @param file - The uploaded file
 * @returns Promise with submission response
 * 
 * REPLACE WITH:
 * const formData = new FormData();
 * formData.append('employeeId', employeeId);
 * formData.append('file', file);
 * axios.post('/api/employees/submit', formData, {
 *   headers: { 'Content-Type': 'multipart/form-data' }
 * })
 */
export const submitEmployeeForm = async (
  employeeId: string,
  file: File
): Promise<SubmissionResponse> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        success: true,
        message: 'Employee form submitted successfully',
        data: {
          id: `submission_${Date.now()}`,
          employeeId,
          fileName: file.name,
          uploadedAt: new Date().toISOString(),
        },
      });
    }, 1500);
  });
};

/**
 * React Query hook for form submission
 */
export const useSubmitEmployeeForm = () => {
  return useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: string; file: File }) =>
      submitEmployeeForm(employeeId, file),
  });
};
