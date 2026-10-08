package com.example.backend.schedule;

// 回傳給前端的時段狀態。status：open 空堂、taken 已被預約、past 已結束
public record Slot(String date, String time, String endTime, int duration, String status) {
}
