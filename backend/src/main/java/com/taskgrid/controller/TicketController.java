package com.taskgrid.controller;

import com.taskgrid.dto.TicketCreateRequest;
import com.taskgrid.dto.TicketDTO;
import com.taskgrid.service.TicketService;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/tickets")
@CrossOrigin(origins = {"http://localhost:4200", "http://localhost:3000"})
public class TicketController {

    private final TicketService ticketService;

    public TicketController(TicketService ticketService) {
        this.ticketService = ticketService;
    }

    @PostMapping
    public ResponseEntity<TicketDTO> createTicket(@RequestBody TicketCreateRequest request) {
        TicketDTO ticket = ticketService.createTicket(request);
        return ResponseEntity.status(HttpStatus.CREATED).body(ticket);
    }

    @GetMapping("/{id}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TicketDTO> getTicket(@PathVariable Long id) {
        TicketDTO ticket = ticketService.getTicket(id);
        return ResponseEntity.ok(ticket);
    }

    @GetMapping("/employee/{employeeId}")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TicketDTO>> getTicketsByEmployee(@PathVariable Long employeeId) {
        List<TicketDTO> tickets = ticketService.getTicketsByEmployee(employeeId);
        return ResponseEntity.ok(tickets);
    }

    @GetMapping
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TicketDTO>> getAllTickets() {
        List<TicketDTO> tickets = ticketService.getAllTickets();
        return ResponseEntity.ok(tickets);
    }

    @GetMapping("/pending")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<List<TicketDTO>> getPendingTickets() {
        List<TicketDTO> tickets = ticketService.getPendingTickets();
        return ResponseEntity.ok(tickets);
    }

    @PutMapping("/{id}/status")
    @PreAuthorize("hasRole('EMPLOYEE')")
    public ResponseEntity<TicketDTO> updateTicketStatus(
            @PathVariable Long id,
            @RequestParam String status) {
        TicketDTO ticket = ticketService.updateTicketStatus(id, status);
        return ResponseEntity.ok(ticket);
    }
}
