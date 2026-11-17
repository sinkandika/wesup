
"use client";

import { useEffect, useRef, useState } from "react";

export type UserDetail = {
  id: string;
  first_name: string;
  last_name: string | null;
  email: string;
  phone_number: string | null;
  role: string;
  status: string;
  employee_id: string | null;
  image_url: string | null;
  departments: {
    name: string;
  } | null;
  positions: {
    name: string;
  } | null;
};

type UserDetailProps = {
  user: UserDetail | null;
};

type AccountForm = {
  firstName: string;
  lastName: string;
  phoneNumber: string;
};

export default function AccountSettings({ user }: UserDetailProps) {
  const [account, setAccount] = useState<UserDetail | null>(user);
  const [isEdit, setIsEdit] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState("");
  const [image, setImage] = useState<File | null>(null);

  const [form, setForm] = useState<AccountForm>({
    firstName: "",
    lastName: "",
    phoneNumber: "",
  });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Sync account data
  useEffect(() => {
    if (user) {
      setAccount(user);
    }
  }, [user]);

  // HANDLE EDIT
  const handleEdit = () => {
    if (!account) return;

    setForm({
      firstName: account.first_name,
      lastName: account.last_name || "",
      phoneNumber: account.phone_number || "",
    });

    setImage(null);
    setError("");
    setIsEdit(true);
  };

  // HANDLE CANCEL
  const handleCancel = () => {
    setIsEdit(false);
    setImage(null);
    setError("");
  };

  // HANDLE SAVE
  const handleSave = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      setIsSaving(true);
      setError("");

      const formData = new FormData();

      formData.append("firstName", form.firstName.trim());
      formData.append("lastName", form.lastName.trim());
      formData.append("phoneNumber", form.phoneNumber.trim());

      if (image) {
        formData.append("image", image);
      }

      const response = await fetch("/api/settings/account", {
        method: "PATCH",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(result.message || "Failed to update account");
      }

      setAccount(result.data);
      setIsEdit(false);
      setImage(null);

      console.log("Account updated successfully");

    } catch (error) {
      console.error("UPDATE ACCOUNT ERROR:", error);

      setError(
        error instanceof Error
          ? error.message
          : "Failed to update account"
      );
    } finally {
      setIsSaving(false);
    }
  };

  if (!account) {
    return <p>Loading...</p>;
  }

  return (
    <div className="max-w-300">
      <form 
      onSubmit={handleSave}
      className="flex flex-col gap-2 text-color-8"
      >

      <div className="bg-white rounded-lg p-8 justify-center flex flex-col items-center gap-2">
        <img
          src={imagePreview || account.image_url || "/user-blank.svg"}
          alt="user-image"
          className="w-20 h-20 object-cover rounded-full"
        />

        {isEdit ? (
          <>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={(e) => {
                const selectedImage = e.target.files?.[0];

                if (selectedImage) {
                  setImage(selectedImage);
                  setImagePreview(URL.createObjectURL(selectedImage));
                }
              }}
              className="hidden"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm text-color-1 hover:text-color-1/80 font-medium transition duration-300"
            >
              Change Image
            </button>
          </>
        ) : (
          <p>
            {account.first_name} {account.last_name}
          </p>
        )}
      </div>

        <div className="bg-white p-8 rounded-lg flex flex-col gap-y-4">
          <div className="flex justify-between">
            <p className="font-bold">Personal Info</p>
            <div>
              {isEdit ? (
                <div className="flex flex-row gap-2 text-sm">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={isSaving}
                    className="bg-color-9 hover:bg-color-9/80 py-2 px-4 rounded-lg text-white transition duration-300"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSaving}
                    className={`py-2 px-4 rounded-lg text-white transition duration-300
                      ${isSaving
                        ? "bg-color-6"
                        : "bg-color-1 hover:bg-color-1/80"
                      }
                    `}
                  >
                    {isSaving ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={handleEdit}
                >
                  <img
                  src={"/edit-info.svg"} 
                  alt="edit"
                  className="w-5"
                  />
                </button>
              )}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4">
            <div>
              <p className="text-color-6 text-xs">First Name</p>
              {isEdit ? (
                <input
                  type="text"
                  value={form.firstName}
                  onChange={(e) =>
                    setForm({ ...form, firstName: e.target.value })
                  }
                  required
                  className="border p-2 border-color-6 outline-none focus:border-color-1 rounded-lg"
                />
              ) : (
                <p>{account.first_name}</p>
              )}
            </div>
            <div>
              <p className="text-color-6 text-xs">Last Name</p>
              {isEdit ? (
                <input
                  type="text"
                  value={form.lastName}
                  onChange={(e) =>
                    setForm({ ...form, lastName: e.target.value })
                  }
                  className="border p-2 border-color-6 outline-none focus:border-color-1 rounded-lg"
                />
              ) : (
                <p>{account.last_name || "-"}</p>
              )}
            </div>
            <div>
              <p className="text-color-6 text-xs">Email</p>
              <p>{account.email}</p>
            </div>
            <div>
              <p className="text-color-6 text-xs">Phone Number</p>
              {isEdit ? (
                <input
                  type="tel"
                  value={form.phoneNumber}
                  onChange={(e) =>
                    setForm({ ...form, phoneNumber: e.target.value })
                  }
                  className="border p-2 border-color-6 outline-none focus:border-color-1 rounded-lg"
                />
              ) : (
                <p>{account.phone_number || "-"}</p>
              )}
            </div>
          </div>
        </div>

        <div className="bg-white p-8 rounded-lg flex flex-col gap-y-4">
          <p className="font-bold">Employee Info</p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-y-4">
            <div>
              <p className="text-color-6 text-xs">Role</p>
              <p className="capitalize">{account.role}</p>
            </div>
            <div>
              <p className="text-color-6 text-xs">Status</p>
              <p className="capitalize">{account.status}</p>
            </div>
            <div>
              <p className="text-color-6 text-xs">Employee ID</p>
              <p>{account.employee_id || "-"}</p>
            </div>
            <div>
              <p className="text-color-6 text-xs">Department</p>
              <p>{account.departments?.name || "-"}</p>
            </div>
            <div>
              <p className="text-color-6 text-xs">Position</p>
              <p>{account.positions?.name || "-"}</p>
            </div>
            {error && (
              <p className="text-red-500">{error}</p>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
