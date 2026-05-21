# Employee Form Implementation Guide

## Overview

This document provides comprehensive information about the simplified Employee Form implementation, including the new structure, mock API system, and integration guidelines for production APIs.

---

## 📋 What Changed

### Form Fields (Simplified from 5 to 2 core fields)

#### Previous Implementation
- Employee ID (with search/autocomplete)
- First Name
- Last Name
- Department (dropdown)
- Email Address
- Image Upload

#### Current Implementation
- **Employee ID** (with validation)
- **File Upload** (with image cropping)

### Key Features

✅ **Employee ID Validation**
- Real-time validation against the system
- Visual feedback (success/error states)
- Debounced API calls to prevent excessive requests
- Clear error messages

✅ **File Upload**
- Drag-and-drop support
- Image cropping with 3:1 aspect ratio
- File type validation (JPEG, PNG, WebP)
- File size validation (max 5MB)
- File preview with size information

✅ **Form States**
- Loading states with spinners
- Error handling with visual indicators
- Success messaging
- Form validation feedback

---

## 🏗️ Project Structure

```
src/
├── pages/
│   └── EmployeeForm.tsx          # Main form component
├── components/
│   ├── form/
│   │   └── ImageUpload.tsx       # Image upload with cropping
│   └── ui/
│       ├── button.tsx
│       ├── input.tsx
│       ├── label.tsx
│       └── ...
├── services/
│   └── api.ts                    # Mock & real API endpoints
├── types/
│   └── index.ts                  # TypeScript interfaces & schemas
└── utils/
    └── cn.ts                     # Class name utilities
```

---

## 🔌 API Integration Guide

### Current Mock API Structure

The `services/api.ts` file contains three mock functions with detailed comments:

#### 1. **Employee ID Validation**

```typescript
export const validateEmployeeId = async (
  employeeId: string
): Promise<EmployeeValidationResponse>
```

**Mock Data:**
```typescript
const MOCK_VALID_EMPLOYEE_IDS = ['EMP001', 'EMP002', 'EMP003', 'EMP101', 'EMP102'];
```

**Response Format:**
```typescript
{
  isValid: boolean,
  exists: boolean,
  employeeId: string,
  message?: string
}
```

**To Replace with Real API:**
```typescript
export const validateEmployeeId = async (
  employeeId: string
): Promise<EmployeeValidationResponse> => {
  const response = await axios.post('/api/employees/validate', {
    employeeId
  });
  return response.data;
};
```

---

#### 2. **File Upload**

```typescript
export const uploadEmployeeFile = async (
  employeeId: string,
  file: File
): Promise<FileUploadResponse>
```

**Response Format:**
```typescript
{
  id: string,
  employeeId: string,
  fileName: string,
  fileSize: number,
  mimeType: string,
  uploadUrl: string,
  createdAt: string
}
```

**To Replace with Real API:**
```typescript
export const uploadEmployeeFile = async (
  employeeId: string,
  file: File
): Promise<FileUploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await axios.post(
    `/api/employees/${employeeId}/upload`,
    formData,
    {
      headers: { 'Content-Type': 'multipart/form-data' }
    }
  );
  return response.data;
};
```

---

#### 3. **Form Submission**

```typescript
export const submitEmployeeForm = async (
  employeeId: string,
  file: File
): Promise<SubmissionResponse>
```

**Response Format:**
```typescript
{
  success: boolean,
  message: string,
  data: {
    id: string,
    employeeId: string,
    fileName: string,
    uploadedAt: string
  }
}
```

**To Replace with Real API:**
```typescript
export const submitEmployeeForm = async (
  employeeId: string,
  file: File
): Promise<SubmissionResponse> => {
  const formData = new FormData();
  formData.append('employeeId', employeeId);
  formData.append('file', file);
  
  const response = await axios.post('/api/employees/submit', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return response.data;
};
```

---

## 🎯 Form Validation

### Employee ID Rules
- **Required:** Yes
- **Min Length:** 3 characters
- **Max Length:** 50 characters
- **Format:** Uppercase letters and numbers only (e.g., EMP001)
- **Backend Validation:** Must exist in employee database

### File Upload Rules
- **Required:** Yes
- **Accepted Formats:** JPEG, JPG, PNG, WebP
- **Max File Size:** 5MB
- **Aspect Ratio:** 3:1 (enforced by cropping tool)
- **Processing:** Cropped and compressed to JPEG at 95% quality

### Schema Definition (Zod)

Located in `src/types/index.ts`:

```typescript
export const employeeFormSchema = z.object({
  employeeId: z
    .string()
    .min(1, "Employee ID is required")
    .min(3, "Employee ID must be at least 3 characters")
    .max(50, "Employee ID must not exceed 50 characters")
    .regex(/^[A-Z0-9]+$/, "Employee ID must contain only uppercase letters and numbers"),
  image: z
    .any()
    .refine((file) => file instanceof File, "Image file is required")
    .refine((file) => file?.size <= MAX_FILE_SIZE, "File size must not exceed 5MB")
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
      `Only .jpg, .jpeg, .png, .webp formats are supported`
    ),
});
```

---

## 🚀 Usage & User Flow

### Step 1: Enter Employee ID
1. User enters Employee ID in the input field
2. On blur, the form validates against the backend
3. Visual feedback provided:
   - ✅ Green border + checkmark = Valid
   - ❌ Red border + alert = Invalid
   - ⏳ Blue spinner = Validating

### Step 2: Upload & Crop File
1. User drags & drops file or clicks to select
2. Image appears in cropping tool
3. User adjusts crop area (3:1 aspect ratio)
4. User clicks "Crop" to finalize
5. File info displayed (name, size)

### Step 3: Submit Form
1. Submit button is enabled only when:
   - Employee ID is validated
   - File is selected
   - No validation errors
2. User clicks Submit
3. Loading state appears
4. On success: Success message + form reset
5. On error: Error alert with details

---

## 🔧 React Query (TanStack Query)

All API calls use React Query hooks for:
- Automatic caching
- Request deduplication
- Loading/error state management
- Automatic retry logic
- Request cancellation

### Hooks Used

```typescript
// Employee ID Validation
const validateEmployeeMutation = useValidateEmployeeId();

// Form Submission
const submitFormMutation = useSubmitEmployeeForm();

// Access states
- isPending: boolean (loading)
- error: Error | null
- data: ResponseType | undefined
- mutateAsync: (params) => Promise<ResponseType>
```

---

## 🎨 UI Components Used

### Custom Components
- `Input` - Text input with validation states
- `Button` - Submit button with loading state
- `Label` - Form labels
- `ImageUpload` - Image upload with cropping

### Icons (from lucide-react)
- `Loader2` - Loading spinner
- `AlertCircle` - Error indicator
- `CheckCircle2` - Success indicator

### Styling
- **Framework:** Tailwind CSS
- **Responsive:** Mobile-first (mobile, tablet, desktop)
- **Colors:** Blue theme with error (red) and success (green) states
- **Spacing:** Consistent padding/margin system

---

## 📦 Dependencies

### Core
- `react` - UI framework
- `react-hook-form` - Form state management
- `zod` - Schema validation
- `@hookform/resolvers` - Zod resolver for react-hook-form
- `@tanstack/react-query` - Data fetching & caching
- `axios` - HTTP client

### File Upload & Cropping
- `react-dropzone` - Drag & drop file upload
- `react-image-crop` - Image cropping tool

### UI & Icons
- `tailwindcss` - Styling
- `lucide-react` - Icons

---

## 🧪 Testing Mock API

### Valid Employee IDs (for testing)
```
EMP001
EMP002
EMP003
EMP101
EMP102
```

### Test Cases

**Test 1: Successful Submission**
1. Enter: `EMP001`
2. Wait for validation ✅
3. Upload a valid image file
4. Click Submit
5. Expected: Success message

**Test 2: Invalid Employee ID**
1. Enter: `INVALID123`
2. Wait for validation ❌
3. Expected: Error message "Employee ID not found"

**Test 3: Invalid File**
1. Enter: `EMP001`
2. Try to upload .txt or large file
3. Expected: File validation error

**Test 4: Incomplete Form**
1. Enter: `EMP001` (validate)
2. Don't upload file
3. Submit button remains disabled
4. Expected: Button disabled until all fields valid

---

## 🔄 Replacing Mock API with Real API

### Step-by-Step Integration

1. **Update API endpoints in `services/api.ts`**
   - Replace mock functions with axios calls
   - Update API URLs to your backend endpoints
   - Add error handling for backend errors

2. **Update types if needed in `src/types/index.ts`**
   - Adjust response interfaces to match your backend
   - Add additional validation if required

3. **Update mock data in `services/api.ts`**
   - Remove `MOCK_VALID_EMPLOYEE_IDS`
   - Remove setTimeout delays
   - Add real API error handling

4. **Example: Complete API file replacement**

```typescript
// In services/api.ts
import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL;

export const validateEmployeeId = async (
  employeeId: string
): Promise<EmployeeValidationResponse> => {
  try {
    const response = await axios.post(
      `${API_BASE_URL}/employees/validate`,
      { employeeId }
    );
    return response.data;
  } catch (error) {
    if (axios.isAxiosError(error)) {
      throw new Error(error.response?.data?.message || 'Validation failed');
    }
    throw error;
  }
};

// Repeat for other functions...
```

---

## 📝 Code Quality Features

✅ **TypeScript**
- Full type safety
- Interface exports for components
- Strict null checking

✅ **Error Handling**
- Try-catch blocks
- User-friendly error messages
- Network error handling
- Validation error display

✅ **Performance**
- Debounced Employee ID validation
- React Query caching
- Memoized callbacks with useCallback
- Optimized re-renders

✅ **Accessibility**
- Form labels linked to inputs
- Error messages associated with fields
- Keyboard navigation support
- Loading state announcements

✅ **Best Practices**
- Clean component architecture
- Reusable services
- Separated concerns
- Consistent naming conventions
- Comprehensive comments

---

## 🐛 Troubleshooting

### Form not submitting
- Check that Employee ID is validated (green check mark)
- Check that file is selected
- Check browser console for network errors
- Verify API endpoints are correct

### Validation errors not clearing
- Clear browser cache
- Check that input values are correct
- Verify regex patterns in schema

### File upload failing
- Check file size (max 5MB)
- Check file format (JPEG, PNG, WebP only)
- Check that file is not corrupted
- Check browser console for error details

### API integration issues
- Verify API URLs in environment variables
- Check CORS settings on backend
- Test endpoints with Postman/curl
- Add logging to API functions

---

## 📞 Support & Maintenance

### Making Changes

1. **Adding new fields:**
   - Add to schema in `types/index.ts`
   - Add to form in `EmployeeForm.tsx`
   - Add to API payload in `services/api.ts`

2. **Modifying validation:**
   - Update Zod schema in `types/index.ts`
   - Update error messages
   - Test with various inputs

3. **Changing API structure:**
   - Update mock functions in `services/api.ts`
   - Update response interfaces in `types/index.ts`
   - Update form handling in `EmployeeForm.tsx`

### Performance Monitoring

Monitor these metrics in production:
- Form submission success rate
- API validation latency
- File upload success rate
- Error frequency by type

---

## 📚 Related Files

- [EmployeeForm.tsx](./src/pages/EmployeeForm.tsx) - Main component
- [api.ts](./src/services/api.ts) - API integration
- [index.ts (types)](./src/types/index.ts) - Type definitions
- [ImageUpload.tsx](./src/components/form/ImageUpload.tsx) - Image upload component

---

**Last Updated:** May 21, 2026  
**Version:** 1.0.0  
**Status:** ✅ Production Ready
