package com.example.backend.order;

import jakarta.validation.Valid;
import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;
import java.util.List;

// 對應前端 Cart.jsx 送出的訂單內容
public record OrderRequest(
		@NotNull @Valid Contact contact,
		@NotEmpty @Valid List<Item> items) {

	public record Contact(
			@NotBlank @Size(min = 2, max = 50) String name,
			@NotBlank @Pattern(regexp = "09\\d{8}", message = "手機號碼格式應為 09xxxxxxxx") String phone,
			@Size(max = 500) String note) {
	}

	// TODO: 價格目前相信前端送來的值，之後改成由後端依商品資料計算
	public record Item(
			@NotBlank String productId,
			@NotBlank String name,
			String seriesName,
			@NotBlank String option,
			@Positive int price,
			@Min(1) @Max(99) int qty) {
	}

}
