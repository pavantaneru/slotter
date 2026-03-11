-- AlterTable
ALTER TABLE "BookingPage" ADD COLUMN "guestQuestions" TEXT NOT NULL DEFAULT '[]';
ALTER TABLE "BookingPage" ADD COLUMN "eventType" TEXT NOT NULL DEFAULT 'none';
ALTER TABLE "BookingPage" ADD COLUMN "meetingLink" TEXT;
ALTER TABLE "BookingPage" ADD COLUMN "mapsLink" TEXT;

-- AlterTable
ALTER TABLE "Booking" ADD COLUMN "guestResponses" TEXT NOT NULL DEFAULT '[]';
