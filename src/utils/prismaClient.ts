import { PrismaClient } from "@prisma/client";

class Database {
  public prisma: PrismaClient

  constructor() {
    this.prisma = new PrismaClient();
  }
}

export default new Database().prisma;