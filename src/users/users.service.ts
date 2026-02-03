import { eq, sql } from "drizzle-orm";
import db from "../Drizzle/db"; 
import { UsersTable } from "../Drizzle/schema";
import type { InferInsertModel, InferSelectModel } from "drizzle-orm";

type TUserInsert = InferInsertModel<typeof UsersTable>;
type TSUser = InferSelectModel<typeof UsersTable>;

export const createusersService = async (user: TUserInsert) => {
  await db.insert(UsersTable).values(user);
  return "user created";
};

export const getusersService = async () => {
  try {
    const users = await db.select({
      userID: UsersTable.userID,
      firstName: UsersTable.firstName,
      lastName: UsersTable.lastName,
      phoneNumber: UsersTable.phoneNumber,
      address: UsersTable.address,
      role: UsersTable.role
    }).from(UsersTable);
    
    return users;
  } catch (error) {
    console.error("Error in getusersService:", error);
    throw error;
  }
};

export const getusersByIdService = async (id: number) => {
  try {
    const [user] = await db.select().from(UsersTable).where(eq(UsersTable.userID, id));
    return user;
  } catch (error) {
    console.error(`Error in getusersByIdService for id ${id}:`, error);
    throw error;
  }
};

export const updateusersService = async (id: number, updatedUser: Partial<TSUser>) => {
  await db.update(UsersTable).set(updatedUser).where(eq(UsersTable.userID, id)).returning();
  return "users updated successfully";
};

export const deleteusersService = async (id: number) => {
  const [deleted] = await db.delete(UsersTable).where(eq(UsersTable.userID, id)).returning();
  return deleted;
};