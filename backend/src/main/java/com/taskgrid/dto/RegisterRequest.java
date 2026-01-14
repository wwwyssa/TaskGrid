package com.taskgrid.dto;

public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String workStartTime;
    private String workEndTime;

    public RegisterRequest() {
    }

    public RegisterRequest(String name, String email, String password, String workStartTime, String workEndTime) {
        this.name = name;
        this.email = email;
        this.password = password;
        this.workStartTime = workStartTime;
        this.workEndTime = workEndTime;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public String getPassword() {
        return password;
    }

    public void setPassword(String password) {
        this.password = password;
    }

    public String getWorkStartTime() {
        return workStartTime;
    }

    public void setWorkStartTime(String workStartTime) {
        this.workStartTime = workStartTime;
    }

    public String getWorkEndTime() {
        return workEndTime;
    }

    public void setWorkEndTime(String workEndTime) {
        this.workEndTime = workEndTime;
    }
}
