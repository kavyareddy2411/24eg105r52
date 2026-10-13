package com.college.parking.service;

import com.college.parking.dto.Dtos.SlotRequest;
import com.college.parking.dto.Dtos.SlotResponse;
import com.college.parking.dto.Dtos.StatsResponse;
import com.college.parking.exception.ApiException;
import com.college.parking.model.BookingStatus;
import com.college.parking.model.ParkingSlot;
import com.college.parking.repository.BookingRepository;
import com.college.parking.repository.SlotRepository;
import com.college.parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.Instant;
import java.util.HashSet;
import java.util.List;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class SlotService {

    private final SlotRepository slots;
    private final BookingRepository bookings;
    private final UserRepository users;

    /** Slots with an "occupied" flag for the requested window (defaults to right now). */
    @Transactional(readOnly = true)
    public List<SlotResponse> list(Instant start, Instant end) {
        Instant from = start != null ? start : Instant.now();
        Instant to = (end != null && end.isAfter(from)) ? end : from.plusSeconds(60);
        Set<Long> occupied = new HashSet<>(bookings.findOccupiedSlotIds(from, to));
        return slots.findAllByOrderByZoneAscSlotNumberAsc().stream()
                .map(s -> new SlotResponse(s.getId(), s.getSlotNumber(), s.getZone(), s.isActive(),
                        occupied.contains(s.getId())))
                .toList();
    }

    @Transactional
    public SlotResponse create(SlotRequest req) {
        String number = req.slotNumber().trim().toUpperCase();
        if (slots.existsBySlotNumberIgnoreCase(number)) {
            throw new ApiException(HttpStatus.CONFLICT, "Slot " + number + " already exists");
        }
        ParkingSlot slot = slots.save(ParkingSlot.builder()
                .slotNumber(number)
                .zone(req.zone().trim().toUpperCase())
                .active(true)
                .build());
        return new SlotResponse(slot.getId(), slot.getSlotNumber(), slot.getZone(), true, false);
    }

    @Transactional
    public SlotResponse toggleActive(Long id) {
        ParkingSlot slot = slots.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Slot not found"));
        slot.setActive(!slot.isActive());
        return new SlotResponse(slot.getId(), slot.getSlotNumber(), slot.getZone(), slot.isActive(), false);
    }

    @Transactional
    public void delete(Long id) {
        ParkingSlot slot = slots.findById(id)
                .orElseThrow(() -> new ApiException(HttpStatus.NOT_FOUND, "Slot not found"));
        if (bookings.existsBySlotIdAndStatusAndEndTimeAfter(id, BookingStatus.ACTIVE, Instant.now())) {
            throw new ApiException(HttpStatus.CONFLICT,
                    "Slot has current or upcoming bookings. Cancel them first, or disable the slot instead.");
        }
        bookings.deleteAllBySlotId(id); // old history only
        slots.delete(slot);
    }

    @Transactional(readOnly = true)
    public StatsResponse stats() {
        Instant now = Instant.now();
        return new StatsResponse(
                slots.count(),
                slots.countByActiveTrue(),
                bookings.findOccupiedSlotIds(now, now.plusSeconds(1)).size(),
                bookings.countByStatusAndEndTimeAfter(BookingStatus.ACTIVE, now),
                users.count());
    }
}
