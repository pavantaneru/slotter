import { z } from "zod";

export const SendOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  type: z.enum(["organizer", "attendee"]),
  pageId: z.string().cuid().optional(),
});

export const VerifyOtpSchema = z.object({
  email: z.string().email("Invalid email address"),
  code: z.string().length(6).regex(/^\d{6}$/, "Code must be 6 digits"),
  type: z.enum(["organizer", "attendee"]),
  pageId: z.string().cuid().optional(),
});

export const CreatePageSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500).optional().default(""),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  requireAuth: z.boolean().default(false),
  allowedEmails: z.array(z.string().email("Invalid email in allowed list")).default([]),
  isActive: z.boolean().default(true),
});

export const UpdatePageSchema = CreatePageSchema.partial();

export const CreateSlotSchema = z
  .object({
    startTime: z.coerce.date(),
    endTime: z.coerce.date(),
    capacity: z.number().int().min(1, "Capacity must be at least 1").max(1000),
  })
  .refine((d) => d.endTime > d.startTime, {
    message: "End time must be after start time",
    path: ["endTime"],
  });

export const CreateSlotsSchema = z
  .array(CreateSlotSchema)
  .min(1, "At least one slot is required")
  .max(50, "Cannot add more than 50 slots at once");

export const CreateBookingSchema = z.object({
  slotId: z.string().cuid("Invalid slot ID"),
  pageId: z.string().cuid("Invalid page ID"),
  attendeeName: z.string().min(1, "Name is required").max(100),
  attendeeEmail: z.string().email("Invalid email address"),
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type CreatePageInput = z.infer<typeof CreatePageSchema>;
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;
export type CreateSlotsInput = z.infer<typeof CreateSlotsSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
