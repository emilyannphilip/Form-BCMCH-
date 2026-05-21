import { useState, useCallback } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { employeeFormSchema } from '../types';
import type { EmployeeFormValues } from '../types';
import { Input } from '../components/ui/input';
import { Button } from '../components/ui/button';
import { Label } from '../components/ui/label';
import { ImageUpload } from '../components/form/ImageUpload';
import { 
  useSubmitEmployeeForm 
} from '../services/api';
import { Loader2, AlertCircle, CheckCircle2 } from 'lucide-react';

interface FileInfo {
  name: string;
  size: number;
  preview?: string;
}

export function EmployeeForm() {
  const {
    register,
    handleSubmit,
    control,
    formState: { errors, isSubmitting },
    reset,
    setValue,
    watch,
  } = useForm<EmployeeFormValues>({
    resolver: zodResolver(employeeFormSchema),
    defaultValues: {
      employeeId: '',
      image: undefined,
    },
    mode: 'onChange',
  });

  // State management
  const [fileInfo, setFileInfo] = useState<FileInfo | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  // API mutation
  const submitFormMutation = useSubmitEmployeeForm();

  // Watch form values
  const imageValue = watch('image');

  /**
   * Handle image upload from ImageUpload component
   */
  const handleImageCropped = useCallback(
    (file: File) => {
      setValue('image', file, { shouldValidate: true });
      setFileInfo({
        name: file.name,
        size: file.size,
      });
    },
    [setValue]
  );

  /**
   * Handle form submission
   */
  const onSubmit = async (data: EmployeeFormValues) => {
    try {
      setSubmitSuccess(false);

      // Submit form with Employee ID and File
      const response = await submitFormMutation.mutateAsync({
        employeeId: data.employeeId,
        file: data.image,
      });

      if (response.success) {
        setSubmitSuccess(true);
        reset();
        setFileInfo(null);

        // Reset success message after 5 seconds
        setTimeout(() => setSubmitSuccess(false), 5000);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to submit form';
      alert(errorMessage);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Employee Form</h1>
          {/* <p className="text-gray-600 text-sm mt-2">Submit your Employee ID and file upload</p> */}
        </div>

        {/* Success Message */}
        {submitSuccess && (
          <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-green-800 font-medium">Success!</p>
              <p className="text-green-700 text-sm">Your form has been submitted successfully.</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Employee ID Section */}
          <div className="space-y-2">
            <Label htmlFor="employeeId" className="text-gray-700 font-medium">
              Employee ID *
            </Label>
            <Input
              id="employeeId"
              type="text"
              placeholder="e.g., 12345"
              {...register('employeeId')}
              disabled={isSubmitting || submitFormMutation.isPending}
              className={`
                w-full px-4 py-2 border rounded-lg text-sm
                transition-colors duration-200
                ${errors.employeeId ? 'border-red-500 bg-red-50' : 'border-gray-300'}
                ${isSubmitting || submitFormMutation.isPending ? 'opacity-50 cursor-not-allowed' : ''}
              `}
            />

            {/* Validation Error */}
            {errors.employeeId && (
              <div className="flex items-center gap-2 text-red-600 text-sm">
                <AlertCircle className="w-4 h-4" />
                <span>{errors.employeeId.message}</span>
              </div>
            )}
          </div>

          {/* File Upload Section */}
          <div className="space-y-2">
            <Label htmlFor="image" className="text-gray-700 font-medium">
              File Upload *
            </Label>
            <Controller
              name="image"
              control={control}
              render={() => (
                <ImageUpload
                  onImageCropped={handleImageCropped}
                  error={errors.image?.message as string}
                />
              )}
            />

            {/* File Info */}
            {fileInfo && (
              <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm text-gray-700">
                  <span className="font-medium">File:</span> {fileInfo.name}
                </p>
                {/* <p className="text-sm text-gray-600">
                  <span className="font-medium">Size:</span> {(fileInfo.size / 1024 / 1024).toFixed(2)} MB
                </p> */}
              </div>
            )}

            {/* File Upload Error */}
            {errors.image && (
              <div className="flex items-center gap-2 text-red-600 text-sm mt-2">
                <AlertCircle className="w-4 h-4" />
                <span>{String(errors.image.message)}</span>
              </div>
            )}
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={
              !imageValue || 
              isSubmitting || 
              submitFormMutation.isPending
            }
            className={`
              w-full py-2 px-4 rounded-lg font-medium text-white
              transition-all duration-200 flex items-center justify-center gap-2
              ${
                !imageValue || isSubmitting || submitFormMutation.isPending
                  ? 'bg-gray-300 cursor-not-allowed'
                  : 'bg-blue-600 hover:bg-blue-700 active:bg-blue-800'
              }
            `}
          >
            {isSubmitting || submitFormMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Submitting...</span>
              </>
            ) : (
              'Submit'
            )}
          </Button>

          {/* Helper Text */}
          <div className="pt-4 border-t border-gray-200">
            <p className="text-xs text-gray-500 leading-relaxed">
              <span className="font-medium">Note:</span> Enter Employee ID and upload a file to proceed.
            </p>
          </div>
        </form>
      </div>
    </div>
  );
}
