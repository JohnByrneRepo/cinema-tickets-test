import TicketService from '../src/pairtest/TicketService';
import TicketTypeRequest from '../src/pairtest/lib/TicketTypeRequest';
import InvalidPurchaseException from '../src/pairtest/lib/InvalidPurchaseException';

describe('TicketService', () => {
  const paymentServiceMock = {
    makePayment: jest.fn(),
  };

  const seatReservationServiceMock = {
    reserveSeat: jest.fn(),
  };

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should calculate the correct amount for valid ticket purchase requests', () => {
    const ticketService = new TicketService(paymentServiceMock, seatReservationServiceMock);
    const ticketTypeRequests = [
      new TicketTypeRequest('ADULT', 2),
      new TicketTypeRequest('CHILD', 3),
      new TicketTypeRequest('INFANT', 1),
    ];

    const result = ticketService.purchaseTickets(ticketTypeRequests);

    expect(result.totalAmount).toBe(2 * 20 + 3 * 10); // Total amount calculation
    expect(paymentServiceMock.makePayment).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
    expect(seatReservationServiceMock.reserveSeat).toHaveBeenCalledWith(expect.any(Number), expect.any(Number));
  });

  it('should reject invalid ticket purchase requests with no tickets', () => {
    const ticketService = new TicketService(paymentServiceMock, seatReservationServiceMock);
    const ticketTypeRequests = [];

    expect(() => ticketService.purchaseTickets(ticketTypeRequests)).toThrow(InvalidPurchaseException);
    expect(paymentServiceMock.makePayment).not.toHaveBeenCalled();
    expect(seatReservationServiceMock.reserveSeat).not.toHaveBeenCalled();
  });

  it('should reject invalid ticket purchase requests with too many tickets', () => {
    const ticketService = new TicketService(paymentServiceMock, seatReservationServiceMock);
    const ticketTypeRequests = Array.from({ length: 21 }, () => new TicketTypeRequest('ADULT', 1));

    expect(() => ticketService.purchaseTickets(ticketTypeRequests)).toThrow(InvalidPurchaseException);
    expect(paymentServiceMock.makePayment).not.toHaveBeenCalled();
    expect(seatReservationServiceMock.reserveSeat).not.toHaveBeenCalled();
  });

  it('should reject invalid ticket purchase requests without an adult ticket', () => {
    const ticketService = new TicketService(paymentServiceMock, seatReservationServiceMock);
    const ticketTypeRequests = [
      new TicketTypeRequest('CHILD', 1),
      new TicketTypeRequest('INFANT', 1),
    ];

    expect(() => ticketService.purchaseTickets(ticketTypeRequests)).toThrow(InvalidPurchaseException);
    expect(paymentServiceMock.makePayment).not.toHaveBeenCalled();
    expect(seatReservationServiceMock.reserveSeat).not.toHaveBeenCalled();
  });
});
