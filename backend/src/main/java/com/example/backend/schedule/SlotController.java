package com.example.backend.schedule;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/slots")
public class SlotController {

	// 每週固定 12 週的預約，要往後檢查約 15 週，所以一次最多查 120 天
	private static final int MAX_DAYS = 120;

	private final SlotService slotService;

	public SlotController(SlotService slotService) {
		this.slotService = slotService;
	}

	// 例如 GET /api/slots?from=2026-10-12&to=2026-10-18
	@GetMapping
	public List<Slot> list(@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate from,
			@RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate to) {
		if (to.isBefore(from) || ChronoUnit.DAYS.between(from, to) >= MAX_DAYS) {
			throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "日期範圍不正確，一次最多查詢 " + MAX_DAYS + " 天");
		}
		return slotService.getSlots(from, to);
	}

}
