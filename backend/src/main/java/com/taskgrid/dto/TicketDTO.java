package com.taskgrid.dto;

import com.taskgrid.entity.Ticket;

import java.time.LocalDateTime;

public class TicketDTO {
    private Long id;
    private String clientName;
    private String description;
    private String clientEmail;
    private String clientPhone;
    private String status;
    private LocalDateTime scheduledTime;
    private LocalDateTime createdAt;
    private Long employeeId;
    private String employeeName;

    public TicketDTO() {
    }

    public TicketDTO(Long id, String clientName, String description, String clientEmail, String clientPhone, String status, LocalDateTime scheduledTime, LocalDateTime createdAt, Long employeeId, String employeeName) {
        this.id = id;
        this.clientName = clientName;
        this.description = description;
        this.clientEmail = clientEmail;
        this.clientPhone = clientPhone;
        this.status = status;
        this.scheduledTime = scheduledTime;
        this.createdAt = createdAt;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getClientName() {
        return clientName;
    }

    public void setClientName(String clientName) {
        this.clientName = clientName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getClientEmail() {
        return clientEmail;
    }

    public void setClientEmail(String clientEmail) {
        this.clientEmail = clientEmail;
    }

    public String getClientPhone() {
        return clientPhone;
    }

    public void setClientPhone(String clientPhone) {
        this.clientPhone = clientPhone;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public LocalDateTime getScheduledTime() {
        return scheduledTime;
    }

    public void setScheduledTime(LocalDateTime scheduledTime) {
        this.scheduledTime = scheduledTime;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public static TicketDTO fromEntity(Ticket ticket) {
        TicketDTO dto = new TicketDTO();
        dto.setId(ticket.getId());
        dto.setClientName(ticket.getClientName());
        dto.setDescription(ticket.getDescription());
        dto.setClientEmail(ticket.getClientEmail());
        dto.setClientPhone(ticket.getClientPhone());
        dto.setStatus(ticket.getStatus().toString());
        dto.setScheduledTime(ticket.getScheduledTime());
        dto.setCreatedAt(ticket.getCreatedAt());
        if (ticket.getEmployee() != null) {
            dto.setEmployeeId(ticket.getEmployee().getId());
            dto.setEmployeeName(ticket.getEmployee().getName());
        }
        return dto;
    }
}
