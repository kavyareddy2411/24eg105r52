package com.college.parking.repository;

import com.college.parking.model.ParkingSlot;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface SlotRepository extends JpaRepository<ParkingSlot, Long> {

    boolean existsBySlotNumberIgnoreCase(String slotNumber);

    List<ParkingSlot> findAllByOrderByZoneAscSlotNumberAsc();

    long countByActiveTrue();

    /**
     * Locks the slot row until the transaction ends, so two people booking the same
     * slot at the same moment are processed one after the other (no double booking).
     */
    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("select s from ParkingSlot s where s.id = :id")
    Optional<ParkingSlot> findByIdForUpdate(@Param("id") Long id);
}
