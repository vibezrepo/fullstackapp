package com.cnx.backend.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "orders")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class Order {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    // address fields copied from AddressDto
    private String addressName;
    private String addressStreet;
    private String addressCity;
    private String addressState;
    private String addressZip;
    private String addressCountry;

    private String paymentMethod;

    // store only last4 and expiry for card
    private String cardLast4;
    private String cardExpiry;

    @Column(name = "created_at")
    private LocalDateTime createdAt = LocalDateTime.now();

    // Optional scheduling dates (stored as local date, no time zone)
    @Column(name = "pick_date")
    private LocalDate pickDate;

    @Column(name = "delivery_date")
    private LocalDate deliveryDate;

    // Invoice date is assigned when order is placed (server-side)
    @Column(name = "invoice_date")
    private LocalDateTime invoiceDate;

    @Enumerated(EnumType.STRING)
    @Column(name = "status")
    private OrderStatus status = OrderStatus.PENDING;

    @OneToMany(mappedBy = "order", cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    private List<OrderItem> items = new ArrayList<>();

    public Double getTotalPrice() {
        return items.stream()
                .mapToDouble(OrderItem::getSubtotal)
                .sum();
    }
}
