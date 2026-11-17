"use client";

import React, { useEffect, useState } from "react";
import ImageUpload from "../common/ImageUpload";
import { motion } from "framer-motion";

type Department = {
  id: string;
  name: string;
};

type Position = {
  id: string;
  name: string;
};

type RegisterStepTwoProps = {
  phoneNumber: string;
  employeeId: string;
  role: string;
  departmentId: string;
  positionId: string;
  image: File | null;
  onChange: (
    event:
      | React.ChangeEvent<HTMLInputElement>
      | React.ChangeEvent<HTMLSelectElement>
  ) => void;
  onImageChange: (file: File | null) => void;
  onBack: () => void;
  onSubmit: () => void;
  isDisabled?: boolean;
};

export default function RegisterStepTwo({
  phoneNumber,
  employeeId,
  role,
  departmentId,
  positionId,
  image,
  onChange,
  onImageChange,
  onBack,
  onSubmit,
  isDisabled,
}: RegisterStepTwoProps) {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [positions, setPositions] = useState<Position[]>([]);

  const [loadingDepartments, setLoadingDepartments] = useState(true);
  const [loadingPositions, setLoadingPositions] = useState(false);

  // fetch department
  useEffect(() => {
    async function fetchDepartments() {
      try {
        const response = await fetch("/api/departments");
        const result = await response.json();

        if (response.ok) {
          setDepartments(result.data);
        }
      } catch (error) {
        console.error("Get departments error:", error);
      } finally {
        setLoadingDepartments(false);
      }
    }

    fetchDepartments();
  }, []);

  // get position
  useEffect(() => {
    if (!departmentId) {
      setPositions([]);
      return;
    }

    async function fetchPositions() {
      setLoadingPositions(true);

      try {
        const response = await fetch(
          `/api/positions?departmentId=${departmentId}`
        );

        const result = await response.json();

        if (response.ok) {
          setPositions(result.data);
        }
      } catch (error) {
        console.error("Get positions error:", error);
      } finally {
        setLoadingPositions(false);
      }
    }

    fetchPositions();
  }, [departmentId]);

  return (
    <motion.div
    initial={{ opacity: 0, x:20, y:0 }}
    animate={{ opacity: 1, x:0, y:0 }}
    transition={{ duration: 0.3 }}
    >
      <div className="flex flex-col gap-y-4">
        <div className="flex flex-col md:flex-row gap-x-5 gap-y-2 md:gap-y-0">
          <div className="flex flex-col gap-y-2">
            <div>
              <label
                htmlFor="phoneNumber"
                className="text-sm font-medium"
              >
                Phone number
              </label>
              <input
                id="phoneNumber"
                name="phoneNumber"
                type="number"
                value={phoneNumber}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              />
            </div>
            <div>
              <label
                htmlFor="employeeId"
                className="text-sm font-medium"
              >
                Employee ID
              </label>
              <input
                id="employeeId"
                name="employeeId"
                type="text"
                value={employeeId}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              />
            </div>
          </div>

          <div className="flex flex-col gap-y-2">
            <div>
              <label
                htmlFor="role"
                className="text-sm font-medium"
              >
                Role
              </label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={onChange}
                required
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              >
                <option value="user">User</option>
                <option value="technician">Technician</option>
                <option value="supervisor">Supervisor</option>
              </select>
            </div>
            <div>
              <label
                htmlFor="departmentId"
                className="text-sm font-medium"
              >
                Department
              </label>
              <select
                id="departmentId"
                name="departmentId"
                value={departmentId}
                onChange={onChange}
                required
                disabled={loadingDepartments}
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4"
              >
                <option value="">
                  {loadingDepartments
                    ? "Loading department..."
                    : "Select department"}
                </option>
                {departments.map((department) => (
                  <option key={department.id} value={department.id}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label
                htmlFor="positionId"
                className="text-sm font-medium"
              >
                Position
              </label>
              <select
                id="positionId"
                name="positionId"
                value={positionId}
                onChange={onChange}
                required
                disabled={!departmentId || loadingPositions}
                className="mt-1 w-full rounded-lg border border-color-6 px-4 py-3 outline-none focus:border-color-4 disabled:bg-color-5"
              >
                <option value="">
                  {loadingPositions
                    ? "Loading position..."
                    : !departmentId
                      ? "Select position"
                      : "Select position"}
                </option>
                {positions.map((position) => (
                  <option key={position.id} value={position.id}>
                    {position.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <ImageUpload
          image={image}
          onImageChange={onImageChange} 
        />

        <div className="flex justify-between">
          <button
            type="button"
            onClick={onBack}
            className="flex items-center gap-x-2 hover:text-color-2 text-sm transition duration-300"
          >
            <img
            src="/left-arrow.svg"
            alt="arrow"
            className="w-5"
            />
            Back to Step 1
          </button>

          <button
            type="button"
            onClick={onSubmit}
            disabled={isDisabled}
            className={`rounded-lg px-4 py-2 font-medium text-white transition
              ${isDisabled
                ? "bg-color-7 cursor-not-allowed"
                : "bg-color-1 hover:bg-color-1/80"
              }
            `}
          >
            {isDisabled ?"Creating..." :"Create Account"}
          </button>
        </div>
      </div>
    </motion.div>
    
  );
}
