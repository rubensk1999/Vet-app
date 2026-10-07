-- CreateTable
CREATE TABLE "vet"."test" (
    "name" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "test_name_key" ON "vet"."test"("name");
