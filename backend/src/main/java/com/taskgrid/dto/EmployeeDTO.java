package com.taskgrid.dto;

import java.time.LocalTime;

public class EmployeeDTO {
    private Long id;
    private String name;
    private String email;
    private LocalTime workStartTime;
    private LocalTime workEndTime;
    private Integer activeTicketsCount;

    public EmployeeDTO() {
    }

    public EmployeeDTO(Long id, String name, String email, LocalTime workStartTime, LocalTime workEndTime, Integer activeTicketsCount) {
        this.id = id;
        this.name = name;
        this.email = email;
        this.workStartTime = workStartTime;
        this.workEndTime = workEndTime;
        this.activeTicketsCount = activeTicketsCount;
    }

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
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

    public LocalTime getWorkStartTime() {
        return workStartTime;
    }

    public void setWorkStartTime(LocalTime workStartTime) {
        this.workStartTime = workStartTime;
    }

    public LocalTime getWorkEndTime() {
        return workEndTime;
    }

    public void setWorkEndTime(LocalTime workEndTime) {
        this.workEndTime = workEndTime;
    }

    public Integer getActiveTicketsCount() {
        return activeTicketsCount;
    }

    public void setActiveTicketsCount(Integer activeTicketsCount) {
        this.activeTicketsCount = activeTicketsCount;
    }
}
