package com.taskgrid.repository;

import com.taskgrid.entity.Ticket;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface TicketRepository extends JpaRepository<Ticket, Long> {
    List<Ticket> findByEmployeeId(Long employeeId);
    
    List<Ticket> findByStatus(Ticket.TicketStatus status);
    
    @Query("SELECT t FROM Ticket t WHERE t.employee.id = ?1 AND t.status = 'ASSIGNED'")
    List<Ticket> findActiveTicketsByEmployeeId(Long employeeId);

    @Query("SELECT COUNT(t) FROM Ticket t WHERE t.employee.id = ?1 AND (t.status = 'ASSIGNED' OR t.status = 'IN_PROGRESS')")
    long countActiveWorkloadByEmployeeId(Long employeeId);
    
    @Query("SELECT t FROM Ticket t WHERE t.employee.id = ?1 AND t.scheduledTime >= ?2 AND t.scheduledTime < ?3")
    List<Ticket> findTicketsByEmployeeAndTimeRange(Long employeeId, LocalDateTime from, LocalDateTime to);
    
    @Query("SELECT t FROM Ticket t WHERE t.status = 'PENDING' ORDER BY t.createdAt ASC")
    List<Ticket> findPendingTicketsOrderedByCreated();
}
