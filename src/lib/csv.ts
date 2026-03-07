function escapeCell(value: string | number | null | undefined): string {
  const str = value == null ? "" : String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

export interface CsvBookingRow {
  slotDate: string;
  slotStart: string;
  slotEnd: string;
  capacity: number;
  bookedCount: number;
  attendeeName: string;
  attendeeEmail: string;
  bookedAt: string;
  status: string;
}

export function buildCsv(rows: CsvBookingRow[]): string {
  const headers = [
    "Slot Date",
    "Slot Start",
    "Slot End",
    "Capacity",
    "Booked Count",
    "Attendee Name",
    "Attendee Email",
    "Booked At",
    "Status",
  ];

  const lines = [
    headers.map(escapeCell).join(","),
    ...rows.map((r) =>
      [
        r.slotDate,
        r.slotStart,
        r.slotEnd,
        r.capacity,
        r.bookedCount,
        r.attendeeName,
        r.attendeeEmail,
        r.bookedAt,
        r.status,
      ]
        .map(escapeCell)
        .join(",")
    ),
  ];

  return lines.join("\r\n");
}
