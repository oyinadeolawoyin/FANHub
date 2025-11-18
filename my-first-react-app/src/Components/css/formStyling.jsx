// ImageUploadWithCrop Component
// Add this as a separate component file: ImageUploadWithCrop.jsx
import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import getCroppedImg from "../utils/cropImage";
import { Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";

export function ImageUploadWithCrop({ onImageCropped, label = "Upload Image", required = false }) {
  const [imageSrc, setImageSrc] = useState(null);
  const [croppedImage, setCroppedImage] = useState(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [showCropper, setShowCropper] = useState(false);

  const onCropComplete = useCallback((croppedArea, croppedAreaPixels) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleImageSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result);
        setShowCropper(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropSave = async () => {
    try {
      const croppedBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      const croppedFile = new File([croppedBlob], "image.jpg", { type: "image/jpeg" });
      setCroppedImage(URL.createObjectURL(croppedBlob));
      onImageCropped(croppedFile);
      setShowCropper(false);
    } catch (e) {
      console.error(e);
    }
  };

  const handleRemove = () => {
    setCroppedImage(null);
    setImageSrc(null);
    onImageCropped(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="image-upload" className="text-sm sm:text-base font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <input
          id="image-upload"
          type="file"
          accept="image/*"
          onChange={handleImageSelect}
          className="hidden"
          required={required && !croppedImage}
        />
        
        <label
          htmlFor="image-upload"
          className={`image-upload-label flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${croppedImage ? 'bg-transparent' : ''}`}
        >
          {croppedImage ? (
            <div className="relative w-full h-full p-2">
              <img
                src={croppedImage}
                alt="Preview"
                className="w-full h-full object-cover rounded-lg"
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 sm:gap-3 py-6 sm:py-8 px-4">
              <div className="upload-icon-wrapper p-3 sm:p-4 rounded-full transition-transform duration-300 hover:scale-110">
                <Upload className="w-6 sm:w-8 h-6 sm:h-8 upload-icon" />
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-base font-medium text-theme">
                  Click to upload image
                </p>
                <p className="text-xs sm:text-sm mt-1 text-secondary">
                  PNG, JPG up to 10MB
                </p>
              </div>
            </div>
          )}
        </label>
      </div>

      {/* Cropper Modal */}
      {showCropper && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80 backdrop-blur-sm p-4">
          <div className="relative w-full max-w-3xl">
            <div className="bg-card-theme rounded-xl shadow-2xl overflow-hidden">
              <div className="p-3 sm:p-4 border-b border-theme">
                <h3 className="text-base sm:text-lg font-semibold">Crop Your Image</h3>
                <p className="text-xs sm:text-sm text-secondary">Adjust the image to your liking</p>
              </div>
              
              <div className="relative h-64 sm:h-96 bg-black">
                <Cropper
                  image={imageSrc}
                  crop={crop}
                  zoom={zoom}
                  aspect={3 / 4}
                  onCropChange={setCrop}
                  onZoomChange={setZoom}
                  onCropComplete={onCropComplete}
                />
              </div>
              
              <div className="p-3 sm:p-4 border-t border-theme space-y-3 sm:space-y-4">
                <div className="space-y-2">
                  <label className="text-xs sm:text-sm font-medium">Zoom</label>
                  <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.1}
                    value={zoom}
                    onChange={(e) => setZoom(parseFloat(e.target.value))}
                    className="w-full"
                    style={{
                      accentColor: "#2563eb"
                    }}
                  />
                </div>
                
                <div className="flex gap-2 sm:gap-3 justify-end">
                  <Button
                    type="button"
                    onClick={() => setShowCropper(false)}
                    variant="outline"
                    className="px-4 sm:px-6 text-sm sm:text-base"
                  >
                    Cancel
                  </Button>
                  <Button
                    type="button"
                    onClick={handleCropSave}
                    className="btn px-4 sm:px-6 text-sm sm:text-base"
                  >
                    Save & Continue
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// Video Upload Component
export function VideoUploadWithPreview({ onVideoSelected, label = "Upload Video", required = false }) {
  const [videoSrc, setVideoSrc] = useState(null);
  const [videoFile, setVideoFile] = useState(null);

  const handleVideoSelect = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setVideoFile(file);
      setVideoSrc(URL.createObjectURL(file));
      onVideoSelected(file);
    }
  };

  const handleRemove = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoSrc(null);
    setVideoFile(null);
    onVideoSelected(null);
  };

  return (
    <div className="space-y-2">
      <Label htmlFor="video-upload" className="text-sm sm:text-base font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      
      <div className="relative">
        <input
          id="video-upload"
          type="file"
          accept="video/*"
          onChange={handleVideoSelect}
          className="hidden"
          required={required && !videoFile}
        />
        
        <label
          htmlFor="video-upload"
          className={`video-upload-label flex flex-col items-center justify-center w-full h-40 sm:h-48 border-2 border-dashed rounded-xl cursor-pointer transition-all duration-300 ${videoSrc ? 'bg-transparent' : ''}`}
        >
          {videoSrc ? (
            <div className="relative w-full h-full p-2">
              <video
                src={videoSrc}
                className="w-full h-full object-cover rounded-lg"
                controls
              />
              <button
                type="button"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleRemove();
                }}
                className="absolute top-4 right-4 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg z-10"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 sm:gap-3 py-6 sm:py-8 px-4">
              <div className="video-icon-wrapper p-3 sm:p-4 rounded-full transition-transform duration-300 hover:scale-110">
                <Upload className="w-6 sm:w-8 h-6 sm:h-8 video-icon" />
              </div>
              <div className="text-center">
                <p className="text-sm sm:text-base font-medium text-theme">
                  Click to upload video
                </p>
                <p className="text-xs sm:text-sm mt-1 text-secondary">
                  MP4, MOV, AVI up to 100MB
                </p>
              </div>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}

// Custom Select Styles for react-select (moved to index.css)
export const customSelectStyles = {
  control: (base, state) => ({
    ...base,
    backgroundColor: "var(--input-bg)",
    borderColor: state.isFocused ? "#2563eb" : "var(--border-color)",
    boxShadow: state.isFocused ? "0 0 8px rgba(37, 99, 235, 0.3)" : "none",
    "&:hover": {
      borderColor: "#2563eb",
    },
    minHeight: window.innerWidth < 640 ? "38px" : "42px",
    borderRadius: "0.5rem",
    transition: "all 0.3s ease",
    fontSize: window.innerWidth < 640 ? "14px" : "16px",
    padding: window.innerWidth < 640 ? "0 4px" : "0",
  }),
  menu: (base) => ({
    ...base,
    backgroundColor: "var(--card-bg)",
    border: "1px solid var(--border-color)",
    borderRadius: "0.75rem",
    boxShadow: "0 10px 40px rgba(0, 0, 0, 0.15)",
    overflow: "hidden",
    marginTop: "4px",
    fontSize: window.innerWidth < 640 ? "14px" : "16px",
    maxWidth: "100%",
    zIndex: 9999,
  }),
  menuList: (base) => ({
    ...base,
    padding: "4px",
    maxHeight: window.innerWidth < 640 ? "200px" : "300px",
  }),
  option: (base, state) => ({
    ...base,
    backgroundColor: state.isSelected
      ? "#2563eb"
      : state.isFocused
      ? "rgba(37, 99, 235, 0.1)"
      : "transparent",
    color: state.isSelected ? "#ffffff" : "var(--foreground-color)",
    padding: window.innerWidth < 640 ? "8px 10px" : "10px 12px",
    borderRadius: "0.5rem",
    cursor: "pointer",
    transition: "all 0.2s ease",
    fontSize: window.innerWidth < 640 ? "14px" : "16px",
    whiteSpace: "normal",
    wordWrap: "break-word",
    "&:active": {
      backgroundColor: "#2563eb",
    },
  }),
  multiValue: (base) => ({
    ...base,
    backgroundColor: "rgba(37, 99, 235, 0.15)",
    borderRadius: "0.5rem",
    padding: window.innerWidth < 640 ? "1px 2px" : "2px 4px",
    margin: "2px",
    fontSize: window.innerWidth < 640 ? "12px" : "14px",
  }),
  multiValueLabel: (base) => ({
    ...base,
    color: "var(--foreground-color)",
    fontWeight: "500",
    fontSize: window.innerWidth < 640 ? "12px" : "14px",
    padding: window.innerWidth < 640 ? "2px 4px" : "3px 6px",
  }),
  multiValueRemove: (base) => ({
    ...base,
    color: "#2563eb",
    borderRadius: "0 0.5rem 0.5rem 0",
    "&:hover": {
      backgroundColor: "#2563eb",
      color: "#ffffff",
    },
    transition: "all 0.2s ease",
  }),
  singleValue: (base) => ({
    ...base,
    color: "var(--foreground-color)",
    fontSize: window.innerWidth < 640 ? "14px" : "16px",
  }),
  input: (base) => ({
    ...base,
    color: "var(--foreground-color)",
    fontSize: window.innerWidth < 640 ? "14px" : "16px",
  }),
  placeholder: (base) => ({
    ...base,
    color: "var(--secondary-text)",
    fontSize: window.innerWidth < 640 ? "14px" : "16px",
  }),
  valueContainer: (base) => ({
    ...base,
    padding: window.innerWidth < 640 ? "2px 6px" : "2px 8px",
  }),
  indicatorsContainer: (base) => ({
    ...base,
    padding: window.innerWidth < 640 ? "0 4px" : "0 8px",
  }),
};

// Enhanced Form Wrapper Component
export function FormCard({ children, title, description, icon: Icon }) {
  return (
    <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
      <div className="form-card-wrapper border-2 shadow-lg rounded-xl sm:rounded-2xl overflow-hidden animate-fadeIn">
        <div className="p-4 sm:p-6 pb-3 sm:pb-4 border-b form-card-header">
          <div className="flex items-center gap-2 sm:gap-3">
            {Icon && (
              <div className="form-card-icon p-1.5 sm:p-2 rounded-lg flex-shrink-0">
                <Icon className="w-5 h-5 sm:w-6 sm:h-6 icon-primary" />
              </div>
            )}
            <div className="min-w-0 flex-1">
              <h2 className="text-xl sm:text-3xl font-bold gradient-text break-words">{title}</h2>
              {description && (
                <p className="text-xs sm:text-sm mt-0.5 sm:mt-1 text-secondary">
                  {description}
                </p>
              )}
            </div>
          </div>
        </div>
        
        <div className="p-4 sm:p-6">
          {children}
        </div>
      </div>
    </div>
  );
}

// Styled Input Component
export function StyledInput({ label, required, type = "text", ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id || props.name} className="text-sm sm:text-base font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <input
        type={type}
        required={required}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base transition-all duration-300"
        style={{ minWidth: "0" }}
        {...props}
      />
    </div>
  );
}

// Styled Select Component
export function StyledSelect({ label, required, options, ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id || props.name} className="text-base font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <select
        required={required}
        className="w-full px-3 sm:px-4 py-3 text-sm sm:text-base transition-all duration-300"
        style={{ minWidth: "0" }}
        {...props}
      >
        <option value="">Select {label}</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.icon && `${option.icon} `}{option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

// Styled Textarea Component
export function StyledTextarea({ label, required, ...props }) {
  return (
    <div className="space-y-2">
      <Label htmlFor={props.id || props.name} className="text-sm sm:text-base font-semibold">
        {label} {required && <span className="text-red-500">*</span>}
      </Label>
      <textarea
        required={required}
        className="w-full px-3 sm:px-4 py-2.5 sm:py-3 text-sm sm:text-base min-h-32 resize-none transition-all duration-300"
        style={{ minWidth: "0" }}
        {...props}
      />
    </div>
  );
}

export function StyledShadcnSelect({ label, required, options, value, onChange, placeholder, name, id }) {
    return (
      <div className="space-y-2">
        <Label htmlFor={id || name} className="text-sm sm:text-base font-semibold">
          {label} {required && <span className="text-red-500">*</span>}
        </Label>
        <Select 
          value={value || undefined} 
          onValueChange={(val) => onChange({ target: { name, value: val } })}
        >
          <SelectTrigger className="themed-select-trigger w-full">
            <SelectValue placeholder={placeholder || `Select ${label}`} />
          </SelectTrigger>
          <SelectContent className="themed-select-content">
            <SelectGroup>
              {options.map((option) => (
                <SelectItem 
                  key={option.value} 
                  value={String(option.value)}
                  className="themed-select-item cursor-pointer"
                >
                  {option.icon && <span className="mr-2">{option.icon}</span>}
                  {option.label}
                </SelectItem>
              ))}
            </SelectGroup>
          </SelectContent>
        </Select>
      </div>
    );
}