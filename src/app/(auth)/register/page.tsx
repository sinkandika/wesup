"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import RegisterStepOne from "@/src/components/auth/RegisterStepOne";
import RegisterStepTwo from "@/src/components/auth/RegisterStepTwo";

export default function RegisterPage() {
  const router = useRouter();

  const [step, setStep] = useState(1);

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
    phoneNumber: "",
    employeeId: "",
    role: "",
    departmentId: "",
    positionId: "",
    image: null as File | null,
  });

  // RESET FORM
  const handleResetForm = () => {
    setStep(1);

    setForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
      phoneNumber: "",
      employeeId: "",
      role: "",
      departmentId: "",
      positionId: "",
      image: null,
    });
  };

  // HANDLE CHANGE
  function handleChange(
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  // HANDLE IMAGE 
  function handleImageChange(file: File | null) {
    setForm((previous) => ({
      ...previous,
      image: file,
    }));
  }

  // HANDLE BUTTON
  function handleNext() {
    setStep(2);
  }

  // HANDLE BACK
  function handleBack() {
    setStep(1);
  }

  // HANDLE REGISTER
  async function handleRegister() {
    setError("");
    setLoading(true);

    try {
      const formData = new FormData();

      formData.append("firstName", form.firstName);
      formData.append("lastName", form.lastName);
      formData.append("email", form.email);
      formData.append("password", form.password);
      formData.append("phoneNumber", form.phoneNumber);
      formData.append("employeeId", form.employeeId);
      formData.append("role", form.role);
      formData.append("departmentId", form.departmentId);
      formData.append("positionId", form.positionId);

      if (form.image) {
        formData.append("image", form.image);
      }

      // fetch register
      const response = await fetch("/api/auth/register", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        setError(result.message || "Registration failed");
        return;
      }

      router.push("/register-success");
    } catch (error) {
      console.error("Register error:", error);
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-color-5 text-color-8">
      <div className="rounded-[35px] bg-white p-8 shadow-md flex flex-col gap-y-5">
        <div className="flex flex-col gap-y-2">
          <div className="flex justify-between items-center">
            <p className=" text-sm font-medium text-color-7">
              Step {step} of 2
            </p>
            <img
            src="/wesup-logo.svg"
            alt="logo"
            className="w-8"
            />
          </div>

          <p className="text-2xl font-bold">
            Create an account
          </p>
        </div>

        {error && (
          <p className="text-sm">
            {error}
          </p>
        )}

        {step === 1 && (
          <RegisterStepOne
            firstName={form.firstName}
            lastName={form.lastName}
            email={form.email}
            password={form.password}
            confirmPassword={form.confirmPassword}
            onChange={handleChange}
            onNext={handleNext}
            onResetForm={handleResetForm}
          />
        )}

        {step === 2 && (
          <RegisterStepTwo
            phoneNumber={form.phoneNumber}
            employeeId={form.employeeId}
            role={form.role}
            departmentId={form.departmentId}
            positionId={form.positionId}
            image={form.image}
            onChange={handleChange}
            onImageChange={handleImageChange}
            onBack={handleBack}
            onSubmit={handleRegister}
            isDisabled={loading}
          />
        )}
      </div>
    </main>
  );
}