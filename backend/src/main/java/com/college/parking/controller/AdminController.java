package com.college.parking.controller;

import com.college.parking.dto.Dtos.BookingResponse;
import com.college.parking.dto.Dtos.SlotRequest;
import com.college.parking.dto.Dtos.SlotResponse;
import com.college.parking.dto.Dtos.StatsResponse;
import com.college.parking.service.BookingService;
import com.college.parking.service.SlotService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** Everything under /api/admin requires the ADMIN role (see SecurityConfig). */
@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
public class AdminController {

    private final SlotService slotService;
    private final BookingService bookingService;

    @GetMapping("/stats")
    public StatsResponse stats() {
        return slotService.stats();
    }

    @GetMapping("/bookings")
    public List<BookingResponse> bookings() {
        return bookingService.all();
    }

    @PostMapping("/slots")
    @ResponseStatus(HttpStatus.CREATED)
    public SlotResponse addSlot(@Valid @RequestBody SlotRequest req) {
        return slotService.create(req);
    }

    @PatchMapping("/slots/{id}/toggle")
    public SlotResponse toggleSlot(@PathVariable Long id) {
        return slotService.toggleActive(id);
    }

    @DeleteMapping("/slots/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteSlot(@PathVariable Long id) {
        slotService.delete(id);
    }
}
