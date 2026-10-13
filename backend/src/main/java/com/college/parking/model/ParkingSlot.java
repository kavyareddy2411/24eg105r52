package com.college.parking.model;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "parking_slots")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ParkingSlot {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "slot_number", nullable = false, unique = true, length = 20)
    private String slotNumber;

    @Column(nullable = false, length = 20)
    private String zone;

    /** An inactive slot is closed by the admin and cannot be booked. */
    @Column(nullable = false)
    private boolean active;
}
