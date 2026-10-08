package com.example.backend.order;

import jakarta.validation.Valid;
import java.net.URI;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

	private final OrderRepository orderRepository;

	public OrderController(OrderRepository orderRepository) {
		this.orderRepository = orderRepository;
	}

	@PostMapping
	public ResponseEntity<Order> create(@Valid @RequestBody OrderRequest request) {
		Order order = orderRepository.create(request);
		return ResponseEntity.created(URI.create("/api/orders/" + order.reference())).body(order);
	}

	@GetMapping("/{reference}")
	public ResponseEntity<Order> get(@PathVariable String reference) {
		return ResponseEntity.of(orderRepository.findByReference(reference));
	}

}
