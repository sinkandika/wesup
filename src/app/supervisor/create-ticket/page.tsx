"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

type Option = {
  id: string;
  name: string;
};

type TicketItem = {
  id: number;
  categoryId: string;
  title: string;
  description: string;
  images: File[];
};

export default function CreateTicketPage() {
  const [locations, setLocations] = useState<Option[]>([]);
  const [departments, setDepartments] = useState<Option[]>([]);
  const [categories, setCategories] = useState<Option[]>([]);

  const [locationId, setLocationId] = useState("");
  const [departmentId, setDepartmentId] = useState("");
  const [priority, setPriority] = useState("normal");

  const [items, setItems] = useState<TicketItem[]>([
    {
      id: 1,
      categoryId: "",
      title: "",
      description: "",
      images: [],
    },
  ]);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitSuccess, setSubmitSuccess] = useState("");

  // FETCH OPTION
  useEffect(() => {
    async function fetchOptions() {
      try {
        const [locationRes, departmentRes, categoryRes] =
          await Promise.all([
            fetch("/api/locations"),
            fetch("/api/departments"),
            fetch("/api/category"),
          ]);

        const locationResult = await locationRes.json();
        const departmentResult = await departmentRes.json();
        const categoryResult = await categoryRes.json();

        if (locationResult.success) {
          setLocations(locationResult.data);
        }

        if (departmentResult.success) {
          setDepartments(departmentResult.data);
        }

        if (categoryResult.success) {
          setCategories(categoryResult.data);
        }
      } catch (error) {
        console.error("Failed to fetch form options:", error);
      }
    }

    fetchOptions();
  }, []);

  // ADD TICKET ITEM
  function addItem() {
    setItems((currentItems) => [
      ...currentItems,
      {
        id: Date.now(),
        categoryId: "",
        title: "",
        description: "",
        images: [],
      },
    ]);
  }

  function removeItem(id: number) {
    setItems((currentItems) =>
      currentItems.filter((item) => item.id !== id)
    );
  }

  function updateItem(
    id: number,
    field: "categoryId" | "title" | "description",
    value: string
  ) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  }

  function addImages(id: number, files: FileList | File[]) {
    const selectedImages = Array.from(files).filter((file) =>
      file.type.startsWith("image/")
    );

    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === id
          ? {
            ...item,
            images: [...item.images, ... selectedImages],
          }
          : item
      )
    );
  }

  function updateImages(id: number, files: FileList | null) {
    if (!files) return;
    
    addImages(id, files);
  }

  function removeImage(itemId: number, imageIndex: number) {
    setItems((currentItems) =>
      currentItems.map((item) =>
        item.id === itemId
          ? {
              ...item,
              images: item.images.filter(
                (_, index) => index !== imageIndex
              ),
            }
          : item
      )
    );
  }

  // HANDLE SUBMIT
  async function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setIsSubmitting(true);
    setSubmitError("");
    setSubmitSuccess("");

    try {
      const formData = new FormData();

      // Ticket-level data
      formData.append("locationId", locationId);
      formData.append("departmentId", departmentId);
      formData.append("priority", priority);

      // Item data, excluding images
      const ticketItems = items.map((item) => ({
        categoryId: item.categoryId,
        title: item.title.trim(),
        description: item.description.trim(),
      }));

      formData.append("items", JSON.stringify(ticketItems));

      // Images belonging to each item
      items.forEach((item, index) => {
        item.images.forEach((image) => {
          formData.append(`images-${index}`, image);
        });
      });

      // create ticket
      const response = await fetch("/api/tickets", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to create ticket.");
      }

      setSubmitSuccess(
        `Ticket created successfully! ${result.data.ticket.ticket_number}`
      );

      // Reset the form after successful submission
      setIsSubmitting(false);
      setLocationId("");
      setDepartmentId("");
      setPriority("normal");
      setItems([
        {
          id: Date.now(),
          categoryId: "",
          title: "",
          description: "",
          images: [],
        },
      ]);
    } catch (error) {
      setSubmitError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  // SUCCESS MESSAGE TIMEOUT
  useEffect(() => {
    if (submitSuccess) {
      const timer = setTimeout(() => {
        setSubmitSuccess(""); 
      }, 3000); 

      return () => clearTimeout(timer);
    }
  }, [submitSuccess]);

  return (
    <main className="text-color-8">
      <form onSubmit={handleSubmit} className="flex flex-col gap-y-2 max-w-200">
        <div className="bg-white rounded-lg p-8 gap-y-5 flex flex-col">
          <div>
            <h1 className="text-2xl">Create Ticket</h1>
            <p className="text-color-7">
              Submit a new technical issues request.
            </p>
          </div>

          <section className="flex flex-col md:flex-row gap-4">
            <div className="flex flex-col gap-y-1">
              <label htmlFor="location">
                Location
              </label>
              <select
                id="location"
                value={locationId}
                onChange={(event) => setLocationId(event.target.value)}
                required
                className="bg-color-5 px-4 py-3  rounded-md w-50"
              >
                <option value="">Select location</option>
                {locations.map((location) => (
                  <option key={location.id} value={location.id}>
                    {location.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-y-1">
              <label htmlFor="department">
                Department
              </label>
              <select
                id="department"
                value={departmentId}
                onChange={(event) => setDepartmentId(event.target.value)}
                required
                className="bg-color-5 px-4 py-3  rounded-md w-50"
              >
                <option value="">Select department</option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col gap-y-1">
              <label htmlFor="priority">Priority</label>
              <select
                id="priority"
                value={priority}
                onChange={(event) => setPriority(event.target.value)}
                className="bg-color-5 px-4 py-3  rounded-md w-50"
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
          </section>
        </div>

        <section className="flex flex-col gap-y-4">
          {items.map((item, itemIndex) => (
            <div key={item.id} className="flex flex-col gap-y-4 bg-white rounded-lg p-8 ">

              <div className="flex flex-row justify-between">
                <div className="w-fit">
                  <p className="text-sm">Issue #{itemIndex + 1}</p>
                  <p className="border-b"></p>
                </div>
                {items.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeItem(item.id)}
                    className="bg-color-9 py-2 px-4 rounded-lg text-white hover:bg-color-9/80 transition duration-300"
                  >
                    Remove Issue
                  </button>
                )}
              </div>

              <div className="flex flex-col gap-y-1">
                <label htmlFor={`title-${item.id}`}>Title</label>
                <input
                  id={`title-${item.id}`}
                  type="text"
                  value={item.title}
                  onChange={(event) =>
                    updateItem(item.id, "title", event.target.value)
                  }
                  placeholder="Enter your title"
                  required
                  className="w-full rounded-lg border-2 border-color-6 px-4 py-3 outline-none focus:border-color-1"
                />
              </div>
              
              <div className="flex flex-col gap-y-1">
                <label htmlFor={`category-${item.id}`}>Category</label>
                <select
                  id={`category-${item.id}`}
                  value={item.categoryId}
                  onChange={(event) =>
                    updateItem(item.id, "categoryId", event.target.value)
                  }
                  required
                  className="w-full rounded-lg border-2 border-color-6 px-4 py-3 outline-none"
                >
                  <option value="">Select category</option>
                  {categories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-y-1">
                <label htmlFor={`description-${item.id}`}>
                  Description
                </label>
                <textarea
                  id={`description-${item.id}`}
                  value={item.description}
                  onChange={(event) =>
                    updateItem(item.id, "description", event.target.value)
                  }
                  placeholder="Describe the issue..."
                  rows={4}
                  className="w-full min-h-13 rounded-lg border-2 border-color-6 px-4 py-3 outline-none focus:border-color-1"
                />
              </div>

              <div className="flex flex-col gap-y-4">
                <div className="flex flex-col gap-y-1">
                  <label htmlFor={`images-${item.id}`}>
                    Upload Images (optional)
                  </label>
                  <label
                    htmlFor={`images-${item.id}`}
                    onDragOver={(event) => {
                      event.preventDefault();
                    }}
                    onDrop={(event) => {
                      event.preventDefault();
                      addImages(item.id, event.dataTransfer.files);
                    }}
                    className="border-2 border-dashed hover:border-color-1 transition duration-300 h-30 rounded-lg flex flex-col justify-center items-center text-center"
                  >
                    <div>
                      <span className="">＋</span>
                      <span className="">
                        Drag and drop images here
                      </span>
                    </div>
                    <span className="text-color-7 text-sm">
                      or click to browse files
                    </span>
                    <input
                      id={`images-${item.id}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(event) => {
                        updateImages(item.id, event.target.files);
                        // Allow selecting the same file again later.
                        event.target.value = "";
                      }}
                      className="hidden"
                    />
                  </label>
                </div>
                {item.images.length > 0 && (
                  <div className="flex flex-col gap-y-4">
                    {item.images.map((image, imageIndex) => (
                      <div
                        key={`${image.name}-${imageIndex}`}
                        className="relative"
                      >
                        <div className="flex items-center gap-x-4">
                          <img
                            src={URL.createObjectURL(image)}
                            alt={image.name}
                            className="w-25 h-auto object-cover rounded-lg"
                          />
                          <p className="text-sm" title={image.name}>
                            {image.name}
                          </p>
                        </div>
                        <img
                          src={"/remove-icon.svg"}
                          alt="remove"
                          onClick={() => removeImage(item.id, imageIndex)}
                          className="w-4 absolute top-0 right-0"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          ))}
        </section>

        <div className="flex flex-col bg-white rounded-lg p-8">
          <div className="fixed top-0 justify-center">

            {submitError && (
            <div className="z-90 bg-white shadow-md p-4 rounded-2xl">
              <p className="text-red-600">{submitError}</p>
            </div>
            )}
            {submitSuccess && (
              <div className="z-90 bg-white shadow-md p-4 rounded-2xl">
                <p className="text-green-700">{submitSuccess}</p>
              </div>
            )}

          </div>
          <div className="flex flex-col md:flex-row gap-y-4 justify-between">
            <button
              type="button"
              onClick={addItem}
              className="py-2 px-4 bg-color-10 text-white rounded-lg hover:bg-color-10/80 transition duration-300"
            >
              + Add New Issue
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className={` px-4 py-3 rounded-lg text-white font-medium
                ${isSubmitting
                  ? "bg-color-6 cursor-not-allowed"
                  : "bg-color-1 hover:bg-color-1/80 transition duration-300"
                }
              `}
            >
              {isSubmitting ? "Submitting..." : "Submit Ticket"}
            </button>
          </div>
        </div>
      </form>
    </main>
  );
}
