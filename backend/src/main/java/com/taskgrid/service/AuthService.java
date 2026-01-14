package com.taskgrid.service;

import com.taskgrid.dto.AuthRequest;
import com.taskgrid.dto.AuthResponse;
import com.taskgrid.dto.RegisterRequest;
import com.taskgrid.entity.Employee;
import com.taskgrid.repository.EmployeeRepository;
import com.taskgrid.security.JwtTokenProvider;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.time.LocalTime;

@Service
public class AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    private final EmployeeRepository employeeRepository;
    private final PasswordEncoder passwordEncoder;

    public AuthService(AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider, EmployeeRepository employeeRepository, PasswordEncoder passwordEncoder) {
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
        this.employeeRepository = employeeRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(AuthRequest request) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        Employee employee = (Employee) authentication.getPrincipal();
        String token = jwtTokenProvider.generateToken(employee);

        return new AuthResponse(token, employee.getEmail(), employee.getName(), employee.getId());
    }

    public AuthResponse register(RegisterRequest request) {
        if (employeeRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new RuntimeException("Email already registered");
        }

        Employee employee = new Employee();
        employee.setName(request.getName());
        employee.setEmail(request.getEmail());
        employee.setPassword(passwordEncoder.encode(request.getPassword()));
        employee.setWorkStartTime(LocalTime.parse(request.getWorkStartTime()));
        employee.setWorkEndTime(LocalTime.parse(request.getWorkEndTime()));
        employee.setActive(true);

        employeeRepository.save(employee);

        String token = jwtTokenProvider.generateToken(employee);
        return new AuthResponse(token, employee.getEmail(), employee.getName(), employee.getId());
    }

    public Employee getEmployeeByEmail(String email) {
        return employeeRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
    }
}
