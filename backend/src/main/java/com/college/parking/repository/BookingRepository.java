package com.college.parking.repository;

import com.college.parking.model.Booking;
import com.college.parking.model.BookingStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.Instant;
import java.util.List;

public interface BookingRepository extends JpaRepository<Booking, Long> {

    @Query("select b from Booking b join fetch b.slot join fetch b.user where b.user.id = :userId order by b.startTime desc")
    List<Booking> findByUser(@Param("userId") Long userId);

    @Query("select b from Booking b join fetch b.slot join fetch b.user order by b.startTime desc")
    List<Booking> findAllWithDetails();

    @Query("select b from Booking b join fetch b.slot join fetch b.user where b.id = :id")
    java.util.Optional<Booking> findByIdWithDetails(@Param("id") Long id);

    /** True if another ACTIVE booking on this slot overlaps [start, end). */
    @Query("""
            select count(b) > 0 from Booking b
            where b.slot.id = :slotId
              and b.status = com.college.parking.model.BookingStatus.ACTIVE
              and b.startTime < :end and b.endTime > :start
            """)
    boolean existsSlotOverlap(@Param("slotId") Long slotId,
                              @Param("start") Instant start,
                              @Param("end") Instant end);

    /** True if the same vehicle already has an ACTIVE booking overlapping [start, end). */
    @Query("""
            select count(b) > 0 from Booking b
            where upper(b.vehicleNumber) = upper(:vehicle)
              and b.status = com.college.parking.model.BookingStatus.ACTIVE
              and b.startTime < :end and b.endTime > :start
            """)
    boolean existsVehicleOverlap(@Param("vehicle") String vehicle,
                                 @Param("start") Instant start,
                                 @Param("end") Instant end);

    /** Ids of all slots that are occupied at any point inside [start, end). */
    @Query("""
            select distinct b.slot.id from Booking b
            where b.status = com.college.parking.model.BookingStatus.ACTIVE
              and b.startTime < :end and b.endTime > :start
            """)
    List<Long> findOccupiedSlotIds(@Param("start") Instant start, @Param("end") Instant end);

    long countByStatusAndEndTimeAfter(BookingStatus status, Instant time);

    boolean existsBySlotIdAndStatusAndEndTimeAfter(Long slotId, BookingStatus status, Instant time);

    @Modifying
    @Query("delete from Booking b where b.slot.id = :slotId")
    void deleteAllBySlotId(@Param("slotId") Long slotId);
}
