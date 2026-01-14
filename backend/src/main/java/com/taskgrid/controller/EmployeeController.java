package com.taskgrid.controller;

import com.taskgrid.dto.EmployeeDTO;
import com.taskgrid.entity.Employee;
import com.taskgrid.repository.EmployeeRepository;
import com.taskgrid.repository.TicketRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/employees")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class EmployeeController {

    private final EmployeeRepository employeeRepository;
    private final TicketRepository ticketRepository;

    public EmployeeController(EmployeeRepository employeeRepository, TicketRepository ticketRepository) {
        this.employeeRepository = employeeRepository;
        this.ticketRepository = ticketRepository;
    }

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<EmployeeDTO>> getAllEmployees() {
        List<EmployeeDTO> employees = employeeRepository.findAll()
                .stream()
                .filter(Employee::getActive)
                .map(emp -> new EmployeeDTO(
                        emp.getId(),
                        emp.getName(),
                        emp.getEmail(),
                        emp.getWorkStartTime(),
                        emp.getWorkEndTime(),
                        (int) ticketRepository.findActiveTicketsByEmployeeId(emp.getId()).size()
                ))
                .toList();
        return ResponseEntity.ok(employees);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<EmployeeDTO> getEmployee(@PathVariable Long id) {
        Employee emp = employeeRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Employee not found"));
        
        EmployeeDTO dto = new EmployeeDTO(
                emp.getId(),
                emp.getName(),
                emp.getEmail(),
                emp.getWorkStartTime(),
                emp.getWorkEndTime(),
                (int) ticketRepository.findActiveTicketsByEmployeeId(emp.getId()).size()
        );
        
        return ResponseEntity.ok(dto);
    }
}
