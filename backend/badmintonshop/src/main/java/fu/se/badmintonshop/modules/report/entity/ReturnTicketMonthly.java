package fu.se.badmintonshop.modules.report.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.Immutable;

/** Return & Refund Report: số phiếu đổi/trả theo tháng và loại. Chỉ đọc, map vào VIEW v_return_ticket_monthly trong badminton_shop.sql. */
@Entity
@Immutable
@Table(name = "v_return_ticket_monthly")
@Getter
@NoArgsConstructor
public class ReturnTicketMonthly {

    /** Khóa ghép "yyyy-MM|ticket_type". */
    @Id
    @Column(name = "id", length = 40)
    private String id;

    @Column(name = "`month`", length = 7)
    private String month;

    @Column(name = "ticket_type", length = 20)
    private String ticketType;

    @Column(name = "total_tickets")
    private Integer totalTickets;

    @Column(name = "resolved_tickets")
    private Integer resolvedTickets;

    @Column(name = "rejected_tickets")
    private Integer rejectedTickets;

    @Column(name = "cancelled_tickets")
    private Integer cancelledTickets;
}