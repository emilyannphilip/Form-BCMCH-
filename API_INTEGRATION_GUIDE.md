# API Integration Example

This file shows practical examples of how to replace the mock API with real backend API calls.

## Option 1: Axios with Real Backend (Recommended)

### Step 1: Create an Axios Instance

Create a new file: `src/services/axiosClient.ts`

```typescript
import axios, { AxiosInstance } from 'axios';

const axiosClient: AxiosInstance = axios.create({
  baseURL: process.env.REACT_APP_API_BASE_URL || 'https://api.your-domain.com',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add response interceptor for error handling
axiosClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      // Backend returned error response
      console.error('API Error:', error.response.data);
    } else if (error.request) {
      // Request made but no response
      console.error('Network Error:', error.message);
    } else {
      // Other errors
      console.error('Error:', error.message);
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
```

### Step 2: Update API Functions

Replace functions in `src/services/api.ts`:

```typescript
import { useMutation } from '@tanstack/react-query';
import axiosClient from './axiosClient';
import type { 
  EmployeeValidationResponse, 
  SubmissionResponse 
} from '../types';

/**
 * Validate Employee ID with Real Backend
 */
export const validateEmployeeId = async (
  employeeId: string
): Promise<EmployeeValidationResponse> => {
  try {
    const response = await axiosClient.post<EmployeeValidationResponse>(
      '/employees/validate',
      { employeeId }
    );
    return response.data;
  } catch (error) {
    if (error.response?.status === 404) {
      return {
        isValid: false,
        exists: false,
        employeeId,
        message: 'Employee ID not found',
      };
    }
    throw new Error('Failed to validate Employee ID');
  }
};

/**
 * Submit Employee Form with Real Backend
 */
export const submitEmployeeForm = async (
  employeeId: string,
  file: File
): Promise<SubmissionResponse> => {
  const formData = new FormData();
  formData.append('employeeId', employeeId);
  formData.append('file', file);

  try {
    const response = await axiosClient.post<SubmissionResponse>(
      '/employees/submit',
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      }
    );
    return response.data;
  } catch (error) {
    throw new Error('Failed to submit form. Please try again.');
  }
};

// Keep React Query hooks the same
export const useValidateEmployeeId = () => {
  return useMutation({
    mutationFn: (employeeId: string) => validateEmployeeId(employeeId),
  });
};

export const useSubmitEmployeeForm = () => {
  return useMutation({
    mutationFn: ({ employeeId, file }: { employeeId: string; file: File }) =>
      submitEmployeeForm(employeeId, file),
  });
};
```

### Step 3: Set Environment Variables

Create `.env` file in project root:

```env
REACT_APP_API_BASE_URL=https://api.your-domain.com
```

For development:
```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

---

## Option 2: Using Fetch API

If you prefer native Fetch over Axios:

```typescript
/**
 * Validate Employee ID using Fetch
 */
export const validateEmployeeId = async (
  employeeId: string
): Promise<EmployeeValidationResponse> => {
  const response = await fetch(
    `${process.env.REACT_APP_API_BASE_URL}/employees/validate`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ employeeId }),
    }
  );

  if (!response.ok) {
    if (response.status === 404) {
      return {
        isValid: false,
        exists: false,
        employeeId,
        message: 'Employee ID not found',
      };
    }
    throw new Error('Validation failed');
  }

  return response.json();
};

/**
 * Submit Employee Form using Fetch
 */
export const submitEmployeeForm = async (
  employeeId: string,
  file: File
): Promise<SubmissionResponse> => {
  const formData = new FormData();
  formData.append('employeeId', employeeId);
  formData.append('file', file);

  const response = await fetch(
    `${process.env.REACT_APP_API_BASE_URL}/employees/submit`,
    {
      method: 'POST',
      body: formData,
      // Note: Don't set Content-Type header - browser will set it with boundary
    }
  );

  if (!response.ok) {
    throw new Error('Failed to submit form');
  }

  return response.json();
};
```

---

## Option 3: With Authentication (JWT Token)

If your backend requires authentication:

```typescript
import axiosClient from './axiosClient';

// Add token to requests
axiosClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Handle token refresh on 401
axiosClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      // Token expired - refresh it
      try {
        const newToken = await refreshToken();
        localStorage.setItem('authToken', newToken);
        // Retry original request with new token
        return axiosClient(error.config);
      } catch (refreshError) {
        // Redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

async function refreshToken(): Promise<string> {
  const response = await axiosClient.post('/auth/refresh');
  return response.data.token;
}
```

---

## Backend API Endpoints Required

Your backend should provide these endpoints:

### 1. Employee ID Validation

**Endpoint:** `POST /employees/validate`

**Request:**
```json
{
  "employeeId": "EMP001"
}
```

**Response (Success):**
```json
{
  "isValid": true,
  "exists": true,
  "employeeId": "EMP001",
  "message": "Employee ID is valid"
}
```

**Response (Not Found):**
```json
{
  "isValid": false,
  "exists": false,
  "employeeId": "INVALID",
  "message": "Employee ID not found"
}
```

**HTTP Status:**
- 200: Valid or Invalid (both return 200)
- 400: Bad request (invalid input)
- 500: Server error

---

### 2. Employee Form Submission

**Endpoint:** `POST /employees/submit`

**Request:** (multipart/form-data)
- Field: `employeeId` (string)
- Field: `file` (binary)

**Response (Success):**
```json
{
  "success": true,
  "message": "Form submitted successfully",
  "data": {
    "id": "submission_12345",
    "employeeId": "EMP001",
    "fileName": "cropped-image.jpg",
    "uploadedAt": "2026-05-21T10:30:00Z"
  }
}
```

**Response (Error):**
```json
{
  "success": false,
  "message": "File upload failed",
  "error": "File size exceeds limit"
}
```

**HTTP Status:**
- 200: Success
- 400: Bad request
- 401: Unauthorized
- 413: Payload too large
- 500: Server error

---

## Testing Integration

### 1. Test with Mock API First

Before integrating with real backend, test locally:

```bash
npm run dev
# Form works with mock API
```

### 2. Update Environment Variable

```env
REACT_APP_API_BASE_URL=http://localhost:3000/api
```

### 3. Test Real API

```bash
# Start your backend server
npm run dev

# Test Employee ID validation
# Enter: EMP001
# Expected: Success or Error from your backend
```

### 4. Handle Errors

The form will display errors from your backend:

```typescript
// Backend error example
{
  response: {
    status: 400,
    data: {
      message: "Invalid employee ID format"
    }
  }
}

// User sees: "Invalid employee ID format"
```

---

## Common Issues & Solutions

### Issue 1: CORS Error

**Error:** `Access to XMLHttpRequest blocked by CORS policy`

**Solution:** Add CORS headers to backend:
```python
# Flask example
from flask_cors import CORS
CORS(app, origins=["http://localhost:5173", "https://your-domain.com"])

# Express example
app.use(cors({
  origin: ['http://localhost:5173', 'https://your-domain.com'],
  credentials: true
}));
```

---

### Issue 2: Timeout on Slow Network

**Solution:** Increase timeout
```typescript
const axiosClient = axios.create({
  timeout: 30000, // 30 seconds instead of 10
  // ...
});
```

---

### Issue 3: File Upload Too Slow

**Solution:** Show progress
```typescript
export const submitEmployeeForm = async (
  employeeId: string,
  file: File,
  onProgress?: (progress: number) => void
): Promise<SubmissionResponse> => {
  const formData = new FormData();
  formData.append('employeeId', employeeId);
  formData.append('file', file);

  return axiosClient.post('/employees/submit', formData, {
    onUploadProgress: (progressEvent) => {
      const percentCompleted = Math.round(
        (progressEvent.loaded * 100) / progressEvent.total
      );
      onProgress?.(percentCompleted);
    },
  }).then(res => res.data);
};
```

Update component:
```typescript
const [uploadProgress, setUploadProgress] = useState(0);

const response = await submitFormMutation.mutateAsync({
  employeeId: data.employeeId,
  file: data.image,
  onProgress: setUploadProgress,
});
```

---

## Deployment Checklist

- [ ] Backend API endpoints created and tested
- [ ] CORS configured correctly
- [ ] Authentication (JWT) implemented if needed
- [ ] Environment variables set for production
- [ ] API error messages user-friendly
- [ ] Rate limiting configured
- [ ] File upload size limits enforced
- [ ] Database migration completed
- [ ] Load testing completed
- [ ] SSL/TLS certificate valid

---

## Support Resources

- **Axios Documentation:** https://axios-http.com/
- **React Query Documentation:** https://tanstack.com/query/latest
- **React Hook Form:** https://react-hook-form.com/
- **Zod Schema Validation:** https://zod.dev/

---

**Last Updated:** May 21, 2026  
**Version:** 1.0.0
