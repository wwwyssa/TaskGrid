package com.taskgrid.dto;

public class TicketCreateRequest {
    private String clientName;
    private String description;
    private String clientEmail;
    private String clientPhone;

    public TicketCreateRequest() {
    }

    public TicketCreateRequest(String clientName, String description, String clientEmail, String clientPhone) {
        this.clientName = clientName;
        this.description = description;
        this.clientEmail = clientEmail;
        this.clientPhone = clientPhone;
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
}
