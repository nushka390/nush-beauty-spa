import * as bookingService from '../src/bookings/bookings.service';
import db from '../src/Drizzle/db';
import { BookingsTable } from '../src/Drizzle/schema';
import { eq } from 'drizzle-orm';

// Mock the entire drizzle/db module
jest.mock('../src/Drizzle/db', () => ({
  __esModule: true,
  default: {
    insert: jest.fn(),
    select: jest.fn(),
    update: jest.fn(),
    delete: jest.fn()
  }
}));

// Mock drizzle-orm
jest.mock('drizzle-orm', () => ({
  eq: jest.fn(),
  relations: jest.fn((_table, builder) => {
    if (typeof builder !== 'function') return {};
    return builder({
      many: jest.fn(),
      one: jest.fn()
    });
  })
}));

describe('Booking Service Tests', () => {
  // Sample mock data
  const mockBooking = {
    bookingID: 1,
    customerID: 2,
    carID: 3,
    date: new Date('2024-01-15T10:00:00Z'),
    status: 'confirmed',
    notes: 'Test booking'
  };

  const mockBookingsArray = [
    { bookingID: 1, customerID: 2, carID: 3, date: new Date() },
    { bookingID: 2, customerID: 3, carID: 4, date: new Date() }
  ];

  // Reset mocks before each test
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBookingService', () => {
    it('should create a new booking successfully', async () => {
      // Setup mock chain
      const mockReturning = jest.fn().mockResolvedValue([mockBooking]);
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockInsert = jest.fn().mockReturnValue({ values: mockValues });
      
      (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

      const result = await bookingService.createBookingService(mockBooking);

      // Verify the call chain
      expect(db.insert).toHaveBeenCalledWith(BookingsTable);
      expect(mockValues).toHaveBeenCalledWith(mockBooking);
      expect(mockReturning).toHaveBeenCalled();
      expect(result).toEqual(mockBooking);
    });

    it('should throw an error when creation fails', async () => {
      const errorMessage = 'Database connection failed';
      const mockReturning = jest.fn().mockRejectedValue(new Error(errorMessage));
      const mockValues = jest.fn().mockReturnValue({ returning: mockReturning });
      
      (db.insert as jest.Mock).mockReturnValue({ values: mockValues });

      await expect(bookingService.createBookingService(mockBooking))
        .rejects
        .toThrow(`Failed to create booking: Error: ${errorMessage}`);
    });
  });

  describe('getAllBookingsService', () => {
    it('should return all bookings', async () => {
      // Setup mock chain for select
      const mockFrom = jest.fn().mockResolvedValue(mockBookingsArray);
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
      
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await bookingService.getAllBookingsService();

      expect(db.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(BookingsTable);
      expect(result).toEqual(mockBookingsArray);
      expect(result).toHaveLength(2);
    });

    it('should throw an error when fetching all bookings fails', async () => {
      const errorMessage = 'Connection timeout';
      const mockFrom = jest.fn().mockRejectedValue(new Error(errorMessage));
      
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      await expect(bookingService.getAllBookingsService())
        .rejects
        .toThrow(`Failed to fetch bookings: Error: ${errorMessage}`);
    });
  });

  describe('getBookingByIdService', () => {
    it('should return a booking by ID', async () => {
      const bookingId = 1;
      
      // Setup mock chain
      const mockWhere = jest.fn().mockResolvedValue([mockBooking]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      const mockSelect = jest.fn().mockReturnValue({ from: mockFrom });
      
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      const result = await bookingService.getBookingByIdService(bookingId);

      expect(db.select).toHaveBeenCalled();
      expect(mockFrom).toHaveBeenCalledWith(BookingsTable);
      expect(eq).toHaveBeenCalledWith(BookingsTable.bookingID, bookingId);
      expect(mockWhere).toHaveBeenCalledWith('mockCondition');
      expect(result).toEqual(mockBooking);
    });

    it('should return undefined when booking not found', async () => {
      const bookingId = 999;
      const mockWhere = jest.fn().mockResolvedValue([]);
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      const result = await bookingService.getBookingByIdService(bookingId);

      expect(result).toBeUndefined();
    });

    it('should throw an error when fetching by ID fails', async () => {
      const bookingId = 1;
      const errorMessage = 'Invalid ID';
      const mockWhere = jest.fn().mockRejectedValue(new Error(errorMessage));
      const mockFrom = jest.fn().mockReturnValue({ where: mockWhere });
      
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      await expect(bookingService.getBookingByIdService(bookingId))
        .rejects
        .toThrow(`Failed to fetch booking by ID: Error: ${errorMessage}`);
    });
  });

  describe('updateBookingService', () => {
    it('should update a booking successfully', async () => {
      const bookingId = 1;
      const updateData = { status: 'completed', notes: 'Updated notes' };
      
      // Setup complex mock chain for update
      const mockReturning = jest.fn().mockResolvedValue([{ ...mockBooking, ...updateData }]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      const mockUpdate = jest.fn().mockReturnValue({ set: mockSet });
      
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      const result = await bookingService.updateBookingService(bookingId, updateData);

      expect(db.update).toHaveBeenCalledWith(BookingsTable);
      expect(mockSet).toHaveBeenCalledWith(updateData);
      expect(eq).toHaveBeenCalledWith(BookingsTable.bookingID, bookingId);
      expect(mockWhere).toHaveBeenCalledWith('mockCondition');
      expect(result).toEqual({ ...mockBooking, ...updateData });
    });

    it('should throw an error when update fails', async () => {
      const bookingId = 1;
      const updateData = { status: 'completed' };
      const errorMessage = 'Update constraint violation';
      
      const mockReturning = jest.fn().mockRejectedValue(new Error(errorMessage));
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      await expect(bookingService.updateBookingService(bookingId, updateData))
        .rejects
        .toThrow(`Failed to update booking: Error: ${errorMessage}`);
    });
  });

  describe('deleteBookingService', () => {
    it('should delete a booking successfully', async () => {
      const bookingId = 1;
      
      // Setup mock chain for delete
      const mockReturning = jest.fn().mockResolvedValue([mockBooking]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockDelete = jest.fn().mockReturnValue({ where: mockWhere });
      
      (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      const result = await bookingService.deleteBookingService(bookingId);

      expect(db.delete).toHaveBeenCalledWith(BookingsTable);
      expect(eq).toHaveBeenCalledWith(BookingsTable.bookingID, bookingId);
      expect(mockWhere).toHaveBeenCalledWith('mockCondition');
      expect(result).toEqual(mockBooking);
    });

    it('should throw an error when deletion fails', async () => {
      const bookingId = 1;
      const errorMessage = 'Foreign key constraint';
      
      const mockReturning = jest.fn().mockRejectedValue(new Error(errorMessage));
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      
      (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      await expect(bookingService.deleteBookingService(bookingId))
        .rejects
        .toThrow(`Failed to delete booking: Error: ${errorMessage}`);
    });

    it('should handle when booking to delete is not found', async () => {
      const bookingId = 999;
      const mockReturning = jest.fn().mockResolvedValue([]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      
      (db.delete as jest.Mock).mockReturnValue({ where: mockWhere });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      const result = await bookingService.deleteBookingService(bookingId);

      expect(result).toBeUndefined();
    });
  });

  // Edge case tests
  describe('Edge Cases', () => {
    it('should handle empty array from database gracefully', async () => {
      // For getAllBookingsService
      const mockFrom = jest.fn().mockResolvedValue([]);
      (db.select as jest.Mock).mockReturnValue({ from: mockFrom });

      const result = await bookingService.getAllBookingsService();
      expect(result).toEqual([]);
      expect(result).toHaveLength(0);
    });

    it('should handle partial update data correctly', async () => {
      const bookingId = 1;
      const partialUpdate = { notes: 'Only updating notes' };
      
      const mockReturning = jest.fn().mockResolvedValue([{ ...mockBooking, notes: 'Only updating notes' }]);
      const mockWhere = jest.fn().mockReturnValue({ returning: mockReturning });
      const mockSet = jest.fn().mockReturnValue({ where: mockWhere });
      
      (db.update as jest.Mock).mockReturnValue({ set: mockSet });
      (eq as jest.Mock).mockReturnValue('mockCondition');

      const result = await bookingService.updateBookingService(bookingId, partialUpdate);
      expect(result).toHaveProperty('notes', 'Only updating notes');
    });
  });
});
