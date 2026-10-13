package com.college.parking;

import com.college.parking.dto.Dtos.BookingRequest;
import com.college.parking.dto.Dtos.BookingResponse;
import com.college.parking.exception.ApiException;
import com.college.parking.model.ParkingSlot;
import com.college.parking.model.Role;
import com.college.parking.model.User;
import com.college.parking.repository.SlotRepository;
import com.college.parking.repository.UserRepository;
import com.college.parking.service.BookingService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.time.temporal.ChronoUnit;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@ActiveProfiles("test")
@Transactional
class BookingServiceTest {

    @Autowired BookingService bookingService;
    @Autowired SlotRepository slots;
    @Autowired UserRepository users;

    private ParkingSlot slot() {
        return slots.save(ParkingSlot.builder().slotNumber("T-" + System.nanoTime()).zone("T").active(true).build());
    }

    private String user(String email) {
        users.save(User.builder().name("Test").email(email).password("x").role(Role.USER).build());
        return email;
    }

    private static Instant in(long hours) {
        return Instant.now().plus(hours, ChronoUnit.HOURS);
    }

    @Test
    void overlappingBookingOnSameSlotIsRejected() {
        ParkingSlot s = slot();
        String a = user("a@test.edu");
        String b = user("b@test.edu");

        bookingService.create(a, new BookingRequest(s.getId(), "TS09AB1234", in(1), in(3)));

        ApiException ex = assertThrows(ApiException.class,
                () -> bookingService.create(b, new BookingRequest(s.getId(), "TS10CD5678", in(2), in(4))));
        assertEquals(409, ex.getStatus().value());
    }

    @Test
    void backToBackBookingsAreAllowed() {
        ParkingSlot s = slot();
        String a = user("c@test.edu");

        bookingService.create(a, new BookingRequest(s.getId(), "TS09AB1111", in(1), in(2)));
        assertDoesNotThrow(() ->
                bookingService.create(a, new BookingRequest(s.getId(), "TS09AB1111", in(2), in(3))));
    }

    @Test
    void cancelFreesTheSlot() {
        ParkingSlot s = slot();
        String a = user("d@test.edu");

        BookingResponse first = bookingService.create(a, new BookingRequest(s.getId(), "TS09AB2222", in(1), in(3)));
        bookingService.cancel(first.id(), a, false);

        assertDoesNotThrow(() ->
                bookingService.create(a, new BookingRequest(s.getId(), "TS09AB3333", in(1), in(3))));
    }

    @Test
    void otherUsersCannotCancelMyBooking() {
        ParkingSlot s = slot();
        String a = user("e@test.edu");
        String b = user("f@test.edu");

        BookingResponse booking = bookingService.create(a, new BookingRequest(s.getId(), "TS09AB4444", in(1), in(2)));
        ApiException ex = assertThrows(ApiException.class, () -> bookingService.cancel(booking.id(), b, false));
        assertEquals(403, ex.getStatus().value());
    }

    @Test
    void invalidTimesAreRejected() {
        ParkingSlot s = slot();
        String a = user("g@test.edu");

        assertThrows(ApiException.class,
                () -> bookingService.create(a, new BookingRequest(s.getId(), "TS09AB5555", in(2), in(1))));
        assertThrows(ApiException.class,
                () -> bookingService.create(a, new BookingRequest(s.getId(), "TS09AB5555", Instant.now().minus(Duration.ofHours(3)), in(1))));
        assertThrows(ApiException.class,
                () -> bookingService.create(a, new BookingRequest(s.getId(), "TS09AB5555", in(1), in(30))));
    }
}
