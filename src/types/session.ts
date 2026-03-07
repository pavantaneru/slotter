export interface SessionData {
  organizerId?: string;
  organizerEmail?: string;
  organizerName?: string;
  // Attendee OTP verification — scoped to a specific page
  verifiedAttendeeEmail?: string;
  verifiedForPageId?: string;
}
