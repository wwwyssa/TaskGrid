package com.taskgrid.websocket;

import com.taskgrid.dto.TicketDTO;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

@Service
public class WebSocketNotificationService {

    private final SimpMessagingTemplate messagingTemplate;

    public WebSocketNotificationService(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void notifyNewTicket(TicketDTO ticket) {
        messagingTemplate.convertAndSend("/topic/tickets", ticket);
    }

    public void notifyTicketStatusUpdate(TicketDTO ticket) {
        messagingTemplate.convertAndSend("/topic/tickets/status", ticket);
    }

    public void notifyBoardUpdate() {
        messagingTemplate.convertAndSend("/topic/board", "update");
    }
}
