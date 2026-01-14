package com.taskgrid.dto;

public class AuthResponse {
    private String token;
    private String email;
    private String name;
    private Long employeeId;

    public AuthResponse(String token, String email, String name, Long employeeId) {
        this.token = token;
        this.email = email;
        this.name = name;
        this.employeeId = employeeId;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public Long getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Long employeeId) {
        this.employeeId = employeeId;
    }
}
