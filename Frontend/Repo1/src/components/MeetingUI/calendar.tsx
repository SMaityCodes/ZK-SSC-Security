import * as React from "react";
import { Calendar as ShadcnCalendar } from "@/components/ui/calendar";

export interface CalendarProps {
  mode: "single";
  selected?: Date;
  onSelect: (date: Date | undefined) => void;
}

export const CustomCalendar: React.FC<CalendarProps> = ({ mode, selected, onSelect }) => {
  return (
    <div className="relative w-full">
      <ShadcnCalendar
        mode={mode}
        selected={selected}
        onSelect={onSelect}
        className="rounded-lg border border-blue-300 bg-white p-4 shadow-lg transition-all duration-200 ease-in-out hover:shadow-xl focus:outline-none focus:ring-2 focus:ring-blue-500"
      />

      {/* Adding custom styling for selected state and day hover */}
      <style>
        {`
          .shadcn-calendar-day-selected {
            background-color: #3b82f6; /* blue */
            color: white;
          }
          .shadcn-calendar-day:hover {
            background-color: #eff6ff; /* Light blue for hover effect */
          }
          .shadcn-calendar-day:focus {
            outline: none;
            box-shadow: 0 0 0 2px #3b82f6; /* blue focus ring */
          }
        `}
      </style>
    </div>
  );
};
