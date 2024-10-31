/*
  Warnings:

  - A unique constraint covering the columns `[nome]` on the table `Banda` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "Banda_nome_key" ON "Banda"("nome");
