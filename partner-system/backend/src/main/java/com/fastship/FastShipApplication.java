package com.fastship;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class FastShipApplication {
    public static void main(String[] args) {
        SpringApplication.run(FastShipApplication.class, args);
        System.out.println("\n========================================================");
        System.out.println("  FASTSHIP EXPRESS BACKEND (SPRING BOOT) SẴN SÀNG!  ");
        System.out.println("   • Port API:  http://localhost:8081/api/v1/shipments");
        System.out.println("   • Database:  MS SQL Server (fastship_db)");
        System.out.println("========================================================\n");
    }
}
