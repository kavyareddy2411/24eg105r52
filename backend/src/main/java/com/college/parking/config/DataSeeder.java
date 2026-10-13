package com.college.parking.config;

import com.college.parking.model.ParkingSlot;
import com.college.parking.model.Role;
import com.college.parking.model.User;
import com.college.parking.repository.SlotRepository;
import com.college.parking.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.List;

/** Creates the first admin account and a starter set of parking slots on an empty database. */
@Component
@RequiredArgsConstructor
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);

    private final UserRepository users;
    private final SlotRepository slots;
    private final PasswordEncoder encoder;

    @Value("${app.admin.name}")
    private String adminName;
    @Value("${app.admin.email}")
    private String adminEmail;
    @Value("${app.admin.password}")
    private String adminPassword;

    @Override
    public void run(String... args) {
        String email = adminEmail.trim().toLowerCase();
        if (!users.existsByEmail(email)) {
            users.save(User.builder()
                    .name(adminName)
                    .email(email)
                    .password(encoder.encode(adminPassword))
                    .role(Role.ADMIN)
                    .build());
            log.info("Created admin account: {}", email);
        }

        if (slots.count() == 0) {
            List<ParkingSlot> starter = new ArrayList<>();
            addZone(starter, "A", 8);
            addZone(starter, "B", 8);
            addZone(starter, "C", 4);
            slots.saveAll(starter);
            log.info("Created {} starter parking slots", starter.size());
        }
    }

    private void addZone(List<ParkingSlot> target, String zone, int count) {
        for (int i = 1; i <= count; i++) {
            target.add(ParkingSlot.builder()
                    .slotNumber(String.format("%s-%02d", zone, i))
                    .zone(zone)
                    .active(true)
                    .build());
        }
    }
}
