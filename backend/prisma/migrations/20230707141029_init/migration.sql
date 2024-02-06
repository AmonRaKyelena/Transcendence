-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3),
    "username" VARCHAR(50) NOT NULL,
    "password" VARCHAR(50),
    "first_name" VARCHAR(50),
    "last_name" VARCHAR(50),
	"fortytwo_id" VARCHAR(10),

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_username_key" ON "User"("username");
