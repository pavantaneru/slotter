-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL DEFAULT '',
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- CreateTable
CREATE TABLE "BookingPage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL DEFAULT '',
    "organizerId" TEXT NOT NULL,
    "requireAuth" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "BookingPage_organizerId_fkey" FOREIGN KEY ("organizerId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "TimeSlot" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "pageId" TEXT NOT NULL,
    "startTime" DATETIME NOT NULL,
    "endTime" DATETIME NOT NULL,
    "capacity" INTEGER NOT NULL DEFAULT 1,
    "isCancelled" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TimeSlot_pageId_fkey" FOREIGN KEY ("pageId") REFERENCES "BookingPage" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Booking" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slotId" TEXT NOT NULL,
    "attendeeName" TEXT NOT NULL,
    "attendeeEmail" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "cancelledAt" DATETIME,
    CONSTRAINT "Booking_slotId_fkey" FOREIGN KEY ("slotId") REFERENCES "TimeSlot" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "OtpCode" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "expiresAt" DATETIME NOT NULL,
    "used" BOOLEAN NOT NULL DEFAULT false,
    "type" TEXT NOT NULL,
    "pageId" TEXT
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "BookingPage_slug_key" ON "BookingPage"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "Booking_slotId_attendeeEmail_key" ON "Booking"("slotId", "attendeeEmail");

-- CreateIndex
CREATE INDEX "OtpCode_email_type_idx" ON "OtpCode"("email", "type");
