package com.govjobvault;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class GovJobVaultApplication {

    public static void main(String[] args) {
        SpringApplication.run(GovJobVaultApplication.class, args);
    }
}
