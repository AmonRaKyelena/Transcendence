-- CreateTable
CREATE TABLE "AuthToken" (
    "token" VARCHAR(100) NOT NULL,
    "userID" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "AuthToken_token_key" ON "AuthToken"("token");
