package com.govjobvault.dto;

import com.govjobvault.enums.Role;
import lombok.*;

@Getter @Setter @NoArgsConstructor @AllArgsConstructor @Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String email;
    private String phone;
    private Role role;
}
