import { useState } from "react"
import { DateRangePicker } from "@mantine/dates"

interface DatePickerWithRangeProps {
  onChange: (range: { from: Date | undefined; to: Date | undefined }) => void
}

export function DatePickerWithRange({ onChange }: DatePickerWithRangeProps) {
  const [selectedDate, setSelectedDate] = useState<{ from: Date | null; to: Date | null }>({ from: null, to: null })

  return (
    <DateRangePicker
      value={selectedDate}
      onChange={(date) => {
        setSelectedDate(date)
        onChange(date)
      }}
      placeholder="Select date range"
    />
  )
}

