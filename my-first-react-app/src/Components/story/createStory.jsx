// Updated createStory.jsx using Shadcn Select for EVERYTHING (including genre)
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../auth/authContext";
import genreOptions from "../genre/genre";
import { warnings } from "../genre/warning";
import Select from "react-select";
import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  FormCard, 
  ImageUploadWithCrop, 
  StyledInput, 
  StyledShadcnSelect,
  StyledTextarea,
  customSelectStyles 
} from "../css/formStyling";
import { Toast, useToast } from "../utils/toast-modal";

function Createstory() {
  const [form, setForm] = useState({
    title: "",
    file: null,
    summary: "",
    primarygenre: "",
    primarysubgenre: [],
    secondarygenre: "",
    secondarysubgenre: [],
    audience: "",
    type: "",
    age: "",
    status: "ongoing",
    warnings: [],
  });

  const { user } = useAuth();
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const { toast, showToast, closeToast } = useToast();

  const handleChange = (e) => {
    if (!e || !e.target) return;
    const { name, value, type, checked } = e.target;
    setForm((prev) => {
      if (type === "checkbox") {
        return { ...prev, [name]: checked };
      }
      return { ...prev, [name]: value };
    });
  };

  const handleImageCropped = (file) => {
    setForm((prev) => ({ ...prev, file }));
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData();
    formData.append("title", form.title);
    formData.append("summary", form.summary);
    formData.append("status", form.status);
    formData.append("file", form.file);
    formData.append("type", form.type);
    formData.append("primarygenre", form.primarygenre);
    formData.append("primarysubgenre", JSON.stringify(form.primarysubgenre));
    formData.append("secondarygenre", form.secondarygenre);
    formData.append("secondarysubgenre", JSON.stringify(form.secondarysubgenre));
    formData.append("audience", form.audience);
    formData.append("age", form.age);
    formData.append("warnings", JSON.stringify(form.warnings));

    try {
      const response = await fetch("https://fanhub-server.onrender.com/api/stories/create", {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      const data = await response.json();

      if (response.status === 500) {
        navigate("/error", { state: { message: data.message || "Process failed" } });
        return;
      } else {
        if (!response.ok && response.status !== 500) {
          setError(data.message);
          return;
        }
      }

      showToast("Story created successfully!", "success");
      setTimeout(() => {
        navigate(`/dashboard/stories/${user.id}`);
      }, 1500);
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  const typeOptions = [
    { value: "novel", label: "Novel" },
    { value: "short story", label: "Short Story" },
    { value: "flash story", label: "Flash Story"},
    { value: "poem", label: "Poem" },
  ];

  const audienceOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "general", label: "General"},
  ];

  const ageOptions = [
    { value: "kids", label: "Kids" },
    { value: "teen", label: "Teen" },
    { value: "young adult", label: "Young Adult"},
    { value: "adult", label: "Adult"},
  ];

  const statusOptions = [
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  return (
    <FormCard
      title="Create Your Story"
      description="Share your creative masterpiece with the world"
      icon={Sparkles}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={closeToast}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Title */}
        <StyledInput
          label="Story Title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Enter your story title..."
          required
        />

        {/* Cover Image with Cropping */}
        <ImageUploadWithCrop
          label="Cover Image"
          onImageCropped={handleImageCropped}
          required
        />

        {/* Summary */}
        <StyledTextarea
          label="Summary"
          name="summary"
          value={form.summary}
          onChange={handleChange}
          placeholder="Write a captivating summary of your story..."
          required
        />

        {/* Type - Using Shadcn Select */}
        <StyledShadcnSelect
          label="Story Type"
          name="type"
          value={form.type}
          onChange={handleChange}
          options={typeOptions}
          placeholder="Choose story type"
          required
        />

        {/* Genre Selects - NOW USING SHADCN */}
        <GenreSelect
          genre="primarygenre"
          subgenre="primarysubgenre"
          form={form}
          setForm={setForm}
          handleChange={handleChange}
          label="Primary"
          required
        />

        <GenreSelect
          genre="secondarygenre"
          subgenre="secondarysubgenre"
          form={form}
          setForm={setForm}
          handleChange={handleChange}
          label="Secondary"
        />

        {/* Grid Layout for smaller fields - Using Shadcn Selects */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <StyledShadcnSelect
            label="Target Audience"
            name="audience"
            value={form.audience}
            onChange={handleChange}
            options={audienceOptions}
            placeholder="Choose audience"
            required
          />

          <StyledShadcnSelect
            label="Age Group"
            name="age"
            value={form.age}
            onChange={handleChange}
            options={ageOptions}
            placeholder="Choose age group"
            required
          />
        </div>

        {/* Status - Using Shadcn Select */}
        <StyledShadcnSelect
          label="Story Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={statusOptions}
          placeholder="Choose status"
          required
        />

        {/* Warnings - Keep react-select for multi-select */}
        <div className="space-y-2">
          <Label htmlFor="warnings" className="text-sm sm:text-base font-semibold">
            Content Warnings
          </Label>
          <Select
            isMulti
            name="warnings"
            options={warnings.map((warn) => ({
              value: warn,
              label: warn,
            }))}
            value={form.warnings.map((w) => ({ value: w, label: w }))}
            onChange={(selected) => {
              if (selected.length > 4) return;
              setForm((prev) => ({
                ...prev,
                warnings: selected.map((s) => s.value),
              }));
            }}
            placeholder="Select warnings (max 4)"
            className="basic-multi-select"
            classNamePrefix="select"
            styles={customSelectStyles}
          />
          <p className="text-xs sm:text-sm text-secondary">
            Select up to 4 content warnings for your story
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fadeIn">
            <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        {/* Submit Button */}
        <Button
          type="submit"
          disabled={loading}
          className="w-full btn text-sm sm:text-base py-5 sm:py-6 font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Creating...
            </div>
          ) : (
            "Create Story"
          )}
        </Button>
      </form>
    </FormCard>
  );
}

// NEW GenreSelect Component using Shadcn Select
function GenreSelect({ genre, subgenre, form, setForm, handleChange, label, required }) {
  // Convert genre options to Shadcn Select format
  const genreSelectOptions = Object.keys(genreOptions).map((g) => ({
    value: g,
    label: g.replace(/([A-Z])/g, " $1").trim(),
  }));

  return (
    <div className="genre-select-wrapper space-y-3 sm:space-y-4 p-3 sm:p-5 rounded-xl border transition-all duration-300 hover:shadow-md">
      <h3 className="font-semibold text-base sm:text-lg flex items-center gap-2">
        <span className="text-xl sm:text-2xl">🎬</span>
        {label} Genre
      </h3>

      {/* Main Genre - Using Shadcn Select */}
      <StyledShadcnSelect
        label="Genre"
        name={genre}
        id={genre}
        value={form[genre]}
        onChange={handleChange}
        options={genreSelectOptions}
        placeholder="Select a genre"
        required={required}
      />

      {/* Subgenres - Keep react-select for multi-select */}
      <div className="space-y-2">
        <Label htmlFor={subgenre} className="text-sm sm:text-base font-medium">
          Subgenres
        </Label>
        <Select
          isMulti
          name={subgenre}
          options={
            form[genre]
              ? genreOptions[form[genre]].map((sub) => ({
                  value: sub,
                  label: sub,
                }))
              : []
          }
          value={form[subgenre].map((s) => ({ value: s, label: s }))}
          onChange={(selected) => {
            if (selected.length > 4) return;
            setForm((prev) => ({
              ...prev,
              [subgenre]: selected.map((item) => item.value),
            }));
          }}
          isDisabled={!form[genre]}
          placeholder={form[genre] ? "Select up to 4 subgenres" : "Select a genre first"}
          className="basic-multi-select"
          classNamePrefix="select"
          styles={customSelectStyles}
        />
      </div>
    </div>
  );
}

export default Createstory;