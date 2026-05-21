# Quick Reference: Employee Form Migration

## Summary of Changes

### What Was Removed
- ❌ First Name field
- ❌ Last Name field
- ❌ Department dropdown
- ❌ Email field
- ❌ Complex employee search/autocomplete
- ❌ Employee details fetching

### What Was Added
- ✅ Employee ID validation API integration
- ✅ Real-time validation feedback
- ✅ File upload with error states
- ✅ Loading indicators
- ✅ Success messaging
- ✅ Improved error handling

### New Features
- 🎯 Employee ID validation against database
- 📸 Image cropping with 3:1 aspect ratio
- 📊 File size and type validation
- ⚡ Debounced API calls
- 🔄 React Query integration
- 📱 Responsive mobile-friendly design

---

## Files Modified

| File | Changes |
|------|---------|
| `src/pages/EmployeeForm.tsx` | Complete rewrite - simplified form with 2 fields |
| `src/services/api.ts` | Replaced functions with Employee ID validation & file upload |
| `src/types/index.ts` | Updated schema and types |
| `src/components/form/ImageUpload.tsx` | No changes needed (already complete) |

---

## API Functions Reference

### `validateEmployeeId(employeeId: string)`
- **Purpose:** Validate if Employee ID exists
- **Mock Delay:** 800ms
- **Returns:** `EmployeeValidationResponse`
- **To Replace:** Change `setTimeout` to `axios.post('/api/employees/validate', ...)`

### `uploadEmployeeFile(employeeId: string, file: File)`
- **Purpose:** Upload file for employee
- **Mock Delay:** 1200ms
- **Returns:** `FileUploadResponse`
- **To Replace:** Change to `axios.post('/api/employees/{id}/upload', ...)`

### `submitEmployeeForm(employeeId: string, file: File)`
- **Purpose:** Final form submission
- **Mock Delay:** 1500ms
- **Returns:** `SubmissionResponse`
- **To Replace:** Change to `axios.post('/api/employees/submit', ...)`

---

## Type Definitions

```typescript
// Employee ID Validation Response
{
  isValid: boolean;
  exists: boolean;
  employeeId: string;
  message?: string;
}

// File Upload Response
{
  id: string;
  employeeId: string;
  fileName: string;
  fileSize: number;
  mimeType: string;
  uploadUrl: string;
  createdAt: string;
}

// Form Submission Response
{
  success: boolean;
  message: string;
  data: {
    id: string;
    employeeId: string;
    fileName: string;
    uploadedAt: string;
  };
}
```

---

## Validation Rules

| Field | Rules |
|-------|-------|
| Employee ID | Min 3, Max 50 chars, A-Z 0-9 only |
| File | Max 5MB, JPEG/PNG/WebP only, 3:1 aspect ratio |

---

## Testing Mock API

**Valid Employee IDs:**
- EMP001
- EMP002
- EMP003
- EMP101
- EMP102

---

## Development Server

```bash
npm run dev
# Runs at http://localhost:5173
```

## Build for Production

```bash
npm run build
# Output in /dist folder
```

---

## Integration Checklist

When replacing mock API with real backend:

- [ ] Update `validateEmployeeId()` function
- [ ] Update `uploadEmployeeFile()` function
- [ ] Update `submitEmployeeForm()` function
- [ ] Update API base URL/endpoints
- [ ] Test validation flow
- [ ] Test file upload flow
- [ ] Test error scenarios
- [ ] Test network errors
- [ ] Verify loading states
- [ ] Deploy to production

---

**Status:** ✅ Ready for API Integration  
**Last Updated:** May 21, 2026
