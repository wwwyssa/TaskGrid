package com.taskgrid.service;

import com.taskgrid.entity.Employee;
import com.taskgrid.entity.Ticket;
import com.taskgrid.repository.EmployeeRepository;
import com.taskgrid.repository.TicketRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Сервис для распределения заявок между сотрудниками
 * Использует алгоритм Load Balancing - назначает заявку сотруднику с меньшим количеством активных задач
 */
@Service
public class TicketDistributionService {

    private final EmployeeRepository employeeRepository;
    private final TicketRepository ticketRepository;
    private volatile long lastAssignedEmployeeId = -1;

    public TicketDistributionService(EmployeeRepository employeeRepository, TicketRepository ticketRepository) {
        this.employeeRepository = employeeRepository;
        this.ticketRepository = ticketRepository;
    }

    /**
     * Находит оптимального сотрудника для назначения новой заявки
     * Выбирает того, у кого меньше всего активных задач на сегодня
     */
    public Employee findBestEmployeeForAssignment() {
        List<Employee> activeEmployees = employeeRepository.findAll()
                .stream()
                .filter(Employee::getActive)
                .sorted((a, b) -> Long.compare(a.getId(), b.getId()))
                .toList();

        if (activeEmployees.isEmpty()) {
            return null;
        }

        // Подсчитываем активные задачи (ASSIGNED + IN_PROGRESS)
        Map<Employee, Long> employeeTaskCount = new HashMap<>();
        long minCount = Long.MAX_VALUE;
        for (Employee employee : activeEmployees) {
            long count = ticketRepository.countActiveWorkloadByEmployeeId(employee.getId());
            employeeTaskCount.put(employee, count);
            if (count < minCount) minCount = count;
        }

        // Кандидаты с минимальной нагрузкой
        final long min = minCount;
        List<Employee> candidates = activeEmployees.stream()
            .filter(e -> employeeTaskCount.getOrDefault(e, 0L) == min)
            .toList();

        // Round-robin среди кандидатов: выбираем следующего после последнего
        if (candidates.isEmpty()) {
            return activeEmployees.get(0);
        }

        int startIndex = 0;
        if (lastAssignedEmployeeId != -1) {
            // Найти индекс последнего сотрудника в общем списке
            int lastIndex = -1;
            for (int i = 0; i < activeEmployees.size(); i++) {
                if (activeEmployees.get(i).getId().equals(lastAssignedEmployeeId)) {
                    lastIndex = i;
                    break;
                }
            }
            startIndex = (lastIndex + 1 + activeEmployees.size()) % activeEmployees.size();
        }

        // Ищем первого кандидата, начиная с startIndex, с обёрткой
        for (int offset = 0; offset < activeEmployees.size(); offset++) {
            int idx = (startIndex + offset) % activeEmployees.size();
            Employee e = activeEmployees.get(idx);
            if (candidates.contains(e)) {
                lastAssignedEmployeeId = e.getId();
                return e;
            }
        }

        // Fallback
        return candidates.get(0);
    }

    /**
     * Находит первый свободный временной слот (часовой интервал) для сотрудника
     */
    public LocalDateTime findFirstFreeSlot(Employee employee) {
        LocalDateTime now = LocalDateTime.now();
        LocalTime currentTime = now.toLocalTime();
        LocalTime startTime = employee.getWorkStartTime();
        LocalTime endTime = employee.getWorkEndTime();

        // Начинаем с текущего часа (если он в рабочее время)
        LocalDateTime searchStart = now;
        if (currentTime.isBefore(startTime)) {
            searchStart = now.withHour(startTime.getHour()).withMinute(0).withSecond(0).withNano(0);
        } else if (currentTime.isAfter(endTime)) {
            // Если уже после рабочего времени, берём завтра в начало
            searchStart = now.plusDays(1)
                    .withHour(startTime.getHour())
                    .withMinute(0)
                    .withSecond(0)
                    .withNano(0);
        } else {
            // Округляем до следующего часа
            searchStart = searchStart.plusHours(1).withMinute(0).withSecond(0).withNano(0);
        }

        // Проверяем каждый часовой слот
        LocalDateTime checkTime = searchStart;
        while (checkTime.toLocalTime().isBefore(endTime)) {
            LocalDateTime slotEnd = checkTime.plusHours(1);
            
            // Проверяем, есть ли уже задача в этом слоте
            List<Ticket> conflictingTickets = ticketRepository.findTicketsByEmployeeAndTimeRange(
                    employee.getId(),
                    checkTime,
                    slotEnd
            );

            if (conflictingTickets.isEmpty()) {
                return checkTime;
            }

            checkTime = checkTime.plusHours(1);
        }

        // Если на сегодня нет свободных слотов, берём завтра в начало рабочего дня
        return now.plusDays(1)
                .withHour(startTime.getHour())
                .withMinute(0)
                .withSecond(0)
                .withNano(0);
    }

    /**
     * Проверяет, свободен ли временной слот для сотрудника
     */
    public boolean isSlotFree(Employee employee, LocalDateTime slotStart) {
        LocalDateTime slotEnd = slotStart.plusHours(1);
        List<Ticket> conflicts = ticketRepository.findTicketsByEmployeeAndTimeRange(
                employee.getId(),
                slotStart,
                slotEnd
        );
        return conflicts.isEmpty();
    }
}
