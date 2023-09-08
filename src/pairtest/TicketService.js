import TicketTypeRequest from './lib/TicketTypeRequest.js';
import InvalidPurchaseException from './lib/InvalidPurchaseException.js';

export default class TicketService {
  constructor(paymentService, seatReservationService) {
    this.paymentService = paymentService;
    this.seatReservationService = seatReservationService;
  }

  purchaseTickets(ticketTypeRequests) {
    // Check if the total number of tickets requested is within the limit
    if (ticketTypeRequests.length === 0 || ticketTypeRequests.length > 20) {
      throw new InvalidPurchaseException('Invalid ticket purchase request');
    }

    let totalAmount = 0;
    let totalAdultTickets = 0;

    for (const request of ticketTypeRequests) {
      const type = request.getTicketType();
      const noOfTickets = request.getNoOfTickets();

      if (type === 'ADULT') {
        totalAmount += noOfTickets * 20; // Adult ticket price
        totalAdultTickets += noOfTickets;
      } else if (type === 'CHILD') {
        totalAmount += noOfTickets * 10; // Child ticket price
      } else if (type === 'INFANT') {
        // Infants do not have a price
      } else {
        throw new InvalidPurchaseException('Invalid ticket type');
      }
    }

    // Check if there are infants without adults
    if (totalAdultTickets === 0) {
      throw new InvalidPurchaseException('Child or Infant tickets cannot be purchased without an Adult ticket');
    }

    // Make a payment request to the TicketPaymentService
    const accountId = 123; // Replace with the actual account ID
    this.paymentService.makePayment(accountId, totalAmount);

    // Calculate the number of seats to reserve
    const totalSeatsToReserve = ticketTypeRequests.reduce(
      (total, request) => total + request.getNoOfTickets(),
      0
    );

    // Make a seat reservation request to the SeatReservationService
    this.seatReservationService.reserveSeat(accountId, totalSeatsToReserve);

    // Return the total amount and number of seats reserved
    return { totalAmount, totalSeatsReserved: totalSeatsToReserve };
  }
}

// Example usage:
const paymentService = {
  makePayment: (accountId, totalAmount) => {
    if (!Number.isInteger(accountId)) {
      throw new TypeError('accountId must be an integer');
    }

    if (!Number.isInteger(totalAmount)) {
      throw new TypeError('totalAmount must be an integer');
    }

    console.log(`Payment of £${totalAmount} successful for account ID ${accountId}`);
  }
};

// Simulate SeatReservationService
class SeatReservationService {
  reserveSeat(accountId, totalSeatsToAllocate) {
    if (!Number.isInteger(accountId)) {
      throw new TypeError('accountId must be an integer');
    }

    if (!Number.isInteger(totalSeatsToAllocate)) {
      throw new TypeError('totalSeatsToAllocate must be an integer');
    }

    console.log(`Reserved ${totalSeatsToAllocate} seats for account ID ${accountId}`);
  }
}

const seatReservationService = new SeatReservationService();
const ticketService = new TicketService(paymentService, seatReservationService);

try {
  const ticketTypeRequests = [
    new TicketTypeRequest('ADULT', 2),
    new TicketTypeRequest('CHILD', 3),
    new TicketTypeRequest('INFANT', 1),
  ];

  const { totalAmount, totalSeatsReserved } = ticketService.purchaseTickets(ticketTypeRequests);
  console.log(`Total amount: £${totalAmount}`);
  console.log(`Total seats reserved: ${totalSeatsReserved}`);
} catch (error) {
  if (error instanceof InvalidPurchaseException) {
    console.error(`Invalid Purchase Error: ${error.message}`);
  } else {
    console.error(`Error: ${error.message}`);
  }
}
