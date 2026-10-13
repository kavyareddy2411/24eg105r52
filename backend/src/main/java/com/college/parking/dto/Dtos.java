package com.college.parking.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import java.time.Instant;

public final class Dtos {

    private Dtos() {
    }

    public record RegisterRequest(
            @NotBlank(message = "Name is required") @Size(max = 100) String name,
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") @Size(max = 150) String email,
            @NotBlank(message = "Password is required") @Size(min = 6, max = 100, message = "Password must be 6-100 characters") String password) {
    }

    public record LoginRequest(
            @NotBlank(message = "Email is required") @Email(message = "Enter a valid email") String email,
            @NotBlank(message = "Password is required") String password) {
    }

    public record AuthResponse(String token, String name, String email, String role) {
    }

    public record SlotRequest(
            @NotBlank(message = "Slot number is required") @Size(max = 20) String slotNumber,
            @NotBlank(message = "Zone is required") @Size(max = 20) String zone) {
    }

    public record SlotResponse(Long id, String slotNumber, String zone, boolean active, boolean occupied) {
    }

    public record BookingRequest(
            @NotNull(message = "Slot is required") Long slotId,
            @NotBlank(message = "Vehicle number is required")
            @Pattern(regexp = "^[A-Za-z0-9 -]{4,15}$", message = "Vehicle number must be 4-15 letters/digits") String vehicleNumber,
            @NotNull(message = "Start time is required") Instant startTime,
            @NotNull(message = "End time is required") Instant endTime) {
    }

    /** status is one of ACTIVE, COMPLETED, CANCELLED. */
    public record BookingResponse(Long id, Long slotId, String slotNumber, String zone, String vehicleNumber,
                                  Instant startTime, Instant endTime, String status,
                                  String userName, String userEmail) {
    }

    public record StatsResponse(long totalSlots, long activeSlots, long occupiedNow,
                                long activeBookings, long totalUsers) {
    }
}
