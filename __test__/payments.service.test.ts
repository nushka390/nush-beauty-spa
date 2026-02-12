 1 +import * as paymentsService from "../src/payments/         payments.service";                                ation calls, but this should unblock the suite.
      import db from "../src/Drizzle/db";
      import { PaymentsTable } from "../src/Drizzle/sche         ma";
      import { eq } from "drizzle-orm";
                                                                                                      97% context left  
      jest.mock("../src/Drizzle/db", () => ({
        __esModule: true,
      default: {
          insert: jest.fn(),
         select: jest.fn(),
         update: jest.fn(),
        delete: jest.fn(),
        query: {
          PaymentsTable: {
            findFirst: jest.fn()
           }
     17 +    }
     18 +  }
     19 +}));
     20 +
     21 +jest.mock("drizzle-orm", () => ({
     22 +  eq: jest.fn(),
     23 +  relations: jest.fn((_table, builder) => {       
     24 +    if (typeof builder !== "function") return {}; 
     25 +    return builder({
     26 +      many: jest.fn(),
     27 +      one: jest.fn()
     28 +    });
     29 +  })
     30 +}));
     31 +
     32 +describe("Payments Service Tests", () => {        
     33 +  const mockPayment = {
     34 +    paymentID: 1,
     35 +    bookingID: 10,
     36 +    paymentDate: new Date("2024-01-15"),
     37 +    amount: "120.00",
     38 +    paymentMethod: "Card"
     39 +  };
     40 +
     41 +  const mockPaymentsArray = [
     42 +    { paymentID: 1, bookingID: 10, paymentDate: ne         w Date(), amount: "120.00" },
     43 +    { paymentID: 2, bookingID: 11, paymentDate: ne         w Date(), amount: "90.00" }
     44 +  ];
     45 +
     46 +  beforeEach(() => {
     47 +    jest.clearAllMocks();
     48 +  });
     49 +
     50 +  describe("createpaymentsService", () => {       
     51 +    it("should create a payment successfully", asy         nc () => {
     52 +      const mockReturning = jest.fn().mockResolved         Value([mockPayment]);
     53 +      const mockValues = jest.fn().mockReturnValue         ({ returning: mockReturning });
     54 +
     55 +      (db.insert as jest.Mock).mockReturnValue({ v         alues: mockValues });
     56 +
     57 +      const result = await paymentsService.createp         aymentsService(mockPayment);
     58 +
     59 +      expect(db.insert).toHaveBeenCalledWith(Payme         ntsTable);
     60 +      expect(mockValues).toHaveBeenCalledWith(mock         Payment);
     61 +      expect(mockReturning).toHaveBeenCalled();   
     62 +      expect(result).toEqual(mockPayment);        
     63 +    });
     64 +
     65 +    it("should throw when creation fails", async (         ) => {
     66 +      const errorMessage = "Insert failed";       
     67 +      const mockReturning = jest.fn().mockRejected         Value(new Error(errorMessage));
     68 +      const mockValues = jest.fn().mockReturnValue         ({ returning: mockReturning });
     69 +
     70 +      (db.insert as jest.Mock).mockReturnValue({ v         alues: mockValues });
     71 +
     72 +      await expect(paymentsService.createpaymentsS         ervice(mockPayment)).rejects.toThrow(
     73 +        `Error: ${errorMessage}`
     74 +      );
     75 +    });
     76 +  });
     77 +
     78 +  describe("getpaymentsService", () => {
     79 +    it("should return all payments", async () => {     80 +      const mockFrom = jest.fn().mockResolvedValue         (mockPaymentsArray);
     81 +
     82 +      (db.select as jest.Mock).mockReturnValue({ f         rom: mockFrom });
     83 +
     84 +      const result = await paymentsService.getpaym         entsService();
     85 +
     86 +      expect(db.select).toHaveBeenCalled();       
     87 +      expect(mockFrom).toHaveBeenCalledWith(Paymen         tsTable);
     88 +      expect(result).toEqual(mockPaymentsArray);  
     89 +    });
     90 +
     91 +    it("should throw when fetching all payments fa         ils", async () => {
     92 +      const errorMessage = "Connection timeout";  
     93 +      const mockFrom = jest.fn().mockRejectedValue         (new Error(errorMessage));
     94 +
     95 +      (db.select as jest.Mock).mockReturnValue({ f         rom: mockFrom });
     96 +
     97 +      await expect(paymentsService.getpaymentsServ         ice()).rejects.toThrow(
     98 +        `Error: ${errorMessage}`
     99 +      );
    100 +    });
    101 +  });
    102 +
    103 +  describe("getpaymentsByIdService", () => {      
    104 +    it("should return a payment by ID", async () =         > {
    105 +      const paymentId = 1;
    106 +
    107 +      (db.query.PaymentsTable.findFirst as jest.Mo         ck).mockResolvedValue(mockPayment);
    108 +      (eq as jest.Mock).mockReturnValue("mockCondi         tion");
    109 +
    110 +      const result = await paymentsService.getpaym         entsByIdService(paymentId);
    111 +
    112 +      expect(eq).toHaveBeenCalledWith(PaymentsTabl         e.paymentID, paymentId);
    113 +      expect(db.query.PaymentsTable.findFirst).toH         aveBeenCalledWith({
    114 +        where: "mockCondition"
    115 +      });
    116 +      expect(result).toEqual(mockPayment);        
    117 +    });
    118 +
    119 +    it("should return undefined when payment not f         ound", async () => {
    120 +      const paymentId = 999;
    121 +
    122 +      (db.query.PaymentsTable.findFirst as jest.Mo         ck).mockResolvedValue(undefined);
    123 +      (eq as jest.Mock).mockReturnValue("mockCondi         tion");
    124 +
    125 +      const result = await paymentsService.getpaym         entsByIdService(paymentId);
    126 +
    127 +      expect(result).toBeUndefined();
    128 +    });
    129 +
    130 +    it("should throw when fetching by ID fails", a         sync () => {
    131 +      const paymentId = 1;
    132 +      const errorMessage = "Invalid ID";
    133 +
    134 +      (db.query.PaymentsTable.findFirst as jest.Mo         ck).mockRejectedValue(new Error(errorMessage));   
    135 +      (eq as jest.Mock).mockReturnValue("mockCondi         tion");
    136 +
    137 +      await expect(paymentsService.getpaymentsById         Service(paymentId)).rejects.toThrow(
    138 +        `Error: ${errorMessage}`
    139 +      );
    140 +    });
    141 +  });
    142 +
    143 +  describe("updatepaymentsService", () => {       
    144 +    it("should update a payment successfully", asy         nc () => {
    145 +      const paymentId = 1;
    146 +      const updateData = { paymentMethod: "Mpesa" 
         };
    147 +
    148 +      const mockReturning = jest.fn().mockResolved         Value([mockPayment]);
    149 +      const mockWhere = jest.fn().mockReturnValue(         { returning: mockReturning });
    150 +      const mockSet = jest.fn().mockReturnValue({ 
         where: mockWhere });
    151 +
    152 +      (db.update as jest.Mock).mockReturnValue({ s         et: mockSet });
    153 +      (eq as jest.Mock).mockReturnValue("mockCondi         tion");
    154 +
    155 +      const result = await paymentsService.updatep         aymentsService(paymentId, updateData);
    156 +
    157 +      expect(db.update).toHaveBeenCalledWith(Payme         ntsTable);
    158 +      expect(mockSet).toHaveBeenCalledWith(updateD         ata);
    159 +      expect(eq).toHaveBeenCalledWith(PaymentsTabl         e.paymentID, paymentId);
    160 +      expect(mockWhere).toHaveBeenCalledWith("mock         Condition");
    161 +      expect(result).toBe("payment updated success         fully");
    162 +    });
    163 +
    164 +    it("should throw when update fails", async () 
         => {
    165 +      const paymentId = 1;
    166 +      const updateData = { paymentMethod: "Mpesa" 
         };
    167 +      const errorMessage = "Update failed";       
    168 +
    169 +      const mockReturning = jest.fn().mockRejected         Value(new Error(errorMessage));
    170 +      const mockWhere = jest.fn().mockReturnValue(         { returning: mockReturning });
    171 +      const mockSet = jest.fn().mockReturnValue({ 
         where: mockWhere });
    172 +
    173 +      (db.update as jest.Mock).mockReturnValue({ s         et: mockSet });
    174 +      (eq as jest.Mock).mockReturnValue("mockCondi         tion");
    175 +
    176 +      await expect(paymentsService.updatepaymentsS         ervice(paymentId, updateData)).rejects.toThrow(   
    177 +        `Error: ${errorMessage}`
    178 +      );
    179 +    });
    180 +  });
    181 +
    182 +  describe("deletepaymentsService", () => {       
    183 +    it("should delete a payment successfully", asy         nc () => {
    184 +      const paymentId = 1;
    185 +
    186 +      const mockReturning = jest.fn().mockResolved         Value([mockPayment]);
    187 +      const mockWhere = jest.fn().mockReturnValue(         { returning: mockReturning });
    188 +
    189 +      (db.delete as jest.Mock).mockReturnValue({ w         here: mockWhere });
    190 +      (eq as jest.Mock).mockReturnValue("mockCondi         tion");
    191 +
    192 +      const result = await paymentsService.deletep         aymentsService(paymentId);
    193 +
    194 +      expect(db.delete).toHaveBeenCalledWith(Payme         ntsTable);
    195 +      expect(eq).toHaveBeenCalledWith(PaymentsTabl         e.paymentID, paymentId);
    196 +      expect(mockWhere).toHaveBeenCalledWith("mock         Condition");
    197 +      expect(result).toEqual(mockPayment);        
    198 +    });
    199 +
    200 +    it("should throw when deletion fails", async (         ) => {
    201 +      const paymentId = 1;
    202 +      const errorMessage = "Delete failed";       
    203 +
    204 +      const mockReturning = jest.fn().mockRejected         Value(new Error(errorMessage));
    205 +      const mockWhere = jest.fn().mockReturnValue(         { returning: mockReturning });
    206 +
    207 +      (db.delete as jest.Mock).mockReturnValue({ w         here: mockWhere });
    208 +      (eq as jest.Mock).mockReturnValue("mockCondi         tion");
    209 +
    210 +      await expect(paymentsService.deletepaymentsS         ervice(paymentId)).rejects.toThrow(
    211 +        `Error: ${errorMessage}`
    212 +      );
    213 +    });
    214 +
    215 +    it("should return undefined when payment to de         lete is not found", async () => {
    216 +      const paymentId = 999;
    217 +
    218 +      const mockReturning = jest.fn().mockResolved         Value([]);
    219 +      const mockWhere = jest.fn().mockReturnValue(         { returning: mockReturning });
    220 +


    222 +      (eq as jest.Mock).mockReturnVa

    223 +
    224 +      const result = awa

    225 +
    226 +      expect(result).toBeUndefined();
    227 +    });

    229 +});