import React, { useState, useRef } from 'react';
import { useDropzone } from 'react-dropzone';
import ReactCrop, { makeAspectCrop, centerCrop } from 'react-image-crop';
import type { Crop, PixelCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Button } from '../ui/button';
import { Label } from '../ui/label';
import { UploadCloud, X } from 'lucide-react';

interface ImageUploadProps {
  onImageCropped: (file: File) => void;
  error?: string;
}

function centerAspectCrop(
  mediaWidth: number,
  mediaHeight: number,
  aspect: number,
) {
  return centerCrop(
    makeAspectCrop(
      {
        unit: '%',
        width: 90,
      },
      aspect,
      mediaWidth,
      mediaHeight,
    ),
    mediaWidth,
    mediaHeight,
  )
}

export function ImageUpload({ onImageCropped, error }: ImageUploadProps) {
  const [imgSrc, setImgSrc] = useState('');
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<PixelCrop>();
  const [croppedImageUrl, setCroppedImageUrl] = useState<string>('');

  const onDrop = (acceptedFiles: File[]) => {
    if (acceptedFiles && acceptedFiles.length > 0) {
      setCrop(undefined);
      const reader = new FileReader();
      reader.addEventListener('load', () =>
        setImgSrc(reader.result?.toString() || '')
      );
      reader.readAsDataURL(acceptedFiles[0]);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.png', '.jpg', '.jpeg', '.webp']
    },
    maxFiles: 1,
  });

  const onImageLoad = (e: React.SyntheticEvent<HTMLImageElement>) => {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, 3 / 1));
  };

  const generateCroppedImage = async () => {
    if (!completedCrop || !imgRef.current) return;

    const image = imgRef.current;
    const canvas = document.createElement('canvas');
    const scaleX = image.naturalWidth / image.width;
    const scaleY = image.naturalHeight / image.height;

    canvas.width = completedCrop.width;
    canvas.height = completedCrop.height;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.drawImage(
      image,
      completedCrop.x * scaleX,
      completedCrop.y * scaleY,
      completedCrop.width * scaleX,
      completedCrop.height * scaleY,
      0,
      0,
      completedCrop.width,
      completedCrop.height
    );

    canvas.toBlob((blob) => {
      if (!blob) return;
      const file = new File([blob], 'cropped-image.jpg', { type: 'image/jpeg' });
      const croppedUrl = URL.createObjectURL(blob);
      setCroppedImageUrl(croppedUrl);
      onImageCropped(file);
      setImgSrc(''); // close crop view
    }, 'image/jpeg', 0.95);
  };

  const resetImage = () => {
    setImgSrc('');
    setCroppedImageUrl('');
  };

  return (
    <div className="space-y-3">
      <Label>Employee Banner </Label>  

      {!imgSrc && !croppedImageUrl && (
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 flex flex-col items-center justify-center cursor-pointer transition-colors ${isDragActive ? 'border-primary bg-primary/5' : 'border-input hover:border-primary/50'
            } ${error ? 'border-destructive' : ''}`}
        >
          <input {...getInputProps()} />
          <UploadCloud className="h-10 w-10 text-muted-foreground mb-4" />
          <p className="text-sm font-medium">Drag & drop an image here, or click to select</p>
          <p className="text-xs text-muted-foreground mt-2">JPG, PNG, WebP up to 5MB</p>
        </div>
      )}

      {error && <p className="text-[0.8rem] font-medium text-destructive">{error}</p>}

      {imgSrc && (
        <div className="border rounded-lg p-4 bg-muted/30">
          <div className="flex justify-between items-center mb-4">
            <h4 className="text-sm font-medium">Crop Image (Fixed 3:1 Ratio)</h4>
            <Button variant="ghost" size="icon" onClick={resetImage} type="button">
              <X className="h-4 w-4" />
            </Button>
          </div>
          <div className="flex justify-center bg-black/5 rounded-md overflow-hidden max-h-[50vh]">
            <ReactCrop
              crop={crop}
              onChange={(_, percentCrop) => setCrop(percentCrop)}
              onComplete={(c) => setCompletedCrop(c)}
              aspect={3 / 1}
            >
              <img
                ref={imgRef}
                alt="Crop me"
                src={imgSrc}
                onLoad={onImageLoad}
                className="max-h-[50vh] w-auto object-contain"
              />
            </ReactCrop>
          </div>
          <div className="mt-4 flex justify-end">
            <Button onClick={generateCroppedImage} type="button">
              Apply Crop
            </Button>
          </div>
        </div>
      )}

      {croppedImageUrl && (
        <div className="relative border rounded-lg overflow-hidden group">
          <img src={croppedImageUrl} alt="Cropped preview" className="w-full h-auto block" />
          <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
            <Button variant="destructive" onClick={resetImage} type="button">
              Remove Image
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
