package com.taskgrid.service;

import com.taskgrid.dto.TicketCreateRequest;
import com.taskgrid.dto.TicketDTO;
import com.taskgrid.entity.Employee;
import com.taskgrid.entity.Ticket;
import com.taskgrid.repository.EmployeeRepository;
import com.taskgrid.repository.TicketRepository;
import com.taskgrid.websocket.WebSocketNotificationService;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class TicketService {

    private final TicketRepository ticketRepository;
    private final EmployeeRepository employeeRepository;
    private final TicketDistributionService distributionService;
    private final WebSocketNotificationService webSocketNotificationService;

    public TicketService(TicketRepository ticketRepository, EmployeeRepository employeeRepository, TicketDistributionService distributionService, WebSocketNotificationService webSocketNotificationService) {
        this.ticketRepository = ticketRepository;
        this.employeeRepository = employeeRepository;
        this.distributionService = distributionService;
        this.webSocketNotificationService = webSocketNotificationService;
    }

    @Transactional
    public TicketDTO createTicket(TicketCreateRequest request) {
        // Create ticket
        Ticket ticket = new Ticket();
        ticket.setClientName(request.getClientName());
        ticket.setDescription(request.getDescription());
        ticket.setClientEmail(request.getClientEmail());
        ticket.setClientPhone(request.getClientPhone());
        ticket.setStatus(Ticket.TicketStatus.PENDING);

        // Auto-assign to employee
        Employee assignedEmployee = distributionService.findBestEmployeeForAssignment();
        if (assignedEmployee != null) {
            ticket.setEmployee(assignedEmployee);
            ticket.setScheduledTime(distributionService.findFirstFreeSlot(assignedEmployee));
            ticket.setStatus(Ticket.TicketStatus.ASSIGNED);
        }

        Ticket savedTicket = ticketRepository.save(ticket);
        TicketDTO ticketDTO = TicketDTO.fromEntity(savedTicket);
        
        // Notify all clients via WebSocket
        webSocketNotificationService.notifyNewTicket(ticketDTO);
        webSocketNotificationService.notifyBoardUpdate();
        
        return ticketDTO;
    }

    public TicketDTO getTicket(Long id) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        return TicketDTO.fromEntity(ticket);
    }

    public List<TicketDTO> getTicketsByEmployee(Long employeeId) {
        return ticketRepository.findByEmployeeId(employeeId)
                .stream()
                .map(TicketDTO::fromEntity)
                .toList();
    }

    public List<TicketDTO> getAllTickets() {
        return ticketRepository.findAll()
                .stream()
                .map(TicketDTO::fromEntity)
                .toList();
    }

    @Transactional
    public TicketDTO updateTicketStatus(Long id, String status) {
        Ticket ticket = ticketRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Ticket not found"));
        
        ticket.setStatus(Ticket.TicketStatus.valueOf(status));
        
        if (status.equals("COMPLETED")) {
            ticket.setCompletedAt(LocalDateTime.now());
        }
        
        Ticket updatedTicket = ticketRepository.save(ticket);
        TicketDTO ticketDTO = TicketDTO.fromEntity(updatedTicket);
        
        // Notify all clients via WebSocket
        webSocketNotificationService.notifyTicketStatusUpdate(ticketDTO);
        webSocketNotificationService.notifyBoardUpdate();
        
        return ticketDTO;
    }

    public List<TicketDTO> getPendingTickets() {
        return ticketRepository.findPendingTicketsOrderedByCreated()
                .stream()
                .map(TicketDTO::fromEntity)
                .toList();
    }
}
