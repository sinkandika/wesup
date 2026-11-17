"use client";

import { useEffect, useRef, useState } from "react";

type CalendarProps = {
  selectedDate: string;
  onSelectDate: (date: string) => void;
  onClose: () => void;
};

const weekdays = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

export default function Calendar({
  selectedDate,
  onSelectDate,
  onClose,
}: CalendarProps) {
  const [currentMonth, setCurrentMonth] = useState(() => {
    if (selectedDate) {
      const [year, month] = selectedDate.split("-").map(Number);
      return new Date(year, month - 1, 1);
    }

    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), 1);
  });

  const calendarRef = useRef<HTMLDivElement>(null);

  const year = currentMonth.getFullYear();
  const month = currentMonth.getMonth();

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  const days = [
    ...Array(firstDay).fill(null),
    ...Array.from({ length: daysInMonth }, (_, index) => index + 1),
  ];

  function formatDate(day: number) {
    const date = new Date(year, month, day);

    const dateYear = date.getFullYear();
    const dateMonth = String(date.getMonth() + 1).padStart(2, "0");
    const dateDay = String(date.getDate()).padStart(2, "0");

    return `${dateYear}-${dateMonth}-${dateDay}`;
  }

  function changeMonth(amount: number) {
    setCurrentMonth(new Date(year, month + amount, 1));
  }

  
  // HANDLE CLICK OUTSIDE
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      // Check if the click was outside the container element
      if (calendarRef.current && !calendarRef.current.contains(event.target as Node)) {
        onClose();
      }
    }

    // Bind the event listener
    document.addEventListener("mousedown", handleClickOutside);
    
    // Clean up the event listener on unmount
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div 
    ref ={calendarRef}
    className="w-72 rounded-xl border border-gray-200 bg-white p-4 shadow-lg"
    >
      {/* Month navigation */}
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          onClick={() => changeMonth(-1)}
          className="rounded-lg px-3 py-1 hover:bg-gray-100"
          aria-label="Previous month"
        >
          ‹
        </button>

        <h3 className="font-semibold">
          {currentMonth.toLocaleDateString("en-US", {
            month: "long",
            year: "numeric",
          })}
        </h3>

        <button
          type="button"
          onClick={() => changeMonth(1)}
          className="rounded-lg px-3 py-1 hover:bg-gray-100"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      {/* Weekday headings */}
      <div className="grid grid-cols-7 text-center text-sm text-gray-500">
        {weekdays.map((day) => (
          <div key={day} className="py-2">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar dates */}
      <div className="grid grid-cols-7 gap-y-1 text-center">
        {days.map((day, index) => {
          if (day === null) {
            return <div key={`empty-${index}`} />;
          }

          const dateString = formatDate(day);
          const isSelected = selectedDate === dateString;

          return (
            <button
              key={dateString}
              type="button"
              onClick={() => {
                onSelectDate(dateString);
                onClose();
              }}
              className={`mx-auto flex h-8 w-8 items-center justify-center rounded-full text-sm transition
                ${
                  isSelected
                    ? "bg-blue-600 text-white"
                    : "hover:bg-gray-100"
                }`}
            >
              {day}
            </button>
          );
        })}
      </div>

      {/* Footer */}
      <div className="mt-4 flex justify-between border-t border-gray-100 pt-3">
        <button
          type="button"
          onClick={() => {
            onSelectDate("");
            onClose();
          }}
          className="text-sm text-gray-500 hover:text-gray-800"
        >
          Clear
        </button>

        <button
          type="button"
          onClick={() => {
            const today = new Date();
            onSelectDate(formatDate(today.getDate()));
            setCurrentMonth(
              new Date(today.getFullYear(), today.getMonth(), 1)
            );
            onClose();
          }}
          className="text-sm font-medium text-blue-600 hover:text-blue-800"
        >
          Today
        </button>
      </div>
    </div>
  );
}
