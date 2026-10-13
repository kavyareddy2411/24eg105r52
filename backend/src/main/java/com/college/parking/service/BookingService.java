package com.college.parking.service;

import com.college.parking.dto.Dtos.BookingRequest;
import com.college.parking.dto.Dtos.BookingResponse;
import com.college.parking.exception.ApiException;
import com.college.parking.model.Booking;
import com.college.parking.model.BookingStatus;
import com.college.parking.model.ParkingSlot;
import com.college.parking.model.User;
import com.college.parking.repository.BookingRepository;
import com.college.parking.repository.SlotRepository;
import com.college.parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Duration;
import java.time.Instant;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingService {

    private static final Duration MAX_DURATION = Duration.ofHours(24);
    private static final Duration PAST_GRACE = Duration.ofMinutes(5);

    private final BookingRepository bookings;
    private final SlotRepository slots;
    private final UserRepository users;

    @Transactional
    public BookingResponse create(String email, BookingRequest req) {
        Instant now = Instant.now();
        if (!req.endTime().isAfter(req.startTime())) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "End time must be after start time");
        }
        if (req.startTime().isBefore(now.minus(PAST_GRACE))) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "Start time cannot be in the past");
        }
        if (Duration.between(req.startTime(), req.endTime()).compareTo(MAX_DURATION) > 0) {
            throw new ApiException(HttpStatus.BAD_REQUEST, "A booking can be at most 24 hours long");
        }

        User user = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));

        // Row lock: concurrent requests for the same slot wait here, so the conflict check below is reliable.
        ParkingSlot slot = slots.findByIdForUpdate(req.slotId())
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (!slot.isActive()) {
            throw new ApiException(HttpStatus.CONFLICT, "This slot is currently closed for booking");
        }
        if (bookings.existsSlotOverlap(slot.getId(), req.startTime(), req.endTime())) {
            throw new ApiException(HttpStatus.CONFLICT, "Slot " + slot.getSlotNumber() + " is already booked for that time");
        }

        String vehicle = req.vehicleNumber().trim().toUpperCase();
        if (bookings.existsVehicleOverlap(vehicle, req.startTime(), req.endTime())) {
            throw new ApiException(HttpStatus.CONFLICT, "Vehicle " + vehicle + " already has a booking for that time");
        }

        Booking saved = bookings.save(Booking.builder()
                .user(user)
                .slot(slot)
                .vehicleNumber(vehicle)
                .startTime(req.startTime())
                .endTime(req.endTime())
                .status(BookingStatus.ACTIVE)
                .createdAt(now)
                .build());
        return toResponse(saved);
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> mine(String email) {
        User user = users.findByEmail(email)
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "User not found"));
        return bookings.findByUser(user.getId()).stream().map(this::toResponse).toList();
    }

    @Transactional(readOnly = true)
    public List<BookingResponse> all() {
        return bookings.findAllWithDetails().stream().map(this::toResponse).toList();
    }

    @Transactional
    public BookingResponse cancel(Long id, String email, boolean admin) {
        Booking booking = bookings.findByIdWithDetails(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Booking not found"));
        if (!admin && !booking.getUser().getEmail().equalsIgnoreCase(email)) {
            throw new ApiException(HttpStatus.FORBIDDEN, "You can only cancel your own bookings");
        }
        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new ApiException(HttpStatus.CONFLICT, "Booking is already cancelled");
        }
        if (!booking.getEndTime().isAfter(Instant.now())) {
            throw new ApiException(HttpStatus.CONFLICT, "This booking has already finished");
        }
        booking.setStatus(BookingStatus.CANCELLED);
        return toResponse(booking);
    }

    private BookingResponse toResponse(Booking b) {
        String status = b.getStatus() == BookingStatus.CANCELLED ? "CANCELLED"
                : (b.getEndTime().isAfter(Instant.now()) ? "ACTIVE" : "COMPLETED");
        return new BookingResponse(b.getId(), b.getSlot().getId(), b.getSlot().getSlotNumber(), b.getSlot().getZone(),
                b.getVehicleNumber(), b.getStartTime(), b.getEndTime(), status,
                b.getUser().getName(), b.getUser().getEmail());
    }
}
