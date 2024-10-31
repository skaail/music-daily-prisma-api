-- CreateTable
CREATE TABLE "Album" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "capa" TEXT NOT NULL,
    "nota" INTEGER NOT NULL,
    "bandaId" INTEGER NOT NULL,

    CONSTRAINT "Album_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Banda" (
    "id" SERIAL NOT NULL,
    "nome" TEXT NOT NULL,

    CONSTRAINT "Banda_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Song" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "link" TEXT NOT NULL,
    "albumId" INTEGER NOT NULL,

    CONSTRAINT "Song_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "Album" ADD CONSTRAINT "Album_bandaId_fkey" FOREIGN KEY ("bandaId") REFERENCES "Banda"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Song" ADD CONSTRAINT "Song_albumId_fkey" FOREIGN KEY ("albumId") REFERENCES "Album"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
