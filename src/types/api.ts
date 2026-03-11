import { z } from "zod";

export const EventTypeSchema = z.enum(["none", "gmeet", "teams", "in_person"]);

export const GuestQuestionSchema = z.object({
  id: z.string().min(1, "Question ID is required"),
  prompt: z
    .string()
    .trim()
    .min(1, "Question prompt is required")
    .max(200, "Question prompt must be 200 characters or fewer"),
  required: z.boolean().default(false),
});

export const GuestResponseInputSchema = z.object({
  questionId: z.string().min(1, "Question ID is required"),
  answer: z
    .string()
    .trim()
    .max(500, "Answer must be 500 characters or fewer"),
});

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

const PageFieldsSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters").max(100),
  description: z.string().max(500).optional().default(""),
  slug: z
    .string()
    .min(3, "Slug must be at least 3 characters")
    .max(60)
    .regex(/^[a-z0-9-]+$/, "Slug can only contain lowercase letters, numbers, and hyphens"),
  requireAuth: z.boolean().default(false),
  allowedEmails: z.array(z.string().email("Invalid email in allowed list")).default([]),
  guestQuestions: z.array(GuestQuestionSchema).max(10, "Cannot add more than 10 questions").default([]),
  eventType: EventTypeSchema.default("none"),
  meetingLink: z.union([z.string().trim().url("Invalid meeting link"), z.literal("")]).optional().default(""),
  mapsLink: z.union([z.string().trim().url("Invalid Google Maps link"), z.literal("")]).optional().default(""),
  isActive: z.boolean().default(true),
});

function refinePageSchema<T extends z.AnyZodObject>(schema: T) {
  return schema.superRefine((data, ctx) => {
  const hasMeetingType = data.eventType === "gmeet" || data.eventType === "teams";
  if (hasMeetingType && !data.meetingLink) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["meetingLink"],
      message: "Meeting link is required for online events",
    });
  }
  if (data.eventType === "in_person" && !data.mapsLink) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["mapsLink"],
      message: "Google Maps link is required for in-person events",
    });
  }
  });
}

export const CreatePageSchema = refinePageSchema(PageFieldsSchema);

export const UpdatePageSchema = refinePageSchema(PageFieldsSchema.partial());

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
  guestResponses: z.array(GuestResponseInputSchema).max(10).default([]),
});

export type SendOtpInput = z.infer<typeof SendOtpSchema>;
export type VerifyOtpInput = z.infer<typeof VerifyOtpSchema>;
export type CreatePageInput = z.infer<typeof CreatePageSchema>;
export type UpdatePageInput = z.infer<typeof UpdatePageSchema>;
export type CreateSlotsInput = z.infer<typeof CreateSlotsSchema>;
export type CreateBookingInput = z.infer<typeof CreateBookingSchema>;
