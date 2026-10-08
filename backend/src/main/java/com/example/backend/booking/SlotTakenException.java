package com.example.backend.booking;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

// 時段已被預約。Spring 會把它轉成 409 Conflict 回應
@ResponseStatus(HttpStatus.CONFLICT)
public class SlotTakenException extends RuntimeException {

	public SlotTakenException(String date, String time) {
		super(date + " " + time + " 已被預約");
	}

}
