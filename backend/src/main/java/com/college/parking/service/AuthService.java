package com.college.parking.service;

import com.college.parking.dto.Dtos.AuthResponse;
import com.college.parking.dto.Dtos.LoginRequest;
import com.college.parking.dto.Dtos.RegisterRequest;
import com.college.parking.exception.ApiException;
import com.college.parking.model.Role;
import com.college.parking.model.User;
import com.college.parking.repository.UserRepository;
import com.college.parking.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository users;
    private final PasswordEncoder encoder;
    private final JwtService jwt;

    public AuthResponse register(RegisterRequest req) {
        String email = req.email().trim().toLowerCase();
        if (users.existsByEmail(email)) {
            throw new ApiException(HttpStatus.CONFLICT, "An account with this email already exists");
        }
        User user = users.save(User.builder()
                .name(req.name().trim())
                .email(email)
                .password(encoder.encode(req.password()))
                .role(Role.USER) // self-registration is always a normal user
                .build());
        return toResponse(user);
    }

    public AuthResponse login(LoginRequest req) {
        User user = users.findByEmail(req.email().trim().toLowerCase())
                .filter(u -> encoder.matches(req.password(), u.getPassword()))
                .orElseThrow(() -> new ApiException(HttpStatus.UNAUTHORIZED, "Invalid email or password"));
        return toResponse(user);
    }

    private AuthResponse toResponse(User user) {
        return new AuthResponse(jwt.generateToken(user), user.getName(), user.getEmail(), user.getRole().name());
    }
}
