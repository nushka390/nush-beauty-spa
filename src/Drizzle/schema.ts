import { relations } from "drizzle-orm";
import { text, varchar, serial, pgTable, decimal, integer, boolean, date } from "drizzle-orm/pg-core";





export const UsersTable = pgTable("users", {
  userID: serial("UserID").primaryKey(),
  firstName: varchar("FirstName", { length: 50 }).notNull(),
  lastName: varchar("LastName", { length: 50 }).notNull(),
  email: varchar("Email", { length: 100 }).notNull().unique(),
  phoneNumber: varchar("PhoneNumber", { length: 20 }),
  address: varchar("Address", { length: 255 }),
  role: varchar("Role", { length: 20 }).default("customer"), // admin | staff | customer
  password: varchar("Password", { length: 255 }).notNull(), // 🔑 ADD THIS LINE
  isVerified: boolean("IsVerified").default(false).notNull(), // Optional
  verificationCode: varchar("VerificationCode", { length: 255 }) // Optional
});


// Designs Table (Makeup & Nail designs)
export const DesignsTable = pgTable("designs", {
    designID: serial("DesignID").primaryKey(),
    title: varchar("Title", { length: 100 }).notNull(),
    category: varchar("Category", { length: 50 }).notNull(), // e.g., Makeup | Nails
    imageUrl: text("ImageUrl").notNull(),
    description: text("Description")
});

// Bookings Table (Appointments)
export const BookingsTable = pgTable("bookings", {
    bookingID: serial("BookingID").primaryKey(),
    userID: integer("UserID").notNull().references(() => UsersTable.userID, { onDelete: "cascade" }),
    designID: integer("DesignID").references(() => DesignsTable.designID, { onDelete: "set null" }),
    bookingDate: date("BookingDate").notNull(),
    serviceDate: date("ServiceDate").notNull(),
    status: varchar("Status", { length: 20 }).default("Pending") // Pending | Confirmed | Completed | Cancelled
});
export const PaymentsTable = pgTable("payments", {
    paymentID: serial("PaymentID").primaryKey(),
    bookingID: integer("BookingID").notNull().references(() => BookingsTable.bookingID, { onDelete: "cascade" }),
    paymentDate: date("PaymentDate").notNull(),
    amount: decimal("Amount", { precision: 10, scale: 2 }).notNull(),
    paymentMethod: varchar("PaymentMethod", { length: 50 }) // Mpesa | Card | Cash
});


export const SupportTicketsTable = pgTable("support_tickets", {
    ticketID: serial("TicketID").primaryKey(),
    userID: integer("UserID").notNull().references(() => UsersTable.userID, { onDelete: "cascade" }),
    subject: varchar("Subject", { length: 100 }).notNull(),
    description: text("Description").notNull(),
    status: varchar("Status", { length: 20 }).default("Open"), // Open | In Progress | Resolved | Closed
    createdDate: date("CreatedDate").notNull()
});

export const UsersRelations = relations(UsersTable, ({ many }) => ({
    bookings: many(BookingsTable),
    tickets: many(SupportTicketsTable)
}));

// Designs Relationships - 1 design can appear in many bookings
export const DesignsRelations = relations(DesignsTable, ({ many }) => ({
    bookings: many(BookingsTable)
}));

// Bookings Relationships - 1 booking belongs to 1 user and 1 design, and can have many payments
export const BookingsRelations = relations(BookingsTable, ({ one, many }) => ({
    user: one(UsersTable, {
        fields: [BookingsTable.userID],
        references: [UsersTable.userID]
    }),
    design: one(DesignsTable, {
        fields: [BookingsTable.designID],
        references: [DesignsTable.designID]
    }),
    payments: many(PaymentsTable)
}));

// Payments Relationships - 1 payment belongs to 1 booking
export const PaymentsRelations = relations(PaymentsTable, ({ one }) => ({
    booking: one(BookingsTable, {
        fields: [PaymentsTable.bookingID],
        references: [BookingsTable.bookingID]
    })
}));

// Support Tickets Relationships - 1 support ticket belongs to 1 user
export const SupportTicketsRelations = relations(SupportTicketsTable, ({ one }) => ({
    user: one(UsersTable, {
        fields: [SupportTicketsTable.userID],
        references: [UsersTable.userID]
    })
}));
