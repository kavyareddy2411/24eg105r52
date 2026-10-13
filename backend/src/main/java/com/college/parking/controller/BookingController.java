package com.college.parking.controller;

import com.college.parking.dto.Dtos.BookingRequest;
import com.college.parking.dto.Dtos.BookingResponse;
import com.college.parking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public BookingResponse create(@Valid @RequestBody BookingRequest req, Authentication auth) {
        return bookingService.create(auth.getName(), req);
    }

    @GetMapping("/my")
    public List<BookingResponse> mine(Authentication auth) {
        return bookingService.mine(auth.getName());
    }

    /** Owner can cancel their own booking; an admin can cancel any booking. */
    @DeleteMapping("/{id}")
    public BookingResponse cancel(@PathVariable Long id, Authentication auth) {
        boolean admin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
        return bookingService.cancel(id, auth.getName(), admin);
    }
}
