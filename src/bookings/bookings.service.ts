
import db from "../Drizzle/db"; 
import { eq } from "drizzle-orm";
import { BookingsTable } from "../Drizzle/schema";


export const createBookingService = async (
  bookingData: typeof BookingsTable.$inferInsert
) => {
  try {
    const result = await db
      .insert(BookingsTable)
      .values(bookingData)
      .returning();
    return result[0]; 
  } catch (error) {
    throw new Error(`Failed to create booking: ${error}`);
  }
};


export const getAllBookingsService = async () => {
  try {
    return await db.select().from(BookingsTable);
  } catch (error) {
    throw new Error(`Failed to fetch bookings: ${error}`);
  }
};


export const getBookingByIdService = async (id: number) => {
  try {
    const result = await db
      .select()
      .from(BookingsTable)
      .where(eq(BookingsTable.bookingID, id));
    return result[0]; 
  } catch (error) {
    throw new Error(`Failed to fetch booking by ID: ${error}`);
  }
};


export const updateBookingService = async (
  id: number,
  updatedData: Partial<typeof BookingsTable.$inferInsert>
) => {
  try {
    const result = await db
      .update(BookingsTable)
      .set(updatedData)
      .where(eq(BookingsTable.bookingID, id))
      .returning();
    return result[0]; // return updated booking
  } catch (error) {
    throw new Error(`Failed to update booking: ${error}`);
  }
}
export const deleteBookingService = async (id: number) => {
  try {
    const result = await db
      .delete(BookingsTable)
      .where(eq(BookingsTable.bookingID, id))
      .returning();
    return result[0]; // return deleted booking (if needed)
  } catch (error) {
    throw new Error(`Failed to delete booking: ${error}`);
  }
};
