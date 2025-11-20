package com.banksystem.bank_proxy_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@EnableDiscoveryClient
@SpringBootApplication
public class BankProxyServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(BankProxyServiceApplication.class, args);
	}

}
