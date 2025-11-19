// Updated updateCollection.jsx with modern styling matching createCollection.jsx
import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { useCollections } from "./collectionContext";
import { useAuth } from "../auth/authContext";
import genreOptions from "../genre/genre";
import { warnings } from "../genre/warning";
import Select from "react-select";
import { FolderEdit } from "lucide-react";
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

function UpdateCollections() {
  const { id } = useParams();
  const { user } = useAuth();
  const { collections, setCollections } = useCollections();
  const collection = collections.find(collectionElement => collectionElement.id == id);
  
  const [form, setForm] = useState({
    name: "",
    file: null,
    description: "",
    primarygenre: "",
    primarysubgenre: [],
    secondarygenre: "",
    secondarysubgenre: [],
    audience: "",
    age: "",
    status: "ongoing",
    warnings: [],
  });

  const [error, setError] = useState("");
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [collectionLoading, setCollectionLoading] = useState(true);
  const { toast, showToast, closeToast } = useToast();

  // Populate form when collection is found
  useEffect(() => {
    if (collection) {
      setForm({
        name: collection.name || "",
        file: collection.img || null,
        description: collection.description || "",
        primarygenre: collection.primarygenre || "",
        primarysubgenre: collection.primarysubgenre || [],
        secondarygenre: collection.secondarygenre || "",
        secondarysubgenre: collection.secondarysubgenre || [],
        audience: collection.audience || "",
        age: collection.age || "",
        status: collection.status || "ongoing",
        warnings: collection.warnings || [],
      });
      setCollectionLoading(false);
    }
  }, [collection]);

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
    formData.append("name", form.name);
    formData.append("description", form.description);
    formData.append("status", form.status);
    formData.append("file", form.file);
    formData.append("primarygenre", form.primarygenre);
    formData.append("primarysubgenre", JSON.stringify(form.primarysubgenre));
    formData.append("secondarygenre", form.secondarygenre);
    formData.append("secondarysubgenre", JSON.stringify(form.secondarysubgenre));
    formData.append("audience", form.audience);
    formData.append("age", form.age);
    formData.append("warnings", JSON.stringify(form.warnings));

    try {
      const response = await fetch(`https://fanhub-server.onrender.com/api/gallery/collections/${id}/update`, {
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

      showToast("Collection updated successfully!", "success");
      setCollections(prev =>
        [...prev.filter(s => Number(s.id) !== Number(collection.id)), data.collection]
      );
      setTimeout(() => {
        navigate(`/dashboard/visual stories/${user.id}`);
      }, 1500);
    } catch (err) {
      navigate("/error", { state: { message: "Network error: Please check your internet connection." } });
    } finally {
      setLoading(false);
    }
  }

  const audienceOptions = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
    { value: "general", label: "General" },
  ];

  const ageOptions = [
    { value: "kids", label: "Kids" },
    { value: "teen", label: "Teen" },
    { value: "young adult", label: "Young Adult" },
    { value: "adult", label: "Adult" },
  ];

  const statusOptions = [
    { value: "ongoing", label: "Ongoing" },
    { value: "completed", label: "Completed" },
  ];

  if (collectionLoading) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={toast.isOpen}
          onClose={closeToast}
        />
        <div className="flex flex-col items-center justify-center gap-3 sm:gap-4 p-6 sm:p-8">
          <div className="w-10 h-10 sm:w-12 sm:h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-base sm:text-lg font-medium text-center">Loading collection details...</p>
        </div>
      </div>
    );
  }

  if (!collection) {
    return (
      <div className="max-w-4xl mx-auto py-4 sm:py-8 px-3 sm:px-4">
        <Toast
          message={toast.message}
          type={toast.type}
          isOpen={toast.isOpen}
          onClose={closeToast}
        />
        <div className="p-4 sm:p-6 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800">
          <p className="text-red-600 dark:text-red-400 font-medium text-sm sm:text-base">Collection not found</p>
        </div>
      </div>
    );
  }

  return (
    <FormCard
      title="Update Collection"
      description="Edit your collection details"
      icon={FolderEdit}
    >
      <Toast
        message={toast.message}
        type={toast.type}
        isOpen={toast.isOpen}
        onClose={closeToast}
      />
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <StyledInput
          label="Collection Name"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="Enter collection name..."
          required
        />

        <ImageUploadWithCrop
          label="Collection Cover"
          onImageCropped={handleImageCropped}
          required={false}
        />
        {collection.img && !form.file && (
          <div className="text-xs sm:text-sm text-secondary">
            Current image will be kept if no new image is uploaded
          </div>
        )}

        <StyledTextarea
          label="Description"
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="Describe your collection..."
          required
        />

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

        <StyledShadcnSelect
          label="Collection Status"
          name="status"
          value={form.status}
          onChange={handleChange}
          options={statusOptions}
          placeholder="Choose status"
          required
        />

        <div className="space-y-2">
          <Label htmlFor="warnings" className="text-sm sm:text-base font-semibold">
            Content Warnings
          </Label>
          <Select
            isMulti
            name="warnings"
            options={warnings.map((warn) => ({ value: warn, label: warn }))}
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
        </div>

        {error && (
          <div className="p-3 sm:p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 animate-fadeIn">
            <p className="text-red-600 dark:text-red-400 text-xs sm:text-sm font-medium">{error}</p>
          </div>
        )}

        <Button
          type="submit"
          disabled={loading}
          className="w-full btn text-sm sm:text-base py-5 sm:py-6 font-semibold"
        >
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 sm:w-5 sm:h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Updating...
            </div>
          ) : (
            "Update Collection"
          )}
        </Button>
      </form>
    </FormCard>
  );
}

function GenreSelect({ genre, subgenre, form, setForm, handleChange, label, required }) {
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

export default UpdateCollections;